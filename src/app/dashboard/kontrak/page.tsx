"use client";
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatRupiah, formatDate } from "@/lib/format";
import {
  FileText,
  Plus,
  Calendar,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  BedDouble,
} from "lucide-react";

interface Lease {
  id: string;
  startDate: string;
  endDate: string;
  billingCycle: string;
  rentAmount: number;
  depositAmount: number;
  status: string;
  notes?: string;
  tenant: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  room: {
    id: string;
    roomNumber: string;
    roomType: {
      name: string;
      basePrice: number;
    };
  };
}

interface TenantOption {
  id: string;
  name: string;
  email: string;
}

interface RoomOption {
  id: string;
  roomNumber: string;
  status: string;
  roomType: {
    name: string;
    basePrice: number;
    deposit: number;
  };
}

export default function DashboardKontrakPage() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [availableRooms, setAvailableRooms] = useState<RoomOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal New Lease
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadData = () => {
    Promise.all([
      fetch("/api/leases").then((r) => r.json()),
      fetch("/api/tenants").then((r) => r.json()),
      fetch("/api/rooms?status=AVAILABLE").then((r) => r.json()),
    ])
      .then(([lData, tData, rData]) => {
        if (lData.leases) setLeases(lData.leases);
        if (tData.tenants) setTenants(tData.tenants);
        if (rData.rooms) setAvailableRooms(rData.rooms);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    // Default dates: today to +1 month
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    setStartDate(now.toISOString().split("T")[0]);
    setEndDate(nextMonth.toISOString().split("T")[0]);
  }, []);

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId);
    const room = availableRooms.find((r) => r.id === roomId);
    if (room) {
      setRentAmount(room.roomType.basePrice.toString());
      setDepositAmount(room.roomType.deposit.toString());
    }
  };

  const handleCreateLease = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/leases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: selectedTenantId,
          roomId: selectedRoomId,
          startDate,
          endDate,
          rentAmount: parseFloat(rentAmount),
          depositAmount: depositAmount ? parseFloat(depositAmount) : 0,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat kontrak");

      setIsNewModalOpen(false);
      loadData();
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
      else setErrorMsg("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  const handleCheckOut = async (leaseId: string, roomNumber: string, tenantName: string) => {
    if (!confirm(`Konfirmasi Check-out untuk ${tenantName} (Kamar ${roomNumber})?\nKamar akan otomatis kembali berstatus TERSEDIA.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/leases/${leaseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TERMINATE" }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Gagal check-out");
        return;
      }
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Manajemen Kontrak Sewa (Lease)</h1>
            <p className="text-xs text-slate-500 mt-1">
              Catatan perjanjian sewa aktif, masa berlaku sewa, dan proses check-out kamar.
            </p>
          </div>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Buat Kontrak Sewa Baru</span>
          </button>
        </div>

        {/* Leases Table */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : leases.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              Belum ada data kontrak sewa yang tercatat.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Penyewa</th>
                    <th className="px-6 py-4">Kamar</th>
                    <th className="px-6 py-4">Periode Sewa</th>
                    <th className="px-6 py-4">Biaya / Bulan</th>
                    <th className="px-6 py-4">Deposit</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {leases.map((lease) => {
                    const isActive = lease.status === "ACTIVE";
                    return (
                      <tr key={lease.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{lease.tenant.name}</p>
                          <p className="text-[11px] text-slate-400">{lease.tenant.phone || lease.tenant.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900">
                            Kamar {lease.room.roomNumber}
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            {lease.room.roomType.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span>{formatDate(lease.startDate)}</span>
                          <span className="text-slate-400 block text-[11px]">
                            s/d {formatDate(lease.endDate)}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {formatRupiah(lease.rentAmount)}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {formatRupiah(lease.depositAmount)}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={lease.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isActive && (
                            <button
                              onClick={() => handleCheckOut(lease.id, lease.room.roomNumber, lease.tenant.name)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                              title="Proses Check-out"
                            >
                              <LogOut className="h-3.5 w-3.5" />
                              <span>Check-Out</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Buat Kontrak Baru */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Buat Kontrak Sewa Baru"
        description="Pilih penyewa dan tetapkan kamar kosong yang akan ditempati."
      >
        <form onSubmit={handleCreateLease} className="space-y-4 pt-1">
          {errorMsg && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Pilih Penghuni Kost *
            </label>
            <select
              required
              value={selectedTenantId}
              onChange={(e) => setSelectedTenantId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
            >
              <option value="">-- Pilih Penyewa --</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Pilih Kamar Kosong (Tersedia) *
            </label>
            <select
              required
              value={selectedRoomId}
              onChange={(e) => handleRoomSelect(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
            >
              <option value="">-- Pilih Kamar --</option>
              {availableRooms.map((r) => (
                <option key={r.id} value={r.id}>
                  Kamar {r.roomNumber} - {r.roomType.name} ({formatRupiah(r.roomType.basePrice)}/bln)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Tanggal Mulai Sewa *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Tanggal Akhir Kontrak *
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Tarif Sewa Disepakati (Rp) *
              </label>
              <input
                type="number"
                required
                value={rentAmount}
                onChange={(e) => setRentAmount(e.target.value)}
                placeholder="1800000"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Deposit Jaminan Awal (Rp)
              </label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="500000"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Catatan Perjanjian (Opsional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Misal: Pembayaran per 1 bulan di muka..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsNewModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-emerald-600 px-6 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {saving ? "Membuat..." : "Simpan Kontrak & Terbitkan Tagihan"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
