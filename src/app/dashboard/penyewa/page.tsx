"use client";
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/format";
import {
  Users,
  Plus,
  Phone,
  Mail,
  CreditCard,
  MessageCircle,
  Edit,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  tenantProfile?: {
    nik?: string;
    occupation?: string;
    institution?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
  };
  leases?: Array<{
    status: string;
    room: {
      roomNumber: string;
      roomType: { name: string };
    };
  }>;
  invoices?: Array<{
    id: string;
    status: string;
    amount: number;
  }>;
}

export default function DashboardPenyewaPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [nik, setNik] = useState("");
  const [occupation, setOccupation] = useState("");
  const [institution, setInstitution] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadTenants = () => {
    fetch("/api/tenants")
      .then((res) => res.json())
      .then((data) => {
        if (data.tenants) setTenants(data.tenants);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const handleOpenAdd = () => {
    setEditingTenant(null);
    setName("");
    setEmail("");
    setPhone("");
    setPassword("password123");
    setNik("");
    setOccupation("");
    setInstitution("");
    setEmergencyContactName("");
    setEmergencyContactPhone("");
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Tenant) => {
    setEditingTenant(t);
    setName(t.name);
    setEmail(t.email);
    setPhone(t.phone || "");
    setPassword("");
    setNik(t.tenantProfile?.nik || "");
    setOccupation(t.tenantProfile?.occupation || "");
    setInstitution(t.tenantProfile?.institution || "");
    setEmergencyContactName(t.tenantProfile?.emergencyContactName || "");
    setEmergencyContactPhone(t.tenantProfile?.emergencyContactPhone || "");
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");

    try {
      const payload = {
        name,
        email,
        phone,
        password: password || undefined,
        nik,
        occupation,
        institution,
        emergencyContactName,
        emergencyContactPhone,
      };

      const url = editingTenant ? `/api/tenants/${editingTenant.id}` : "/api/tenants";
      const method = editingTenant ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan data penyewa");

      setIsModalOpen(false);
      loadTenants();
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
      else setErrorMsg("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  const filteredTenants = tenants.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const matchName = t.name.toLowerCase().includes(q);
    const matchEmail = t.email.toLowerCase().includes(q);
    const matchPhone = t.phone?.toLowerCase().includes(q);
    const matchRoom = t.leases?.[0]?.room.roomNumber.toLowerCase().includes(q);
    return matchName || matchEmail || matchPhone || matchRoom;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Direktori Penghuni Kost</h1>
            <p className="text-xs text-slate-500 mt-1">
              Data seluruh penyewa aktif, riwayat kamar yang dihuni, dan kontak darurat.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Daftarkan Penghuni Baru</span>
          </button>
        </div>

        {/* Search */}
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama penghuni, email, no WhatsApp, atau kamar..."
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Tenants Table */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : filteredTenants.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              Tidak ada data penyewa ditemukan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Nama Penghuni</th>
                    <th className="px-6 py-4">Kamar Aktif</th>
                    <th className="px-6 py-4">Kontak (WhatsApp)</th>
                    <th className="px-6 py-4">Status Tagihan</th>
                    <th className="px-6 py-4">Kontak Darurat</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredTenants.map((t) => {
                    const activeRoom = t.leases?.[0]?.room;
                    const hasUnpaid = (t.invoices?.length || 0) > 0;
                    const waNumber = t.phone ? t.phone.replace(/[^0-9]/g, "").replace(/^0/, "62") : null;

                    return (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{t.name}</p>
                          <p className="text-[11px] text-slate-400">{t.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          {activeRoom ? (
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              Kamar {activeRoom.roomNumber} ({activeRoom.roomType.name})
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Belum Ada Kamar</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {t.phone || "-"}
                        </td>
                        <td className="px-6 py-4">
                          {hasUnpaid ? (
                            <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-bold">
                              Ada Tagihan ({t.invoices?.length})
                            </span>
                          ) : (
                            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold">
                              Lunas
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {t.tenantProfile?.emergencyContactName ? (
                            <div>
                              <p className="font-semibold text-slate-700">{t.tenantProfile.emergencyContactName}</p>
                              <p className="text-[10px]">{t.tenantProfile.emergencyContactPhone || "-"}</p>
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {waNumber && (
                              <a
                                href={`https://wa.me/${waNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 font-bold hover:bg-emerald-100 transition"
                                title="Chat WhatsApp"
                              >
                                <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                                <span>WA</span>
                              </a>
                            )}
                            <button
                              onClick={() => handleOpenEdit(t)}
                              className="rounded-xl border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 transition"
                              title="Edit Profil"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                          </div>
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

      {/* Modal Add / Edit Tenant */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTenant ? `Edit ${editingTenant.name}` : "Daftarkan Penghuni Baru"}
        description="Lengkapi informasi kontak dan data darurat penghuni kost."
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {errorMsg && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Nama Lengkap *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama sesuai KTP"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Alamat Email *
              </label>
              <input
                type="email"
                required
                disabled={!!editingTenant}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="penyewa@email.com"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none disabled:bg-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Nomor WhatsApp *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08123456789"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Nomor NIK KTP
              </label>
              <input
                type="text"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                placeholder="16 digit NIK"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Pekerjaan / Mahasiswa
              </label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="Mahasiswa S1"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Kampus / Instansi
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="UNPAD / ITB"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Nama Kontak Darurat
              </label>
              <input
                type="text"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                placeholder="Orang tua / Wali"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                No. Telp Kontak Darurat
              </label>
              <input
                type="tel"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                placeholder="0812..."
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {!editingTenant && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Password Default Akun
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          )}

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
              {saving ? "Menyimpan..." : "Simpan Data Penghuni"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
