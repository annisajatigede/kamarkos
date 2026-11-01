import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "outline";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-slate-100 text-slate-800 border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    outline: "bg-transparent text-slate-600 border-slate-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "AVAILABLE":
      return <Badge variant="success">Tersedia</Badge>;
    case "OCCUPIED":
      return <Badge variant="danger">Terisi</Badge>;
    case "MAINTENANCE":
      return <Badge variant="warning">Perbaikan</Badge>;
    case "PAID":
      return <Badge variant="success">Lunas</Badge>;
    case "UNPAID":
      return <Badge variant="warning">Belum Lunas</Badge>;
    case "OVERDUE":
      return <Badge variant="danger">Jatuh Tempo</Badge>;
    case "CANCELLED":
      return <Badge variant="outline">Dibatalkan</Badge>;
    case "ACTIVE":
      return <Badge variant="success">Aktif</Badge>;
    case "REPORTED":
      return <Badge variant="warning">Dilaporkan</Badge>;
    case "IN_PROGRESS":
      return <Badge variant="info">Sedang Dikerjakan</Badge>;
    case "COMPLETED":
      return <Badge variant="success">Selesai</Badge>;
    case "LOW":
      return <Badge variant="outline">Rendah</Badge>;
    case "MEDIUM":
      return <Badge variant="info">Sedang</Badge>;
    case "HIGH":
      return <Badge variant="warning">Tinggi</Badge>;
    case "URGENT":
      return <Badge variant="danger">Mendesak</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
}
