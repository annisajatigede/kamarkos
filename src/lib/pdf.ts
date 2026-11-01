import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatRupiah, formatDate } from "./format";

export interface InvoicePdfData {
  invoiceNumber: string;
  date: Date | string;
  dueDate: Date | string;
  status: string;
  tenantName: string;
  tenantPhone?: string;
  roomNumber: string;
  propertyName: string;
  propertyAddress: string;
  items: Array<{ title: string; amount: number }>;
  totalAmount: number;
  paymentMethod?: string;
  paidDate?: Date | string | null;
}

export function generateInvoiceReceiptPdf(data: InvoicePdfData): Buffer {
  const doc = new jsPDF();

  // Header Box
  doc.setFillColor(22, 163, 74); // primary-600
  doc.rect(0, 0, 210, 36, "F");

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("KAMARKOS", 14, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Kwitansi & Bukti Pembayaran Resmi", 14, 26);

  // Status Badge on Header
  const statusText = data.status === "PAID" ? "LUNAS (PAID)" : "BELUM LUNAS";
  doc.setFillColor(data.status === "PAID" ? 34 : 220, data.status === "PAID" ? 197 : 38, data.status === "PAID" ? 94 : 38);
  doc.roundedRect(140, 10, 56, 16, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(statusText, 145, 20);

  // Metadata Section
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Informasi Tagihan:", 14, 48);
  doc.setFont("helvetica", "normal");
  doc.text(`Nomor Invoice : ${data.invoiceNumber}`, 14, 55);
  doc.text(`Tanggal Terbit : ${formatDate(data.date)}`, 14, 62);
  doc.text(`Jatuh Tempo    : ${formatDate(data.dueDate)}`, 14, 69);
  if (data.paidDate) {
    doc.text(`Tanggal Bayar  : ${formatDate(data.paidDate)}`, 14, 76);
  }

  doc.setFont("helvetica", "bold");
  doc.text("Data Penyewa & Unit:", 115, 48);
  doc.setFont("helvetica", "normal");
  doc.text(`Nama Penyewa  : ${data.tenantName}`, 115, 55);
  doc.text(`No. Handphone : ${data.tenantPhone || "-"}`, 115, 62);
  doc.text(`Kamar Kost    : Kamar ${data.roomNumber}`, 115, 69);
  doc.text(`Properti      : ${data.propertyName}`, 115, 76);

  // Table items
  const tableRows = data.items.map((item, index) => [
    (index + 1).toString(),
    item.title,
    "1",
    formatRupiah(item.amount),
    formatRupiah(item.amount),
  ]);

  autoTable(doc, {
    startY: 85,
    head: [["No", "Deskripsi Rincian Tagihan", "Qty", "Harga Satuan", "Total"]],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: [22, 163, 74],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 15, halign: "center" },
      1: { cellWidth: 90 },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 35, halign: "right" },
      4: { cellWidth: 35, halign: "right" },
    },
  });

  // Total summary below table
  // @ts-expect-error autoTable adds lastAutoTable to doc
  const finalY = doc.lastAutoTable?.finalY || 130;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("TOTAL PEMBAYARAN:", 110, finalY + 12);
  doc.setFontSize(13);
  doc.setTextColor(22, 163, 74);
  doc.text(formatRupiah(data.totalAmount), 160, finalY + 12);

  // Footer & signature note
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text(
    "* Dokumen ini diterbitkan secara elektronik melalui Sistem KamarKos dan sah tanpa tanda tangan basah.",
    14,
    finalY + 30
  );
  doc.text(`Dicetak pada: ${formatDate(new Date(), "dd MMMM yyyy HH:mm")}`, 14, finalY + 36);

  return Buffer.from(doc.output("arraybuffer"));
}

export interface FinancialReportPdfData {
  period: string;
  propertyName: string;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  occupancyRate: number;
  transactions: Array<{
    date: Date | string;
    type: "INCOME" | "EXPENSE";
    category: string;
    description: string;
    amount: number;
  }>;
}

export function generateFinancialReportPdf(data: FinancialReportPdfData): Buffer {
  const doc = new jsPDF();

  // Header Box
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, 210, 36, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("LAPORAN KEUANGAN BULANAN", 14, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Properti: ${data.propertyName} | Periode: ${data.period}`, 14, 26);

  // Summary Cards
  doc.setDrawColor(226, 232, 240);
  // Income card
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(14, 44, 58, 24, 2, 2, "FD");
  doc.setTextColor(22, 101, 52);
  doc.setFontSize(9);
  doc.text("TOTAL PENDAPATAN", 18, 52);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(formatRupiah(data.totalIncome), 18, 62);

  // Expense card
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(76, 44, 58, 24, 2, 2, "FD");
  doc.setTextColor(153, 27, 27);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("TOTAL PENGELUARAN", 80, 52);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(formatRupiah(data.totalExpense), 80, 62);

  // Net Profit card
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(138, 44, 58, 24, 2, 2, "FD");
  doc.setTextColor(30, 64, 175);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("LABA BERSIH (NET)", 142, 52);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(formatRupiah(data.netProfit), 142, 62);

  // Table of transactions
  const tableRows = data.transactions.map((tx, idx) => [
    (idx + 1).toString(),
    formatDate(tx.date, "dd/MM/yyyy"),
    tx.type === "INCOME" ? "Pemasukan" : "Pengeluaran",
    tx.category,
    tx.description,
    formatRupiah(tx.amount),
  ]);

  autoTable(doc, {
    startY: 76,
    head: [["No", "Tanggal", "Tipe", "Kategori", "Keterangan", "Nominal"]],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: 26 },
      2: { cellWidth: 26 },
      3: { cellWidth: 30 },
      4: { cellWidth: 60 },
      5: { cellWidth: 36, halign: "right" },
    },
  });

  return Buffer.from(doc.output("arraybuffer"));
}
