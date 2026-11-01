import React from "react";
import Link from "next/link";
import { Home, MapPin, Phone, Mail, Clock, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white pt-16 pb-12 text-slate-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
                <Home className="h-5 w-5" />
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tight">
                Kamar<span className="text-emerald-600">Kos</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">
              Kost modern eksklusif di Jatinangor, Sumedang. Suasana nyaman, fasilitas lengkap seperti hotel berbintang, dan pembayaran tagihan serba digital terintegrasi.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="h-4 w-4" />
              Keamanan CCTV 24 Jam
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
              Navigasi Cepat
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <Link href="/" className="hover:text-emerald-600 transition">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/kamar" className="hover:text-emerald-600 transition">
                  Katalog Kamar & Harga
                </Link>
              </li>
              <li>
                <a href="/#fasilitas" className="hover:text-emerald-600 transition">
                  Fasilitas Unggulan
                </a>
              </li>
              <li>
                <a href="/#testimoni" className="hover:text-emerald-600 transition">
                  Ulasan Penghuni
                </a>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-600 transition">
                  Login Penghuni & Pengelola
                </Link>
              </li>
            </ul>
          </div>

          {/* Tipe Kamar */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
              Pilihan Kamar
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <Link href="/kamar?typeId=deluxe" className="hover:text-emerald-600 transition">
                  Deluxe Queen AC (Water Heater)
                </Link>
              </li>
              <li>
                <Link href="/kamar?typeId=standard" className="hover:text-emerald-600 transition">
                  Standard Single AC
                </Link>
              </li>
              <li>
                <Link href="/kamar?typeId=economy" className="hover:text-emerald-600 transition">
                  Economy Cozy Fan
                </Link>
              </li>
              <li>
                <a href="/#lokasi" className="hover:text-emerald-600 transition">
                  Akses Kampus UNPAD / ITB / IPDN
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
              Kontak Pengelola
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Jl. Raya Jatinangor No. 88, Hegarmanah, Jatinangor, Kab. Sumedang, Jawa Barat 45363</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>+62 812-2334-4556 (WhatsApp)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>info@kamarkos.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Jam Pelayanan: 08:00 - 20:00 WIB</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-slate-100 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} KamarKos Residence. Hak Cipta Dilindungi Undang-Undang.</p>
          <p className="flex items-center gap-1">
            Dibuat dengan <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" /> untuk kenyamanan tinggal terbaik di Jatinangor
          </p>
        </div>
      </div>
    </footer>
  );
}
