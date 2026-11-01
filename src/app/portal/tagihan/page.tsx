"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatRupiah, formatDate } from "@/lib/format";
import {
  Receipt,
  CreditCard,
  Building,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Check,
} from "lucide-react";

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: string;
  items?: string;
  paymentMethod?: string;
  paymentProof?: string;
  lease?: {
    room: {
      roomNumber: string;
      roomType: { name: string };
    };
  };
}

export default function TenantTagihanPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"MIDTRANS" | "MANUAL_TRANSFER">("MIDTRANS");
  const [proofUrl, setProofUrl] = useState("");
  const [processing, setProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedBank, setCopiedBank] = useState(false);

  const loadInvoices = () => {
    fetch("/api/invoices")
      .then((res) => res.json())
      .then((data) => {
        if (data.invoices) setInvoices(data.invoices);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleOpenPay = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setPaymentMethod("MIDTRANS");
    setProofUrl("");
    setSuccessMsg("");
    setErrorMsg("");
    setPayModalOpen(true);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText("8470198822");
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const handleProcessPayment = async () => {
    if (!selectedInvoice) return;
    setProcessing(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/invoices/${selectedInvoice.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod,
          paymentProof:
            paymentMethod === "MANUAL_TRANSFER"
              ? proofUrl || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500"
              : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses pembayaran");
      }

      setSuccessMsg(
        paymentMethod === "MIDTRANS"
          ? "Sesi Midtrans Berhasil Diinisiasi! Simulasi pembayaran sukses."
          : "Bukti transfer manual berhasil diunggah. Menunggu verifikasi pengelola kost."
      );

      loadInvoices();
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
      else setErrorMsg("Terjadi kesalahan");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Tagihan Sewa Kost</h1>
            <p className="text-xs text-slate-500 mt-1">
              Daftar seluruh tagihan sewa kamar Anda, status pembayaran, dan kwitansi resmi.
            </p>
          </div>
        </div>

        {/* Invoices List Table */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              Belum ada riwayat tagihan untuk akun Anda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">No. Invoice</th>
                    <th className="px-6 py-4">Unit Kamar</th>
                    <th className="px-6 py-4">Jatuh Tempo</th>
                    <th className="px-6 py-4">Nominal</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {invoices.map((inv) => {
                    const isPaid = inv.status === "PAID";
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {inv.invoiceNumber}
                        </td>
                        <td className="px-6 py-4">
                          Kamar {inv.lease?.room.roomNumber || "-"}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {formatDate(inv.dueDate)}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {formatRupiah(inv.amount)}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={inv.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isPaid ? (
                              <a
                                href={`/api/invoices/${inv.id}/pdf`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition"
                                title="Download Kwitansi PDF"
                              >
                                <Download className="h-3.5 w-3.5" />
                                <span>Kwitansi PDF</span>
                              </a>
                            ) : (
                              <button
                                onClick={() => handleOpenPay(inv)}
                                className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                              >
                                Bayar
                              </button>
                            )}

                            <Link
                              href={`/portal/tagihan/${inv.id}`}
                              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                            >
                              Detail
                            </Link>
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

      {/* Payment Selection Modal */}
      <Modal
        isOpen={payModalOpen}
        onClose={() => {
          setPayModalOpen(false);
          setSuccessMsg("");
          setErrorMsg("");
        }}
        title={`Pembayaran ${selectedInvoice?.invoiceNumber}`}
        description={`Total Tagihan: ${formatRupiah(selectedInvoice?.amount)}`}
      >
        {successMsg ? (
          <div className="py-6 text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">{successMsg}</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Sistem telah memperbarui status tagihan Anda. Anda dapat melihat rincian pembayaran di halaman ini.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setPayModalOpen(false)}
                className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white"
              >
                Tutup
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {errorMsg && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
                {errorMsg}
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                Pilih Metode Pembayaran
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("MIDTRANS")}
                  className={`rounded-2xl border p-4 text-left transition flex flex-col justify-between ${paymentMethod === "MIDTRANS" ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20" : "border-slate-200 hover:bg-slate-50"}`}
                >
                  <CreditCard className="h-6 w-6 text-emerald-600 mb-2" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Midtrans Online</h5>
                    <p className="text-[10px] text-slate-500 mt-0.5">BCA VA, Mandiri, BRI, QRIS, GoPay</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("MANUAL_TRANSFER")}
                  className={`rounded-2xl border p-4 text-left transition flex flex-col justify-between ${paymentMethod === "MANUAL_TRANSFER" ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20" : "border-slate-200 hover:bg-slate-50"}`}
                >
                  <Building className="h-6 w-6 text-blue-600 mb-2" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Transfer Manual</h5>
                    <p className="text-[10px] text-slate-500 mt-0.5">Transfer Bank BCA & Upload Bukti</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Manual Bank Details & Proof Upload Form */}
            {paymentMethod === "MANUAL_TRANSFER" && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4 text-xs animate-in fade-in">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Rekening Tujuan</span>
                  <div className="mt-1 flex items-center justify-between font-bold text-slate-900 text-sm">
                    <span>BCA: 8470198822</span>
                    <button
                      type="button"
                      onClick={handleCopyAccount}
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline"
                    >
                      {copiedBank ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedBank ? "Tersalin" : "Salin No. Rek"}</span>
                    </button>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">a/n HENDRA WIJAYA</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Link / URL Foto Bukti Transfer *
                  </label>
                  <input
                    type="text"
                    value={proofUrl}
                    onChange={(e) => setProofUrl(e.target.value)}
                    placeholder="Contoh: https://i.imgur.com/bukti.jpg (atau kosongkan untuk contoh)"
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    * Kosongkan untuk menggunakan gambar simulasi otomatis.
                  </p>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPayModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleProcessPayment}
                disabled={processing}
                className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                {processing
                  ? "Memproses..."
                  : paymentMethod === "MIDTRANS"
                  ? "Buka Midtrans Snap Checkout"
                  : "Kirim Bukti Pembayaran"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </PortalLayout>
  );
}
