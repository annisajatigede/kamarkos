import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

/**
 * Format number to Indonesian Rupiah currency format
 * e.g. 1500000 -> "Rp 1.500.000"
 */
export function formatRupiah(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "Rp 0";
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format Date to standard Indonesian display
 * e.g. 2024-11-01 -> "01 November 2024"
 */
export function formatDate(date: Date | string | null | undefined, pattern = "dd MMMM yyyy"): string {
  if (!date) return "-";
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, pattern, { locale: id });
  } catch {
    return "-";
  }
}

/**
 * Format Date with time
 * e.g. "01 Nov 2024, 14:30 WIB"
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return `${format(d, "dd MMM yyyy, HH:mm", { locale: id })} WIB`;
  } catch {
    return "-";
  }
}

/**
 * Generate human readable unique invoice number
 * e.g. "INV-202411-0042"
 */
export function generateInvoiceNumber(seq: number): string {
  const d = new Date();
  const yearMonth = format(d, "yyyyMM");
  const pad = seq.toString().padStart(4, "0");
  return `INV-${yearMonth}-${pad}`;
}
