"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Home,
  Receipt,
  Wrench,
  History,
  Star,
  User,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const portalNavItems = [
  { href: "/portal", label: "Beranda", icon: Home },
  { href: "/portal/tagihan", label: "Tagihan", icon: Receipt },
  { href: "/portal/maintenance", label: "Keluhan", icon: Wrench },
  { href: "/portal/riwayat", label: "Riwayat", icon: History },
  { href: "/portal/review", label: "Ulasan", icon: Star },
  { href: "/portal/profil", label: "Profil", icon: User },
];

export function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 h-18">
          <Link href="/portal" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-black text-slate-900 tracking-tight">
                Portal<span className="text-emerald-600">Penghuni</span>
              </span>
              <span className="block text-[10px] font-semibold text-slate-400">
                KamarKos Residence
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {portalNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all",
                    isActive
                      ? "bg-emerald-50 text-emerald-700 font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive ? "text-emerald-600" : "text-slate-500")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User profile & Sign out */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
              title="Lihat Website Publik"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Web</span>
            </Link>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <span className="text-xs font-bold text-slate-700 hidden sm:inline">
                {session?.user?.name || "Penghuni"}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                title="Keluar Akun"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 px-2 py-2 flex items-center justify-around shadow-lg">
        {portalNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-[10px] font-semibold transition-all",
                isActive ? "text-emerald-600 font-bold" : "text-slate-500 hover:text-slate-800"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive ? "text-emerald-600" : "text-slate-400")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
