"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Home, Sparkles, Phone, LogIn, Menu, X, LayoutDashboard, UserCheck, LogOut } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isOwnerOrStaff = session?.user?.role === "OWNER" || session?.user?.role === "STAFF";
  const isTenant = session?.user?.role === "TENANT";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
            <Home className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-emerald-600 transition">
              Kamar<span className="text-emerald-600">Kos</span>
            </span>
            <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
              Residence Jatinangor
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <Link href="/" className="hover:text-emerald-600 transition">
            Beranda
          </Link>
          <Link href="/kamar" className="hover:text-emerald-600 transition">
            Pilihan Kamar
          </Link>
          <a href="/#fasilitas" className="hover:text-emerald-600 transition">
            Fasilitas
          </a>
          <a href="/#testimoni" className="hover:text-emerald-600 transition">
            Ulasan
          </a>
          <a href="/#faq" className="hover:text-emerald-600 transition">
            FAQ
          </a>
          <a href="/#lokasi" className="hover:text-emerald-600 transition">
            Lokasi
          </a>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {session?.user ? (
            <div className="flex items-center gap-3">
              {isOwnerOrStaff ? (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard Owner
                </Link>
              ) : isTenant ? (
                <Link
                  href="/portal"
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
                >
                  <UserCheck className="h-4 w-4" />
                  Portal Penghuni
                </Link>
              ) : null}

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-100 hover:text-rose-600 transition"
                title="Keluar"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-emerald-500 hover:text-emerald-600 transition"
              >
                <LogIn className="h-4 w-4" />
                Masuk
              </Link>
              <Link
                href="/kamar"
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-500/20 hover:bg-emerald-700 transition"
              >
                <Sparkles className="h-4 w-4" />
                Cari Kamar
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden rounded-xl p-2 text-slate-600 hover:bg-slate-100 transition"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Beranda
          </Link>
          <Link
            href="/kamar"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Pilihan Kamar
          </Link>
          <a
            href="/#fasilitas"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Fasilitas
          </a>
          <a
            href="/#testimoni"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Ulasan
          </a>
          <a
            href="/#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            FAQ
          </a>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            {session?.user ? (
              <>
                {isOwnerOrStaff ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard Owner
                  </Link>
                ) : (
                  <Link
                    href="/portal"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white"
                  >
                    <UserCheck className="h-4 w-4" />
                    Portal Penghuni
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar Akun
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-700"
                >
                  <LogIn className="h-4 w-4" />
                  Masuk
                </Link>
                <Link
                  href="/kamar"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white"
                >
                  <Sparkles className="h-4 w-4" />
                  Cari & Pesan Kamar
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
