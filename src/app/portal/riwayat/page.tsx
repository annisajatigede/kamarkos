"use client";
import React, { useState, useEffect } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { StatusBadge } from "@/components/ui/Badge";
import { formatRupiah, formatDate } from "@/lib/format";
import { History, Download, Receipt, FileText } from "lucide-react";

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: string;
  paymentMethod?: string;
  lease?: {
    room: {
      roomNumber: string;
      roomType: { name: string };
    };
  };
}

export default function TenantRiwayatPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/invoices")
      .then((res) => res.json())
      .then((data) => {
        if (data.invoices) setInvoices(data.invoices);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const paidInvoices = invoices.filter((inv) => inv.status === "PAID");

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Riwayat Pembayaran</h1>
          <p className="text-xs text-slate-500 mt-1">
            Arsip seluruh tagihan yang telah lunas dan bukti kwitansi elektronik resmi.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : paidInvoices.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <History className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              Belum ada riwayat pembayaran yang lunas.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">No. Invoice</th>
                    <th className="px-6 py-4">Kamar</th>
                    <th className="px-6 py-4">Tanggal Pembayaran</th>
                    <th className="px-6 py-4">Metode</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4 text-right">Kwitansi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {paidInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-6 py-4">
                        Kamar {inv.lease?.room.roomNumber || "-"}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(inv.paidDate || inv.dueDate)}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {inv.paymentMethod || "Transfer"}
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-600">
                        {formatRupiah(inv.amount)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a
                          href={`/api/invoices/${inv.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Unduh PDF</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
