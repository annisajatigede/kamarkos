"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { StatusBadge } from "@/components/ui/Badge";
import { formatRupiah, formatDate } from "@/lib/format";
import {
  BedDouble,
  Receipt,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Calendar,
  CreditCard,
  ArrowRight,
  Sparkles,
  Phone,
  FileText,
  Star,
} from "lucide-react";

interface TenantDashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    leases: Array<{
      id: string;
      startDate: string;
      endDate: string;
      rentAmount: number;
      room: {
        roomNumber: string;
        floor: number;
        roomType: {
          name: string;
          size: string;
        };
        property: {
          name: string;
          address: string;
        };
      };
    }>;
  };
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  status: string;
  items?: string;
}

interface Ticket {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
}

export default function TenantPortalDashboard() {
  const { data: session } = useSession();
  const [tenantData, setTenantData] = useState<TenantDashboardData | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/invoices").then((r) => r.json()),
      fetch("/api/maintenance").then((r) => r.json()),
    ])
      .then(([meRes, invRes, maintRes]) => {
        if (meRes.user) setTenantData(meRes);
        if (invRes.invoices) setInvoices(invRes.invoices);
        if (maintRes.tickets) setTickets(maintRes.tickets);
      })
      .catch((err) => console.error("Error loading tenant portal:", err))
      .finally(() => setLoading(false));
  }, []);

  const activeLease = tenantData?.user?.leases?.[0];
  const unpaidInvoice = invoices.find((inv) => inv.status === "UNPAID" || inv.status === "OVERDUE");
  const recentTickets = tickets.slice(0, 3);

  return (
    <PortalLayout>
      <div className="space-y-8">
        {/* Welcome Greeting Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-green-600 p-6 sm:p-8 text-white shadow-lg shadow-emerald-600/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Portal Penghuni KamarKos
              </span>
              <h1 className="text-2xl sm:text-3xl font-black mt-2">
                Halo, {session?.user?.name || "Penghuni"}! 👋
              </h1>
              <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-lg leading-relaxed">
                {activeLease
                  ? `Anda saat ini terdaftar aktif di Kamar ${activeLease.room.roomNumber} (${activeLease.room.roomType.name}).`
                  : "Selamat datang di Portal Penghuni. Silakan cek informasi sewa dan tagihan Anda."}
              </p>
            </div>

            {unpaidInvoice && (
              <div className="shrink-0">
                <Link
                  href={`/portal/tagihan`}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs font-bold text-emerald-800 shadow-md hover:bg-emerald-50 transition"
                >
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  <span>Bayar Tagihan Sekarang</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Unpaid Invoice Alert Banner (if exists) */}
        {unpaidInvoice && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  Tagihan Sewa Bulan Ini Menunggu Pembayaran
                </h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  Nomor: <b>{unpaidInvoice.invoiceNumber}</b> • Jatuh Tempo:{" "}
                  <b>{formatDate(unpaidInvoice.dueDate)}</b>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span className="text-lg font-black text-amber-900">
                {formatRupiah(unpaidInvoice.amount)}
              </span>
              <Link
                href="/portal/tagihan"
                className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition"
              >
                Bayar
              </Link>
            </div>
          </div>
        )}

        {/* Room & Contract Info Card */}
        {activeLease ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <BedDouble className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Kamar {activeLease.room.roomNumber} - {activeLease.room.roomType.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {activeLease.room.property.name} • Lantai {activeLease.room.floor}
                  </p>
                </div>
              </div>
              <StatusBadge status="ACTIVE" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Mulai Sewa</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{formatDate(activeLease.startDate)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Akhir Kontrak</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{formatDate(activeLease.endDate)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Biaya Sewa / Bulan</span>
                <p className="text-xs font-bold text-emerald-600 mt-0.5">{formatRupiah(activeLease.rentAmount)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Ukuran Kamar</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{activeLease.room.roomType.size || "3x4 m"}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <BedDouble className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">Belum Ada Kontrak Sewa Aktif</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Anda belum terhubung ke kamar kost manapun. Silakan pilih kamar favorit Anda atau hubungi pengelola kost.
            </p>
            <Link
              href="/kamar"
              className="mt-4 inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white"
            >
              Cari & Ajukan Kamar
            </Link>
          </div>
        )}

        {/* Quick Shortcut Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/portal/tagihan"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-emerald-500 hover:shadow-md transition group"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition mb-3">
              <Receipt className="h-5 w-5" />
            </div>
            <h5 className="text-sm font-bold text-slate-900">Tagihan & Bayar</h5>
            <p className="text-[11px] text-slate-500 mt-0.5">Cek tagihan sewa bulanan & bukti bayar</p>
          </Link>

          <Link
            href="/portal/maintenance"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-emerald-500 hover:shadow-md transition group"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition mb-3">
              <Wrench className="h-5 w-5" />
            </div>
            <h5 className="text-sm font-bold text-slate-900">Lapor Kerusakan</h5>
            <p className="text-[11px] text-slate-500 mt-0.5">Ajukan servis fasilitas atau perbaikan</p>
          </Link>

          <Link
            href="/portal/riwayat"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-emerald-500 hover:shadow-md transition group"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition mb-3">
              <FileText className="h-5 w-5" />
            </div>
            <h5 className="text-sm font-bold text-slate-900">Riwayat & Kwitansi</h5>
            <p className="text-[11px] text-slate-500 mt-0.5">Download arsip PDF kwitansi resmi</p>
          </Link>

          <Link
            href="/portal/review"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-emerald-500 hover:shadow-md transition group"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition mb-3">
              <Star className="h-5 w-5" />
            </div>
            <h5 className="text-sm font-bold text-slate-900">Beri Ulasan</h5>
            <p className="text-[11px] text-slate-500 mt-0.5">Tulis testimoni & rating untuk kost</p>
          </Link>
        </div>

        {/* Maintenance Tracker Preview */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Status Tiket Keluhan Terkini</h3>
              <p className="text-xs text-slate-500">Pelacakan penanganan fasilitas kamar Anda</p>
            </div>
            <Link
              href="/portal/maintenance"
              className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentTickets.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              Tidak ada tiket keluhan aktif. Semua fasilitas kamar Anda dalam kondisi prima! 👍
            </div>
          ) : (
            <div className="space-y-3">
              {recentTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-100"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{ticket.title}</span>
                      <StatusBadge status={ticket.priority} />
                    </div>
                    <span className="text-[11px] text-slate-400 block">
                      Dilaporkan pada {formatDate(ticket.createdAt)}
                    </span>
                  </div>
                  <StatusBadge status={ticket.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
