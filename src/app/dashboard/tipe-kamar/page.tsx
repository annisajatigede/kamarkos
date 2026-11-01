"use client";
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Modal } from "@/components/ui/Modal";
import { formatRupiah } from "@/lib/format";
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface RoomType {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  deposit: number;
  size: string;
  facilities: string;
  images: string;
  _count?: { rooms: number };
}

export default function DashboardTipeKamarPage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [propertyId, setPropertyId] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<RoomType | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [deposit, setDeposit] = useState("");
  const [size, setSize] = useState("");
  const [facilitiesStr, setFacilitiesStr] = useState("");
  const [imageUrlsStr, setImageUrlsStr] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadData = () => {
    Promise.all([
      fetch("/api/room-types").then((r) => r.json()),
      fetch("/api/properties").then((r) => r.json()),
    ])
      .then(([tData, pData]) => {
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
    setEditingType(null);
    setName("");
    setDescription("");
    setBasePrice("");
    setDeposit("");
    setSize("");
    setFacilitiesStr("");
    setImageUrlsStr("");
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: RoomType) => {
    setEditingType(t);
    setName(t.name);
    setDescription(t.description || "");
    setBasePrice(t.basePrice.toString());
    setDeposit(t.deposit.toString());
    setSize(t.size || "");

    let facArr: string[] = [];
    let imgArr: string[] = [];
    try {
      if (t.facilities) facArr = JSON.parse(t.facilities);
      if (t.images) imgArr = JSON.parse(t.images);
    } catch {}

    setFacilitiesStr(facArr.join(", "));
    setImageUrlsStr(imgArr.join("\n"));
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus tipe kamar ini?")) return;
    try {
      const res = await fetch(`/api/room-types/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Gagal menghapus tipe kamar");
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
      const facilities = facilitiesStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const images = imageUrlsStr
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        propertyId,
        name,
        description,
        basePrice: parseFloat(basePrice),
        deposit: deposit ? parseFloat(deposit) : 0,
        size,
        facilities: JSON.stringify(facilities),
        images: JSON.stringify(images),
      };

      const url = editingType ? `/api/room-types/${editingType.id}` : "/api/room-types";
      const method = editingType ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan tipe kamar");

      setIsModalOpen(false);
      loadData();
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
      else setErrorMsg("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Manajemen Tipe Kamar</h1>
            <p className="text-xs text-slate-500 mt-1">
              Atur klasifikasi kamar, fasilitas standar include, dimensi kamar, dan harga sewa dasar.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Tipe Kamar</span>
          </button>
        </div>

        {/* Tipe Kamar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roomTypes.map((t) => {
            let facList: string[] = [];
            let imgList: string[] = [];
            try {
              if (t.facilities) facList = JSON.parse(t.facilities);
              if (t.images) imgList = JSON.parse(t.images);
            } catch {}

            return (
              <div
                key={t.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{t.name}</h3>
                      <span className="text-[11px] font-semibold text-slate-400">
                        Ukuran: {t.size || "3x3 m"} • {t._count?.rooms || 0} Unit Kamar
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(t)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        title="Edit Tipe"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        title="Hapus Tipe"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{t.description}</p>

                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Fasilitas Termasuk:
                    </span>
                    <div className="space-y-1">
                      {facList.slice(0, 4).map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Tarif Dasar</span>
                    <p className="text-lg font-black text-emerald-600">{formatRupiah(t.basePrice)}/bln</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Deposit</span>
                    <p className="text-xs font-bold text-slate-800">{formatRupiah(t.deposit)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Add / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingType ? `Edit ${editingType.name}` : "Tambah Tipe Kamar Baru"}
        description="Konfigurasi tarif sewa, fasilitas standar, dan dimensi ruangan."
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {errorMsg && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Nama Tipe Kamar *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Deluxe Queen AC"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Tarif Dasar Sewa (Rp / Bulan) *
              </label>
              <input
                type="number"
                required
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="Contoh: 1800000"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Deposit Jaminan Awal (Rp)
              </label>
              <input
                type="number"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                placeholder="Contoh: 500000"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Dimensi Ukuran Ruangan
              </label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="Contoh: 4 x 4 meter"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Deskripsi Singkat
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Kamar luas ranjang queen..."
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Daftar Fasilitas (Pisahkan dengan koma)
            </label>
            <textarea
              rows={3}
              value={facilitiesStr}
              onChange={(e) => setFacilitiesStr(e.target.value)}
              placeholder="AC 1 PK, Kamar Mandi Dalam, Water Heater, Kasur Queen Size, Meja Kerja, WiFi"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              URL Foto Galeri (Satu baris per link)
            </label>
            <textarea
              rows={2}
              value={imageUrlsStr}
              onChange={(e) => setImageUrlsStr(e.target.value)}
              placeholder="https://images.unsplash.com/..."
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
              {saving ? "Menyimpan..." : "Simpan Tipe Kamar"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
