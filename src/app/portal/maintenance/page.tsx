"use client";
import React, { useState, useEffect } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/format";
import {
  Wrench,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Check,
} from "lucide-react";

interface Ticket {
  id: string;
  category: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  photo?: string;
  repairNotes?: string;
  cost?: number;
  createdAt: string;
  resolvedAt?: string;
  room: {
    roomNumber: string;
  };
}

export default function TenantMaintenancePage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userRoomId, setUserRoomId] = useState<string>("");

  // Form State
  const [category, setCategory] = useState("OTHER");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [photo, setPhoto] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        const activeLease = data?.user?.leases?.[0];
        if (activeLease) {
          setUserRoomId(activeLease.roomId || activeLease.room?.id);
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userRoomId) {
      setErrorMsg("Anda belum memiliki kamar aktif untuk mengajukan komplain.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: userRoomId,
          category,
          title,
          description,
          priority,
          photo: photo || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat laporan keluhan");
      }

      setSuccessMsg("Laporan perbaikan berhasil diajukan! Teknisi akan segera mengecek.");
      setTitle("");
      setDescription("");
      setPhoto("");
      loadTickets();
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg("");
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
      else setErrorMsg("Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Pusat Keluhan & Perbaikan</h1>
            <p className="text-xs text-slate-500 mt-1">
              Laporkan kerusakan fasilitas kamar kost Anda dan pantau proses pengerjaannya.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Ajukan Keluhan Baru</span>
          </button>
        </div>

        {/* Tickets Grid */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-32 rounded-3xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center max-w-md mx-auto my-6">
            <Wrench className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">Tidak Ada Keluhan Aktif</h4>
            <p className="text-xs text-slate-500 mt-1">
              Jika ada kendala AC, keran bocor, atau kelistrikan di kamar Anda, silakan buat laporan baru.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Kategori: {t.category} • Kamar {t.room?.roomNumber}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{t.title}</h3>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>

                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    {t.description}
                  </p>

                  {/* Photo attachment preview if available */}
                  {t.photo && (
                    <div className="mt-3">
                      <a
                        href={t.photo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 hover:underline"
                      >
                        <ImageIcon className="h-3.5 w-3.5" />
                        <span>Lihat Lampiran Foto Kendala</span>
                      </a>
                    </div>
                  )}

                  {/* Repair notes if present */}
                  {t.repairNotes && (
                    <div className="mt-3 rounded-2xl bg-emerald-50 p-3 border border-emerald-100 text-xs text-emerald-800">
                      <span className="font-bold block text-[10px] uppercase text-emerald-600">
                        Catatan Teknisi / Staff:
                      </span>
                      <p className="mt-0.5">{t.repairNotes}</p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Diajukan: {formatDate(t.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Prioritas:</span>
                    <StatusBadge status={t.priority} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setErrorMsg("");
          setSuccessMsg("");
        }}
        title="Ajukan Keluhan Perbaikan"
        description="Jelaskan kendala fasilitas kamar kost agar teknisi kami dapat segera menangani."
      >
        {successMsg ? (
          <div className="py-6 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mx-auto">
              <Check className="h-6 w-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">{successMsg}</h4>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {errorMsg && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Kategori Kerusakan *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="AIR_CONDITIONER">AC / Pendingin</option>
                  <option value="PLUMBING">Kamar Mandi / Pipa / Keran</option>
                  <option value="ELECTRICAL">Listrik & Lampu</option>
                  <option value="FURNITURE">Perabotan (Kasur/Lemari/Meja)</option>
                  <option value="CLEANING">Kebersihan</option>
                  <option value="OTHER">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tingkat Urgensi *
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="LOW">Rendah (Bisa kapan saja)</option>
                  <option value="MEDIUM">Sedang (Dalam 1-2 hari)</option>
                  <option value="HIGH">Tinggi (Hari ini)</option>
                  <option value="URGENT">Mendesak (Segera)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Judul Keluhan Singkat *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Misal: Keran wastafel bocor / Lampu kamar mati"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Deskripsi Kendala *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan detail kendala, bagian yang rusak, dan kapan mulai terjadi..."
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Link Foto Kendala (Opsional)
              </label>
              <input
                type="text"
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
                placeholder="Contoh: https://images.unsplash.com/... atau URL foto"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                {submitting ? "Mengirim..." : "Kirim Laporan"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </PortalLayout>
  );
}
