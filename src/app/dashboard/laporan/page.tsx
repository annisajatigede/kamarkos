"use client";
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { formatRupiah, formatDate } from "@/lib/format";
import {
  BarChart3,
  Download,
  Calendar,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BedDouble,
  CheckCircle2,
} from "lucide-react";

interface ReportData {
  period: string;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  occupancyRate: number;
  paidInvoicesCount: number;
  expensesCount: number;
  transactions: Array<{
    id: string;
    date: string;
    type: "INCOME" | "EXPENSE";
    category: string;
    description: string;
    amount: number;
  }>;
}

export default function DashboardLaporanPage() {
  const currentMonthStr = `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, "0")}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadReport = (month: string) => {
    setLoading(true);
    fetch(`/api/reports/financial?month=${month}`)
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReport(selectedMonth);
  }, [selectedMonth]);

  const handleExportCSV = () => {
    if (!data?.transactions) return;

    const headers = ["No", "Tanggal", "Tipe", "Kategori", "Keterangan", "Nominal (IDR)"];
    const rows = data.transactions.map((tx, idx) => [
      (idx + 1).toString(),
      formatDate(tx.date, "yyyy-MM-dd"),
      tx.type === "INCOME" ? "Pemasukan" : "Pengeluaran",
      `"${tx.category}"`,
      `"${tx.description.replace(/"/g, '""')}"`,
      tx.amount.toString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan-Keuangan-${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Laporan Keuangan & Okupansi</h1>
            <p className="text-xs text-slate-500 mt-1">
              Rekapitulasi laba-rugi bulanan, arus kas transaksi, dan ekspor dokumen resmi.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-xs focus:border-emerald-500 focus:outline-none"
            />

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>Export CSV / Excel</span>
            </button>

            <a
              href={`/api/reports/pdf?month=${selectedMonth}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition"
            >
              <Download className="h-4 w-4 text-emerald-400" />
              <span>Cetak Laporan PDF</span>
            </a>
          </div>
        </div>

        {loading || !data ? (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-28 rounded-3xl bg-slate-200 animate-pulse" />
              ))}
            </div>
            <div className="h-80 rounded-3xl bg-slate-200 animate-pulse" />
          </div>
        ) : (
          <>
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-5 space-y-1">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  Total Pendapatan
                </span>
                <h4 className="text-2xl font-black text-emerald-950">
                  {formatRupiah(data.totalIncome)}
                </h4>
                <p className="text-xs text-emerald-700">
                  {data.paidInvoicesCount} transaksi sewa lunas
                </p>
              </div>

              <div className="rounded-3xl border border-rose-100 bg-rose-50/60 p-5 space-y-1">
                <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
                  Total Pengeluaran
                </span>
                <h4 className="text-2xl font-black text-rose-950">
                  {formatRupiah(data.totalExpense)}
                </h4>
                <p className="text-xs text-rose-700">
                  {data.expensesCount} item operasional kost
                </p>
              </div>

              <div className="rounded-3xl border border-purple-100 bg-purple-50/60 p-5 space-y-1">
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                  Laba Bersih (Net)
                </span>
                <h4 className="text-2xl font-black text-purple-950">
                  {formatRupiah(data.netProfit)}
                </h4>
                <p className="text-xs text-purple-700">
                  {data.netProfit >= 0 ? "Surplus Keuntungan" : "Defisit Operasional"}
                </p>
              </div>

              <div className="rounded-3xl border border-blue-100 bg-blue-50/60 p-5 space-y-1">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                  Tingkat Okupansi
                </span>
                <h4 className="text-2xl font-black text-blue-950">
                  {data.occupancyRate}%
                </h4>
                <p className="text-xs text-blue-700">Rasio hunian kamar periode ini</p>
              </div>
            </div>

            {/* Transactions Log Table */}
            <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                  Rincian Mutasi Arus Kas ({data.transactions.length} Transaksi)
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Tanggal</th>
                      <th className="px-6 py-4">Tipe</th>
                      <th className="px-6 py-4">Kategori</th>
                      <th className="px-6 py-4">Keterangan / Rincian</th>
                      <th className="px-6 py-4 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {data.transactions.map((tx) => {
                      const isIncome = tx.type === "INCOME";
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                          <td className="px-6 py-4 text-slate-500">
                            {formatDate(tx.date)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`rounded-lg px-2.5 py-1 text-[10px] font-bold border ${isIncome ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}
                            >
                              {isIncome ? "Pemasukan" : "Pengeluaran"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {tx.category}
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-900">
                            {tx.description}
                          </td>
                          <td
                            className={`px-6 py-4 text-right font-black ${isIncome ? "text-emerald-600" : "text-rose-600"}`}
                          >
                            {isIncome ? `+${formatRupiah(tx.amount)}` : `-${formatRupiah(tx.amount)}`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
