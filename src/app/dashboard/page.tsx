"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/Badge";
import { formatRupiah, formatDate } from "@/lib/format";
import {
  BedDouble,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Wrench,
  Receipt,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DashboardData {
  kpi: {
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number;
    maintenanceRooms: number;
    occupancyRate: number;
    totalIncomeThisMonth: number;
    totalExpenseThisMonth: number;
    netProfitThisMonth: number;
    unpaidCount: number;
    unpaidAmount: number;
    activeMaintenanceCount: number;
  };
  chartData: Array<{
    name: string;
    pendapatan: number;
    pengeluaran: number;
    laba: number;
  }>;
  recentInvoices: Array<{
    id: string;
    invoiceNumber: string;
    amount: number;
    dueDate: string;
    status: string;
    tenant: { name: string; phone?: string };
    lease?: { room: { roomNumber: string } };
  }>;
  recentMaintenance: Array<{
    id: string;
    title: string;
    priority: string;
    status: string;
    room: { roomNumber: string };
    tenant: { name: string };
  }>;
  rooms: Array<{
    id: string;
    roomNumber: string;
    floor: number;
    status: string;
    roomType: { name: string };
    leases?: Array<{ tenant: { name: string } }>;
  }>;
}

export default function DashboardOverviewPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Stats error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-32 rounded-3xl bg-slate-200 animate-pulse" />
            ))}
          </div>
          <div className="h-80 rounded-3xl bg-slate-200 animate-pulse" />
        </div>
      </DashboardLayout>
    );
  }

  const { kpi, chartData, recentInvoices, recentMaintenance, rooms } = data;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Top KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Tingkat Okupansi"
            value={`${kpi.occupancyRate}%`}
            subtitle={`${kpi.occupiedRooms} dari ${kpi.totalRooms} Kamar Terisi`}
            icon={BedDouble}
            color="green"
            trend={`${kpi.availableRooms} Kosong`}
            trendPositive={kpi.availableRooms === 0}
          />

          <StatCard
            title="Pendapatan Bulan Ini"
            value={formatRupiah(kpi.totalIncomeThisMonth)}
            subtitle="Penerimaan sewa lunas"
            icon={TrendingUp}
            color="blue"
          />

          <StatCard
            title="Pengeluaran Operasional"
            value={formatRupiah(kpi.totalExpenseThisMonth)}
            subtitle="Listrik, WiFi, Gaji & Servis"
            icon={TrendingDown}
            color="rose"
          />

          <StatCard
            title="Laba Bersih (Net)"
            value={formatRupiah(kpi.netProfitThisMonth)}
            subtitle="Estimasi laba bersih operasional"
            icon={DollarSign}
            color="purple"
            trend={kpi.netProfitThisMonth >= 0 ? "Surplus" : "Defisit"}
            trendPositive={kpi.netProfitThisMonth >= 0}
          />
        </div>

        {/* Second Row: Unpaid alert + Active tickets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <Receipt className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase text-amber-800 tracking-wider">
                  Tagihan Belum Lunas
                </span>
                <h4 className="text-2xl font-black text-amber-950 mt-0.5">
                  {formatRupiah(kpi.unpaidAmount)}
                </h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  {kpi.unpaidCount} tagihan penyewa tertunggak
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/keuangan"
              className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition"
            >
              Cek Tagihan
            </Link>
          </div>

          <div className="rounded-3xl border border-blue-200 bg-blue-50/70 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <Wrench className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase text-blue-800 tracking-wider">
                  Tiket Kerusakan Aktif
                </span>
                <h4 className="text-2xl font-black text-blue-950 mt-0.5">
                  {kpi.activeMaintenanceCount} Tiket
                </h4>
                <p className="text-xs text-blue-700 mt-0.5">
                  Menunggu penanganan & perbaikan teknisi
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/maintenance"
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
            >
              Lihat Tiket
            </Link>
          </div>
        </div>

        {/* Cashflow Chart (Last 6 Months) */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Arus Kas Bulanan (Cash Flow)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Perbandingan Pendapatan Sewa vs Biaya Operasional (6 Bulan Terakhir)
              </p>
            </div>
            <Link
              href="/dashboard/laporan"
              className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
            >
              <span>Laporan Lengkap & Cetak PDF</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(1)}jt`}
                />
                <Tooltip
                  formatter={(val: number) => formatRupiah(val)}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Bar dataKey="pendapatan" name="Pendapatan (In)" fill="#16a34a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="pengeluaran" name="Pengeluaran (Out)" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visual Room Floor Matrix */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Matriks Denah Kamar</h3>
              <p className="text-xs text-slate-500 mt-0.5">Status seluruh unit kamar kost</p>
            </div>
            <Link
              href="/dashboard/kamar"
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Kelola Kamar
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {rooms.map((room) => {
              const activeTenant = room.leases?.[0]?.tenant;
              return (
                <div
                  key={room.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">Lt. {room.floor}</span>
                    <StatusBadge status={room.status} />
                  </div>
                  <h4 className="text-xl font-black text-slate-900">
                    {room.roomNumber}
                  </h4>
                  <div className="text-[10px] text-slate-500 truncate">
                    {activeTenant ? activeTenant.name : room.roomType.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions & Recent Maintenance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Invoices */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Tagihan Terbaru</h3>
              <Link href="/dashboard/keuangan" className="text-xs font-bold text-emerald-600 hover:underline">
                Lihat Semua
              </Link>
            </div>

            <div className="space-y-3">
              {recentInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 p-3.5 border border-slate-100"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{inv.invoiceNumber}</span>
                      <span className="text-[10px] text-slate-400">Kamar {inv.lease?.room.roomNumber}</span>
                    </div>
                    <p className="text-[11px] text-slate-600">{inv.tenant.name}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 block">
                      {formatRupiah(inv.amount)}
                    </span>
                    <StatusBadge status={inv.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Maintenance */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Keluhan Maintenance Terbaru</h3>
              <Link href="/dashboard/maintenance" className="text-xs font-bold text-emerald-600 hover:underline">
                Lihat Semua
              </Link>
            </div>

            <div className="space-y-3">
              {recentMaintenance.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 p-3.5 border border-slate-100"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{m.title}</span>
                      <span className="text-[10px] text-slate-400">Kamar {m.room?.roomNumber}</span>
                    </div>
                    <p className="text-[11px] text-slate-600">{m.tenant.name}</p>
                  </div>

                  <StatusBadge status={m.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
