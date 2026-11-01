"use client";
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Building2, CheckCircle2, Save, MapPin } from "lucide-react";

export default function DashboardPropertiPage() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [description, setDescription] = useState("");
  const [rulesStr, setRulesStr] = useState("");
  const [imagesStr, setImagesStr] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/properties")
      .then((res) => res.json())
      .then((data) => {
        if (data.property) {
          const p = data.property;
          setName(p.name || "");
          setAddress(p.address || "");
          setCity(p.city || "");
          setDistrict(p.district || "");
          setDescription(p.description || "");

          try {
            const rules = JSON.parse(p.rules || "[]");
            setRulesStr(rules.join("\n"));
          } catch {
            setRulesStr(p.rules || "");
          }

          try {
            const imgs = JSON.parse(p.images || "[]");
            setImagesStr(imgs.join("\n"));
          } catch {
            setImagesStr(p.images || "");
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    setErrorMsg("");

    try {
      const rules = rulesStr
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean);

      const images = imagesStr
        .split("\n")
        .map((img) => img.trim())
        .filter(Boolean);

      const res = await fetch("/api/properties", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          address,
          city,
          district,
          description,
          rules: JSON.stringify(rules),
          images: JSON.stringify(images),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui properti");

      setMsg("Profil properti kost berhasil diperbarui!");
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
      else setErrorMsg("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Profil & Identitas Kost</h1>
          <p className="text-xs text-slate-500 mt-1">
            Informasi alamat lokasi, tata tertib hunian, dan foto yang ditampilkan pada halaman utama.
          </p>
        </div>

        <form onSubmit={handleSave} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs space-y-6">
          {msg && (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>{msg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-bold text-rose-800">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Nama Properti Kost *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: KamarKos Residence Jatinangor"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Kabupaten / Kota *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Contoh: Sumedang"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Kecamatan *
              </label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Contoh: Jatinangor"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Alamat Lengkap *
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Jl. Raya Jatinangor No. 88, Hegarmanah"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Deskripsi Fasilitas & Lingkungan Kost
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kost modern representatif dekat kampus UNPAD & ITB..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Tata Tertib & Peraturan Kost (Satu baris per aturan)
            </label>
            <textarea
              rows={4}
              value={rulesStr}
              onChange={(e) => setRulesStr(e.target.value)}
              placeholder="Tamu lawan jenis dilarang masuk kamar tidur&#10;Jam tenang pukul 22.00 - 06.00 WIB&#10;Dilarang merokok di dalam kamar AC"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Foto Showcase Gedung / Area Bersama (Satu baris per URL foto)
            </label>
            <textarea
              rows={3}
              value={imagesStr}
              onChange={(e) => setImagesStr(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Menyimpan..." : "Simpan Profil Properti"}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
