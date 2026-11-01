"use client";
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Settings, Save, CheckCircle2, Shield, CreditCard, MessageSquare, AlertCircle } from "lucide-react";

export default function DashboardPengaturanPage() {
  const [bankName, setBankName] = useState("Bank Central Asia (BCA)");
  const [bankAccount, setBankAccount] = useState("8470198822");
  const [bankHolder, setBankHolder] = useState("HENDRA WIJAYA");

  const [midtransServerKey, setMidtransServerKey] = useState("SB-Mid-server-mock-sample-key");
  const [midtransClientKey, setMidtransClientKey] = useState("SB-Mid-client-mock-sample-key");
  const [midtransProduction, setMidtransProduction] = useState("false");

  const [fonnteToken, setFonnteToken] = useState("mock-fonnte-token-123");
  const [fonnteDevice, setFonnteDevice] = useState("628123456789");

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          const s = data.settings;
          if (s.BANK_NAME) setBankName(s.BANK_NAME);
          if (s.BANK_ACCOUNT_NUMBER) setBankAccount(s.BANK_ACCOUNT_NUMBER);
          if (s.BANK_ACCOUNT_HOLDER) setBankHolder(s.BANK_ACCOUNT_HOLDER);

          if (s.MIDTRANS_SERVER_KEY) setMidtransServerKey(s.MIDTRANS_SERVER_KEY);
          if (s.MIDTRANS_CLIENT_KEY) setMidtransClientKey(s.MIDTRANS_CLIENT_KEY);
          if (s.MIDTRANS_IS_PRODUCTION) setMidtransProduction(s.MIDTRANS_IS_PRODUCTION);

          if (s.FONNTE_TOKEN) setFonnteToken(s.FONNTE_TOKEN);
          if (s.FONNTE_DEVICE_NUMBER) setFonnteDevice(s.FONNTE_DEVICE_NUMBER);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          BANK_NAME: bankName,
          BANK_ACCOUNT_NUMBER: bankAccount,
          BANK_ACCOUNT_HOLDER: bankHolder,
          MIDTRANS_SERVER_KEY: midtransServerKey,
          MIDTRANS_CLIENT_KEY: midtransClientKey,
          MIDTRANS_IS_PRODUCTION: midtransProduction,
          FONNTE_TOKEN: fonnteToken,
          FONNTE_DEVICE_NUMBER: fonnteDevice,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan pengaturan");

      setMsg("Pengaturan sistem berhasil disimpan!");
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
          <h1 className="text-2xl font-black text-slate-900">Pengaturan Sistem & Integrasi</h1>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi gateway pembayaran Midtrans, WhatsApp Fonnte, dan rekening bank transfer manual.
          </p>
        </div>

        <form onSubmit={handleSave} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs space-y-8">
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

          {/* Section 1: Rekening Bank */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Rekening Bank Tujuan (Transfer Manual)</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nama Bank *
                </label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="BCA / Mandiri / BNI"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nomor Rekening *
                </label>
                <input
                  type="text"
                  required
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="8470198822"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nama Pemilik Rekening *
                </label>
                <input
                  type="text"
                  required
                  value={bankHolder}
                  onChange={(e) => setBankHolder(e.target.value)}
                  placeholder="HENDRA WIJAYA"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Midtrans */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Integrasi Midtrans Snap API</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Server Key (Sandbox / Production)
                </label>
                <input
                  type="text"
                  value={midtransServerKey}
                  onChange={(e) => setMidtransServerKey(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Client Key
                </label>
                <input
                  type="text"
                  value={midtransClientKey}
                  onChange={(e) => setMidtransClientKey(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              * Mode simulasi otomatis aktif jika menggunakan mock/sandbox key untuk kemudahan pengujian tanpa delay.
            </p>
          </div>

          {/* Section 3: WhatsApp Fonnte */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <MessageSquare className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Integrasi WhatsApp Gateway Fonnte</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Fonnte API Token
                </label>
                <input
                  type="text"
                  value={fonnteToken}
                  onChange={(e) => setFonnteToken(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nomor Pengirim (Sender Device)
                </label>
                <input
                  type="text"
                  value={fonnteDevice}
                  onChange={(e) => setFonnteDevice(e.target.value)}
                  placeholder="628123456789"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Menyimpan..." : "Simpan Semua Pengaturan"}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
