"use client";
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Megaphone, Send, CheckCircle2, MessageSquare, Users, AlertCircle } from "lucide-react";

export default function DashboardKomunikasiPage() {
  const [targetGroup, setTargetGroup] = useState<"ALL" | "FLOOR">("ALL");
  const [floor, setFloor] = useState("1");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [resultMsg, setResultMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (!confirm("Kirim pengumuman WhatsApp ini ke seluruh penghuni terpilih?")) {
      return;
    }

    setSending(true);
    setResultMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          targetGroup,
          floor: targetGroup === "FLOOR" ? floor : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim broadcast");

      setResultMsg(data.message || "Pesan siaran berhasil dikirim!");
      setMessage("");
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
      else setErrorMsg("Terjadi kesalahan");
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Broadcast Pengumuman WhatsApp</h1>
          <p className="text-xs text-slate-500 mt-1">
            Kirimkan pesan pengumuman penting, jadwal pemadaman listrik, atau aturan kost secara massal ke nomor WhatsApp seluruh penghuni aktif melalui integrasi Fonnte.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs space-y-6">
          {resultMsg && (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>{resultMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-bold text-rose-800 animate-in fade-in">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleBroadcast} className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Pilih Target Penerima
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTargetGroup("ALL")}
                  className={`rounded-2xl border p-4 text-left transition flex items-center gap-3 ${targetGroup === "ALL" ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20" : "border-slate-200 hover:bg-slate-50"}`}
                >
                  <Users className="h-5 w-5 text-emerald-600" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Semua Penghuni Aktif</h5>
                    <p className="text-[10px] text-slate-500">Lantai 1 dan Lantai 2</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetGroup("FLOOR")}
                  className={`rounded-2xl border p-4 text-left transition flex items-center gap-3 ${targetGroup === "FLOOR" ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20" : "border-slate-200 hover:bg-slate-50"}`}
                >
                  <Megaphone className="h-5 w-5 text-blue-600" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Spesifik Lantai Tertentu</h5>
                    <p className="text-[10px] text-slate-500">Pilih lantai kamar</p>
                  </div>
                </button>
              </div>
            </div>

            {targetGroup === "FLOOR" && (
              <div className="animate-in fade-in">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Pilih Lantai
                </label>
                <select
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="1">Penghuni Lantai 1</option>
                  <option value="2">Penghuni Lantai 2</option>
                </select>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Isi Pesan Pengumuman *
              </label>
              <textarea
                rows={6}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tuliskan isi pengumuman Anda di sini... (Contoh: Diberitahukan kepada seluruh penghuni kost bahwa besok hari Sabtu akan ada pembersihan toren air bersama pada pukul 09.00 - 11.00 WIB)."
                className="w-full rounded-2xl border border-slate-200 p-4 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                * Pesan akan otomatis menyertakan salam pembuka dan nama penghuni secara personal via Fonnte.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={sending}
                className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                <Send className="h-4 w-4" />
                <span>{sending ? "Mengirim Siaran WhatsApp..." : "Kirim Siaran Sekarang"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
