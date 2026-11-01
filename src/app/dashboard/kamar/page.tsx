"use client";
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatRupiah } from "@/lib/format";
import {
  BedDouble,
  Plus,
  Edit,
  Trash2,
  Filter,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Search,
} from "lucide-react";

interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
  customPrice?: number;
  notes?: string;
  roomType: {
    id: string;
    name: string;
    basePrice: number;
  };
  leases?: Array<{
    tenant: { name: string; phone?: string };
  }>;
}

interface RoomType {
  id: string;
  name: string;
  basePrice: number;
}

export default function DashboardKamarPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [propertyId, setPropertyId] = useState("");
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [floorFilter, setFloorFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomNumber, setRoomNumber] = useState("");
  const [floor, setFloor] = useState(1);
  const [roomTypeId, setRoomTypeId] = useState("");
  const [status, setStatus] = useState<"AVAILABLE" | "OCCUPIED" | "MAINTENANCE">("AVAILABLE");
  const [customPrice, setCustomPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadData = () => {
    Promise.all([
      fetch("/api/rooms").then((r) => r.json()),
      fetch("/api/room-types").then((r) => r.json()),
      fetch("/api/properties").then((r) => r.json()),
    ])
      .then(([rData, tData, pData]) => {
        if (rData.rooms) setRooms(rData.rooms);
        if (tData.roomTypes) setRoomTypes(tData.roomTypes);
        if (pData.property?.id) setPropertyId(pData.property.id);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setRoomNumber("");
    setFloor(1);
    setRoomTypeId(roomTypes[0]?.id || "");
    setStatus("AVAILABLE");
    setCustomPrice("");
    setNotes("");
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (r: Room) => {
    setEditingRoom(r);
    setRoomNumber(r.roomNumber);
    setFloor(r.floor);
    setRoomTypeId(r.roomType.id);
    setStatus(r.status);
    setCustomPrice(r.customPrice ? r.customPrice.toString() : "");
    setNotes(r.notes || "");
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleQuickStatusChange = async (roomId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (roomId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kamar ini?")) return;
    try {
      const res = await fetch(`/api/rooms/${roomId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Gagal menghapus kamar");
        return;
      }
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");

    try {
      const payload = {
        propertyId,
        roomTypeId,
        roomNumber,
        floor: Number(floor),
        status,
        customPrice: customPrice ? parseFloat(customPrice) : null,
        notes: notes || null,
      };

      const url = editingRoom ? `/api/rooms/${editingRoom.id}` : "/api/rooms";
      const method = editingRoom ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan data kamar");

      setIsModalOpen(false);
      loadData();
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
      else setErrorMsg("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  const filteredRooms = rooms.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (floorFilter !== "ALL" && r.floor.toString() !== floorFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNum = r.roomNumber.toLowerCase().includes(q);
      const matchType = r.roomType.name.toLowerCase().includes(q);
      const matchTenant = r.leases?.[0]?.tenant.name.toLowerCase().includes(q);
      if (!matchNum && !matchType && !matchTenant) return false;
    }
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Manajemen Kamar Kost</h1>
            <p className="text-xs text-slate-500 mt-1">
              Kelola nomor kamar fisik, status ketersediaan, dan penetapan tarif sewa.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Kamar Baru</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nomor kamar, tipe, atau penghuni..."
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
            >
              <option value="ALL">Semua Status ({rooms.length})</option>
              <option value="AVAILABLE">Tersedia ({rooms.filter((r) => r.status === "AVAILABLE").length})</option>
              <option value="OCCUPIED">Terisi ({rooms.filter((r) => r.status === "OCCUPIED").length})</option>
              <option value="MAINTENANCE">Perbaikan ({rooms.filter((r) => r.status === "MAINTENANCE").length})</option>
            </select>

            <select
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
            >
              <option value="ALL">Semua Lantai</option>
              <option value="1">Lantai 1</option>
              <option value="2">Lantai 2</option>
            </select>
          </div>
        </div>

        {/* Room Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredRooms.map((r) => {
            const tenant = r.leases?.[0]?.tenant;
            const price = r.customPrice ?? r.roomType.basePrice;
            return (
              <div
                key={r.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">
                      Lantai {r.floor}
                    </span>
                    <StatusBadge status={r.status} />
                  </div>

                  <div className="mt-2">
                    <h3 className="text-2xl font-black text-slate-900">
                      Kamar {r.roomNumber}
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">
                      {r.roomType.name}
                    </p>
                    <p className="text-sm font-bold text-emerald-600 mt-2">
                      {formatRupiah(price)}
                      <span className="text-[10px] font-normal text-slate-400">/bln</span>
                    </p>
                  </div>

                  {/* Tenant information */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Penghuni:
                    </span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">
                      {tenant ? tenant.name : "— Kosong (Belum ada penyewa) —"}
                    </p>
                    {tenant?.phone && (
                      <p className="text-[11px] text-slate-500 mt-0.5">{tenant.phone}</p>
                    )}
                  </div>
                </div>

                {/* Card Actions & Quick Status Switcher */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {/* Quick status dropdown */}
                  <select
                    value={r.status}
                    onChange={(e) => handleQuickStatusChange(r.id, e.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 text-[10px] font-bold px-2 py-1 text-slate-700"
                  >
                    <option value="AVAILABLE">Tersedia</option>
                    <option value="OCCUPIED">Terisi</option>
                    <option value="MAINTENANCE">Perbaikan</option>
                  </select>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(r)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                      title="Edit Kamar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                      title="Hapus Kamar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Room Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRoom ? `Edit Kamar ${editingRoom.roomNumber}` : "Tambah Unit Kamar Baru"}
        description="Lengkapi detail nomor kamar dan pilih tipe kamar."
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {errorMsg && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Nomor Kamar *
              </label>
              <input
                type="text"
                required
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="Contoh: 101, 204"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Lantai *
              </label>
              <input
                type="number"
                min={1}
                required
                value={floor}
                onChange={(e) => setFloor(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Tipe Kamar *
              </label>
              <select
                required
                value={roomTypeId}
                onChange={(e) => setRoomTypeId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              >
                {roomTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({formatRupiah(t.basePrice)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Status Kamar *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "AVAILABLE" | "OCCUPIED" | "MAINTENANCE")}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              >
                <option value="AVAILABLE">Tersedia (Kosong)</option>
                <option value="OCCUPIED">Terisi</option>
                <option value="MAINTENANCE">Perbaikan / Servis</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Harga Khusus (Opsional, kosongkan jika mengikuti harga tipe)
            </label>
            <input
              type="number"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              placeholder="Contoh: 1850000"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Catatan Kamar (Opsional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Misal: Posisi dekat jendela taman luar..."
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
              disabled={saving}
              className="rounded-xl bg-emerald-600 px-6 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {saving ? "Menyimpan..." : "Simpan Kamar"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
