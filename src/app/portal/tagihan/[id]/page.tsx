"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { StatusBadge } from "@/components/ui/Badge";
import { formatRupiah, formatDate } from "@/lib/format";
import {
  ArrowLeft,
  Receipt,
  Download,
  Printer,
  CheckCircle2,
  Calendar,
  Building,
  User,
} from "lucide-react";

interface InvoiceDetail {
  id: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: string;
  items?: string;
  paymentMethod?: string;
  paymentProof?: string;
  adminNotes?: string;
  tenant: {
    name: string;
    email: string;
    phone?: string;
  };
  lease?: {
    room: {
      roomNumber: string;
      property: {
        name: string;
        address: string;
      };
      roomType: {
        name: string;
      };
    };
  };
}

export default function TenantInvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/invoices/${invoiceId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.invoice) setInvoice(data.invoice);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [invoiceId]);

  if (loading) {
    return (
      <PortalLayout>
        <div className="h-96 rounded-3xl bg-slate-200 animate-pulse" />
      </PortalLayout>
    );
  }

  if (!invoice) {
    return (
      <PortalLayout>
        <div className="text-center py-16">
          <Receipt className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">Invoice Tidak Ditemukan</h3>
          <Link href="/portal/tagihan" className="mt-4 inline-block text-xs font-bold text-emerald-600">
            Kembali ke Daftar Tagihan
          </Link>
        </div>
      </PortalLayout>
    );
  }

  let parsedItems: Array<{ title: string; amount: number }> = [];
  try {
    if (invoice.items) parsedItems = JSON.parse(invoice.items);
  } catch {
    parsedItems = [{ title: "Tagihan Sewa Kost", amount: invoice.amount }];
  }

  const isPaid = invoice.status === "PAID";

  return (
    <PortalLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/portal/tagihan"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Daftar Tagihan</span>
          </Link>

          {isPaid && (
            <a
              href={`/api/invoices/${invoice.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              <Download className="h-4 w-4" />
              <span>Unduh Kwitansi PDF</span>
            </a>
          )}
        </div>

        {/* Invoice Paper Box */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-6 gap-4">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                KWITANSI & INVOICE RESMI
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                {invoice.invoiceNumber}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {invoice.lease?.room.property.name || "KamarKos Residence"}
              </p>
            </div>
            <StatusBadge status={invoice.status} />
          </div>

          {/* Meta Info Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-600">
            <div className="space-y-1.5">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">
                Ditagihkan Kepada:
              </span>
              <p className="font-bold text-slate-800 text-sm">{invoice.tenant.name}</p>
              <p>{invoice.tenant.email}</p>
              <p>{invoice.tenant.phone || "-"}</p>
              <p className="font-semibold text-emerald-700">
                Kamar {invoice.lease?.room.roomNumber} ({invoice.lease?.room.roomType.name})
              </p>
            </div>

            <div className="space-y-1.5 sm:text-right">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">
                Detail Transaksi:
              </span>
              <p>
                Tanggal Jatuh Tempo: <b>{formatDate(invoice.dueDate)}</b>
              </p>
              {invoice.paidDate && (
                <p className="text-emerald-700 font-semibold">
                  Tanggal Lunas: {formatDate(invoice.paidDate)}
                </p>
              )}
              {invoice.paymentMethod && (
                <p>
                  Metode: <b>{invoice.paymentMethod}</b>
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Deskripsi Tagihan</th>
                  <th className="px-4 py-3 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {parsedItems.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 font-medium">{item.title}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      {formatRupiah(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50/80 font-bold text-slate-900">
                <tr>
                  <td className="px-4 py-3 text-sm">TOTAL TAGIHAN</td>
                  <td className="px-4 py-3 text-right text-base text-emerald-600">
                    {formatRupiah(invoice.amount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Admin notes */}
          {invoice.adminNotes && (
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 text-xs text-slate-600">
              <span className="font-bold block text-slate-700 mb-1">Catatan Pengelola:</span>
              <p>{invoice.adminNotes}</p>
            </div>
          )}

          {/* Footer note */}
          <div className="text-center pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            * Kwitansi ini sah diterbitkan melalui Sistem KamarKos Residence secara elektronik.
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
