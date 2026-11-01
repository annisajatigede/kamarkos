"use client";
import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Home, Mail, Lock, LogIn, Sparkles, Shield, User, Wrench, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error || "Email atau password salah.");
        setLoading(false);
        return;
      }

      // Check user role by fetching me API to redirect cleanly
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      const role = meData?.user?.role;

      if (role === "OWNER" || role === "STAFF") {
        router.push(callbackUrl || "/dashboard");
      } else {
        router.push(callbackUrl || "/portal");
      }
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setError("Terjadi kesalahan saat masuk. Coba lagi.");
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
            <Home className="h-6 w-6" />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            Kamar<span className="text-emerald-600">Kos</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900">
          Masuk ke Akun Anda
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Akses Portal Penghuni atau Dashboard Pengelola Kost
        </p>
      </div>

      {/* Main Form Box */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-semibold text-rose-700 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@kamarkos.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 transition"
            >
              {loading ? "Memverifikasi..." : "Masuk Sekarang"}
            </button>
          </form>

          {/* Quick Demo Switcher Section */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-3">
              ⚡ Akun Demo Uji Coba Cepat (1-Klik)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo("owner@kamarkos.com", "password123")}
                className="flex flex-col items-center justify-center rounded-xl border border-slate-200 p-2 text-center hover:border-emerald-500 hover:bg-emerald-50/50 transition group"
              >
                <Shield className="h-4 w-4 text-slate-600 group-hover:text-emerald-600 mb-1" />
                <span className="text-[10px] font-bold text-slate-800">Owner</span>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo("staff@kamarkos.com", "password123")}
                className="flex flex-col items-center justify-center rounded-xl border border-slate-200 p-2 text-center hover:border-blue-500 hover:bg-blue-50/50 transition group"
              >
                <Wrench className="h-4 w-4 text-slate-600 group-hover:text-blue-600 mb-1" />
                <span className="text-[10px] font-bold text-slate-800">Staff</span>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo("penyewa1@kamarkos.com", "password123")}
                className="flex flex-col items-center justify-center rounded-xl border border-slate-200 p-2 text-center hover:border-emerald-500 hover:bg-emerald-50/50 transition group"
              >
                <User className="h-4 w-4 text-slate-600 group-hover:text-emerald-600 mb-1" />
                <span className="text-[10px] font-bold text-slate-800">Penyewa</span>
              </button>
            </div>
          </div>

          {/* Register Prompt */}
          <div className="pt-2 text-center">
            <p className="text-xs text-slate-500">
              Belum punya akun?{" "}
              <Link href="/register" className="font-bold text-emerald-600 hover:underline">
                Daftar Penghuni Baru
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm font-semibold text-slate-400">Memuat...</div>}>
      <LoginForm />
    </Suspense>
  );
}
