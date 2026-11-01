"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  Layers,
  Users,
  FileText,
  DollarSign,
  BarChart3,
  Wrench,
  Megaphone,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Ringkasan & KPI", icon: LayoutDashboard },
  { href: "/dashboard/kamar", label: "Manajemen Kamar", icon: BedDouble },
  { href: "/dashboard/tipe-kamar", label: "Tipe Kamar", icon: Layers },
  { href: "/dashboard/penyewa", label: "Penghuni Kost", icon: Users },
  { href: "/dashboard/kontrak", label: "Kontrak Sewa", icon: FileText },
  { href: "/dashboard/keuangan", label: "Keuangan & Kas", icon: DollarSign },
  { href: "/dashboard/laporan", label: "Laporan & PDF", icon: BarChart3 },
  { href: "/dashboard/maintenance", label: "Tiket Maintenance", icon: Wrench },
  { href: "/dashboard/komunikasi", label: "Broadcast WhatsApp", icon: Megaphone },
  { href: "/dashboard/properti", label: "Profil Properti", icon: Building2 },
  { href: "/dashboard/pengaturan", label: "Pengaturan Sistem", icon: Settings },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white">
                Kamar<span className="text-emerald-400">Kos</span>
              </span>
              <span className="block text-[10px] font-semibold text-emerald-400 uppercase tracking-widest">
                Owner Portal
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all",
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                    : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-100"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-400")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 font-bold text-emerald-400 text-sm">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate max-w-[120px]">
                  {session?.user?.name || "Pengelola"}
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 uppercase">
                  <Shield className="h-3 w-3" />
                  {session?.user?.role || "OWNER"}
                </span>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition"
              title="Keluar"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-slate-800">
                Sistem Manajemen KamarKos
              </h1>
              <p className="text-xs text-slate-500">
                Residence Jatinangor, Sumedang
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Lihat Web Publik</span>
            </Link>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
