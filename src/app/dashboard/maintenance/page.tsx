"use client";
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatDate, formatRupiah } from "@/lib/format";
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit,
  User,
  Image as ImageIcon,
} from "lucide-react";

interface Ticket {
  id: string;
  category: string;
  title: string;
  description: string;
  priority: string;
  status: "REPORTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  photo?: string;
  cost?: number;
  repairNotes?: string;
  createdAt: string;
  resolvedAt?: string;
  room: {
    roomNumber: string;
    roomType: { name: string };
  };
  tenant: {
    name: string;
    phone?: string;
  };
}

export default function DashboardMaintenancePage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // Edit modal
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [status, setStatus] = useState<"REPORTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED">("REPORTED");
  const [cost, setCost] = useState("");
  const [repairNotes, setRepairNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const loadTickets = () => {
    fetch("/api/maintenance")
      .then((res) => res.json())
      .then((data) => {
        if (data.tickets) setTickets(data.tickets);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleOpenEdit = (t: Ticket) => {
    setSelectedTicket(t);
    setStatus(t.status);
    setCost(t.cost ? t.cost.toString() : "");
    setRepairNotes(t.repairNotes || "");
    setModalOpen(true);
  };

  const handleSaveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/maintenance/${selectedTicket.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          cost: cost ? parseFloat(cost) : 0,
          repairNotes,
        }),
      });

      if (res.ok) {
        setModalOpen(false);
        loadTickets();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter === "ALL") return true;
    return t.status === statusFilter;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Manajemen Perbaikan & Keluhan</h1>
            <p className="text-xs text-slate-500 mt-1">
              Pantau laporan kendala fasilitas dari penghuni kost, tugaskan teknisi, dan catat realisasi biaya servis.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Filter:</span>
            {["ALL", "REPORTED", "IN_PROGRESS", "COMPLETED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${statusFilter === st ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
              >
                {st === "ALL" ? "Semua" : st === "REPORTED" ? "Dilaporkan" : st === "IN_PROGRESS" ? "Diproses" : "Selesai"}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickets.map((t) => (
            <div
              key={t.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {t.category} • Kamar {t.room?.roomNumber}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">{t.title}</h3>
                  </div>
                  <StatusBadge status={t.status} />
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <User className="h-3.5 w-3.5" />
                  <span>Pelapor: <b>{t.tenant.name}</b></span>
                </div>

                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  {t.description}
                </p>

                {t.photo && (
                  <div className="mt-3">
                    <a
                      href={t.photo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:underline"
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                      <span>Lihat Foto Kerusakan</span>
                    </a>
                  </div>
                )}

                {t.repairNotes && (
                  <div className="mt-3 rounded-2xl bg-emerald-50/70 p-3 border border-emerald-100 text-xs text-emerald-900">
                    <span className="font-bold text-[10px] uppercase text-emerald-700 block">
                      Catatan Penanganan:
                    </span>
                    <p className="mt-0.5">{t.repairNotes}</p>
                    {t.cost ? (
                      <p className="mt-1 font-bold text-emerald-800">
                        Biaya: {formatRupiah(t.cost)}
                      </p>
                    ) : null}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-slate-400">Prioritas:</span>
                  <StatusBadge status={t.priority} />
                </div>

                <button
                  onClick={() => handleOpenEdit(t)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>Update Status</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Update Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Update Status Perbaikan"
        description={`Kamar ${selectedTicket?.room.roomNumber} - ${selectedTicket?.title}`}
      >
        <form onSubmit={handleSaveTicket} className="space-y-4 pt-1">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Status Pengerjaan *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "REPORTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED")}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
            >
              <option value="REPORTED">Dilaporkan (Menunggu Teknisi)</option>
              <option value="IN_PROGRESS">Sedang Dikerjakan</option>
              <option value="COMPLETED">Selesai Diperbaiki</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Biaya Perbaikan Realisasi (Rp, otomatis masuk ke pengeluaran)
            </label>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="Contoh: 75000"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Catatan Penanganan / Teknisi
            </label>
            <textarea
              rows={3}
              value={repairNotes}
              onChange={(e) => setRepairNotes(e.target.value)}
              placeholder="Contoh: Telah diganti seal karet wastafel baru..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-emerald-600 px-6 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
