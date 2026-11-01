"use client";
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatRupiah, formatDate } from "@/lib/format";
import {
  DollarSign,
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp,
  MessageCircle,
  CheckCircle2,
  Download,
  Trash2,
  Sparkles,
  Calendar,
  AlertCircle,
  Send,
  Building,
} from "lucide-react";

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: string;
  paymentMethod?: string;
  paymentProof?: string;
  adminNotes?: string;
  tenant: {
    id: string;
    name: string;
    phone?: string;
  };
  lease?: {
    room: {
      roomNumber: string;
    };
  };
}

interface Expense {
  id: string;
  category: string;
  title: string;
  amount: number;
  date: string;
  notes?: string;
  property: { name: string };
}

export default function DashboardKeuanganPage() {
  const [activeTab, setActiveTab] = useState<"INVOICES" | "EXPENSES">("INVOICES");

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [propertyId, setPropertyId] = useState("");
  const [loading, setLoading] = useState(true);

  // Invoice Filters & Modals
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("ALL");
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [waSendingId, setWaSendingId] = useState<string | null>(null);
  const [alertMsg, setAlertMsg] = useState("");

  // New Expense Modal
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("UTILITY");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [expenseNotes, setExpenseNotes] = useState("");
  const [savingExpense, setSavingExpense] = useState(false);
  const [expenseError, setExpenseError] = useState("");

  const loadAll = () => {
    Promise.all([
      fetch("/api/invoices").then((r) => r.json()),
      fetch("/api/expenses").then((r) => r.json()),
      fetch("/api/properties").then((r) => r.json()),
    ])
      .then(([iData, eData, pData]) => {
        if (iData.invoices) setInvoices(iData.invoices);
        if (eData.expenses) setExpenses(eData.expenses);
        if (pData.property?.id) setPropertyId(pData.property.id);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAll();
    setExpenseDate(new Date().toISOString().split("T")[0]);
  }, []);

  const handleGenerateMonthlyBulk = async () => {
    if (!confirm("Terbitkan tagihan sewa bulanan otomatis untuk seluruh penghuni aktif?")) return;
    setBulkGenerating(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "GENERATE_MONTHLY_BULK" }),
      });
      const data = await res.json();
      setAlertMsg(data.message || "Tagihan bulanan berhasil diterbitkan");
      loadAll();
    } catch (err) {
      console.error(err);
    } finally {
      setBulkGenerating(false);
    }
  };

  const handleSendWaReminder = async (invoiceId: string) => {
    setWaSendingId(invoiceId);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/send-reminder`, {
        method: "POST",
      });
      const data = await res.json();
      setAlertMsg(data.message || "Pengingat WhatsApp berhasil dikirim");
    } catch (err) {
      console.error(err);
    } finally {
      setWaSendingId(null);
    }
  };

  const handleVerifyInvoice = async (invoiceId: string) => {
    if (!confirm("Verifikasi dan ubah status tagihan ini menjadi LUNAS?")) return;
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: "MANUAL_TRANSFER" }),
      });
      const data = await res.json();
      setAlertMsg(data.message || "Pembayaran diverifikasi Lunas");
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingExpense(true);
    setExpenseError("");

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          category: expenseCategory,
          title: expenseTitle,
          amount: parseFloat(expenseAmount),
          date: expenseDate,
          notes: expenseNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mencatat pengeluaran");

      setIsExpenseModalOpen(false);
      setExpenseTitle("");
      setExpenseAmount("");
      setExpenseNotes("");
      loadAll();
    } catch (err: unknown) {
      if (err instanceof Error) setExpenseError(err.message);
      else setExpenseError("Terjadi kesalahan");
    } finally {
      setSavingExpense(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Hapus catatan pengeluaran ini?")) return;
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (res.ok) loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (invoiceStatusFilter === "ALL") return true;
    return inv.status === invoiceStatusFilter;
  });

  const totalExpenseSum = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Manajemen Keuangan Terpadu</h1>
            <p className="text-xs text-slate-500 mt-1">
              Kelola penagihan sewa, pengingat WhatsApp otomatis, verifikasi kas masuk, dan pencatatan biaya operasional.
            </p>
          </div>

          {activeTab === "INVOICES" ? (
            <button
              onClick={handleGenerateMonthlyBulk}
              disabled={bulkGenerating}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50 transition self-start sm:self-auto"
            >
              <Sparkles className="h-4 w-4" />
              <span>{bulkGenerating ? "Menerbitkan..." : "Generate Tagihan Bulan Ini"}</span>
            </button>
          ) : (
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 transition self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Catat Pengeluaran Baru</span>
            </button>
          )}
        </div>

        {alertMsg && (
          <div className="flex items-center justify-between rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800">
            <span>{alertMsg}</span>
            <button onClick={() => setAlertMsg("")} className="text-emerald-600 hover:underline">
              Tutup
            </button>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab("INVOICES")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition ${activeTab === "INVOICES" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
          >
            <Receipt className="h-4 w-4" />
            <span>Tagihan Sewa (Invoices)</span>
          </button>

          <button
            onClick={() => setActiveTab("EXPENSES")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition ${activeTab === "EXPENSES" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
          >
            <TrendingDown className="h-4 w-4" />
            <span>Pengeluaran Operasional (Expenses)</span>
          </button>
        </div>

        {/* TAB 1: INVOICES */}
        {activeTab === "INVOICES" && (
          <div className="space-y-4 animate-in fade-in">
            {/* Filter buttons */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Status:</span>
              {["ALL", "UNPAID", "PAID", "OVERDUE"].map((st) => (
                <button
                  key={st}
                  onClick={() => setInvoiceStatusFilter(st)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${invoiceStatusFilter === st ? "bg-emerald-600 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                >
                  {st === "ALL" ? "Semua" : st === "UNPAID" ? "Belum Lunas" : st === "PAID" ? "Lunas" : "Jatuh Tempo"}
                </button>
              ))}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">No. Invoice</th>
                      <th className="px-6 py-4">Penyewa & Kamar</th>
                      <th className="px-6 py-4">Nominal</th>
                      <th className="px-6 py-4">Jatuh Tempo</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Aksi & WA Reminder</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredInvoices.map((inv) => {
                      const isPaid = inv.status === "PAID";
                      const isSending = waSendingId === inv.id;
                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                          <td className="px-6 py-4 font-bold text-slate-900">
                            {inv.invoiceNumber}
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-900">{inv.tenant.name}</p>
                            <p className="text-[11px] text-slate-400">
                              Kamar {inv.lease?.room.roomNumber || "-"}
                            </p>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-900">
                            {formatRupiah(inv.amount)}
                          </td>
                          <td className="px-6 py-4 text-slate-500">
                            {formatDate(inv.dueDate)}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={inv.status} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {!isPaid && (
                                <>
                                  <button
                                    onClick={() => handleSendWaReminder(inv.id)}
                                    disabled={isSending}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 transition"
                                    title="Kirim Pengingat WhatsApp Fonnte"
                                  >
                                    <MessageCircle className="h-3.5 w-3.5" />
                                    <span>{isSending ? "Mengirim..." : "Kirim WA"}</span>
                                  </button>

                                  <button
                                    onClick={() => handleVerifyInvoice(inv.id)}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                                    title="Tandai Lunas"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    <span>Verifikasi</span>
                                  </button>
                                </>
                              )}

                              <a
                                href={`/api/invoices/${inv.id}/pdf`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 transition"
                                title="Download PDF Kwitansi"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EXPENSES */}
        {activeTab === "EXPENSES" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 flex items-center justify-between">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                Total Biaya Operasional Tercatat:
              </span>
              <span className="text-xl font-black text-rose-900">
                {formatRupiah(totalExpenseSum)}
              </span>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Tanggal</th>
                      <th className="px-6 py-4">Kategori</th>
                      <th className="px-6 py-4">Keterangan / Keperluan</th>
                      <th className="px-6 py-4">Nominal</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-6 py-4 text-slate-600">
                          {formatDate(exp.date)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-700 border border-slate-200">
                            {exp.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{exp.title}</p>
                          {exp.notes && <p className="text-[11px] text-slate-400">{exp.notes}</p>}
                        </td>
                        <td className="px-6 py-4 font-bold text-rose-600">
                          {formatRupiah(exp.amount)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                            title="Hapus Pengeluaran"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Catat Pengeluaran Baru */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Catat Pengeluaran Operasional"
        description="Masukkan bukti biaya listrik, internet, gaji, atau pemeliharaan kost."
      >
        <form onSubmit={handleAddExpense} className="space-y-4 pt-1">
          {expenseError && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
              {expenseError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Kategori Biaya *
              </label>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-rose-500 focus:outline-none"
              >
                <option value="UTILITY">Utilitas (Listrik & Air)</option>
                <option value="INTERNET">Internet / WiFi Fiber</option>
                <option value="MAINTENANCE">Pemeliharaan & Servis</option>
                <option value="SALARY">Gaji Petugas / Staf</option>
                <option value="SUPPLIES">Perlengkapan & Kebersihan</option>
                <option value="OTHER">Lain-lain</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Tanggal Pengeluaran *
              </label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Nama / Judul Pengeluaran *
            </label>
            <input
              type="text"
              required
              value={expenseTitle}
              onChange={(e) => setExpenseTitle(e.target.value)}
              placeholder="Contoh: Beli Token Listrik PLN Induk 1jt"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Nominal Pengeluaran (Rp) *
            </label>
            <input
              type="number"
              required
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              placeholder="1000000"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Catatan / No. Struk (Opsional)
            </label>
            <textarea
              rows={2}
              value={expenseNotes}
              onChange={(e) => setExpenseNotes(e.target.value)}
              placeholder="Keterangan transaksi..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsExpenseModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={savingExpense}
              className="rounded-xl bg-rose-600 px-6 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 disabled:opacity-50 transition"
            >
              {savingExpense ? "Menyimpan..." : "Simpan Pengeluaran"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
