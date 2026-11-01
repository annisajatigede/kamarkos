"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Wifi,
  ShieldCheck,
  Car,
  UtensilsCrossed,
  Sun,
  Tv,
  CheckCircle2,
  Star,
  MapPin,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  BedDouble,
  Users,
  Phone,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { FloatingWhatsApp } from "@/components/ui/FloatingWhatsApp";
import { StatusBadge } from "@/components/ui/Badge";
import { formatRupiah } from "@/lib/format";

interface RoomType {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  size: string;
  facilities: string;
  images: string;
}

interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  status: string;
  customPrice?: number;
  roomType: RoomType;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  tenant: { name: string; avatar?: string };
}

export default function LandingPage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/rooms")
      .then((res) => res.json())
      .then((data) => {
        if (data.roomTypes) setRoomTypes(data.roomTypes);
        if (data.rooms) setRooms(data.rooms);
        if (data.property?.reviews) setReviews(data.property.reviews);
      })
      .catch((err) => console.error("Error loading rooms:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredRooms = rooms.filter((r) => {
    if (statusFilter === "ALL") return true;
    return r.status === statusFilter;
  });

  const availableCount = rooms.filter((r) => r.status === "AVAILABLE").length;

  const facilities = [
    {
      icon: Wifi,
      title: "WiFi Dedicated 100 Mbps",
      desc: "Koneksi internet fiber optik stabil untuk kuliah daring, streaming, dan kerja remote.",
    },
    {
      icon: ShieldCheck,
      title: "Keamanan & CCTV 24 Jam",
      desc: "Sistem keamanan dengan kamera pengawas di setiap lorong dan akses gerbang terkontrol.",
    },
    {
      icon: Car,
      title: "Parkir Motor & Mobil Luas",
      desc: "Area parkir dalam berpagar aman dan terlindung dari cuaca hujan.",
    },
    {
      icon: UtensilsCrossed,
      title: "Dapur Bersama Lengkap",
      desc: "Dilengkapi kompor gas, kulkas bersama, dispenser air mineral gratis, dan microwave.",
    },
    {
      icon: Sun,
      title: "Rooftop & Area Jemur Luas",
      desc: "Area santai dengan pemandangan pegunungan Jatinangor dan tempat menjemur pakaian terlindung.",
    },
    {
      icon: Tv,
      title: "Smart TV & Fasilitas Kamar",
      desc: "Kamar tipe Deluxe dilengkapi Smart TV untuk hiburan Netflix dan YouTube.",
    },
  ];

  const faqs = [
    {
      q: "Bagaimana sistem pembayaran sewa di KamarKos?",
      a: "Pembayaran sewa dapat dilakukan secara fleksibel melalui transfer manual ke rekening bank atau langsung melalui portal online Midtrans (BCA VA, Mandiri, BRI, QRIS, GoPay). Kwitansi resmi akan otomatis terbit di portal penghuni.",
    },
    {
      q: "Berapa lama minimal masa kontrak sewa?",
      a: "Masa kontrak sewa minimal adalah 1 bulan. Kami juga memberikan potongan khusus untuk pembayaran per 3 bulan, 6 bulan, atau 1 tahun di muka.",
    },
    {
      q: "Apakah biaya sewa sudah termasuk listrik dan air?",
      a: "Biaya air PDAM dan WiFi sudah termasuk gratis (free). Untuk listrik, setiap kamar dilengkapi meteran token mandiri sehingga penghuni dapat mengatur penggunaan listrik secara transparan.",
    },
    {
      q: "Apakah boleh membawa tamu ke dalam kamar?",
      a: "Tamu keluarga atau teman dapat berkunjung dan berkumpul di ruang tamu bersama atau area rooftop. Demi kenyamanan dan privasi bersama, tamu lawan jenis dilarang masuk ke dalam kamar tidur.",
    },
    {
      q: "Bagaimana jika ada fasilitas kamar yang rusak?",
      a: "Penghuni cukup mengajukan tiket perbaikan melalui menu Maintenance di Portal Penghuni disertai foto kendala. Teknisi kami akan segera menangani dalam waktu maksimal 1x24 jam.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-slate-50 to-white pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100/80 px-4 py-1.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span>Kost Eksklusif Terbaik di Jatinangor, Sumedang</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Tinggal Nyaman, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500">
                  Fasilitas Lengkap
                </span>
                , Serba Digital.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Nikmati kenyamanan hunian kost modern dengan kasur queen size, AC sejuk, kamar mandi dalam dengan water heater, WiFi 100 Mbps, dan sistem tagihan digital transparan.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/kamar"
                  className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-base font-bold text-white shadow-xl shadow-emerald-600/30 hover:bg-emerald-700 hover:scale-[1.02] active:scale-95 transition"
                >
                  <BedDouble className="h-5 w-5" />
                  <span>Lihat Kamar Kosong ({availableCount} Tersedia)</span>
                </Link>

                <a
                  href="#fasilitas"
                  className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-bold text-slate-700 shadow-sm hover:border-emerald-500 hover:text-emerald-600 transition"
                >
                  <span>Fasilitas Kost</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>

              {/* Trust Badges */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-6 max-w-lg">
                <div>
                  <h4 className="text-2xl font-black text-slate-900">12 Unit</h4>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Kamar Lantai 1 & 2</p>
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-900">100 Mbps</h4>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Dedicated Fiber WiFi</p>
                </div>
                <div>
                  <h4 className="text-2xl font-black text-emerald-600 flex items-center gap-1">
                    4.9 <Star className="h-4 w-4 fill-emerald-600" />
                  </h4>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Rating Penghuni</p>
                </div>
              </div>
            </div>

            {/* Right Column Hero Images Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="overflow-hidden rounded-3xl shadow-2xl border-4 border-white bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1000&auto=format&fit=crop&q=80"
                    alt="Kamar Kost Deluxe Jatinangor"
                    className="h-[420px] w-full object-cover transition duration-700 hover:scale-105"
                  />
                </div>

                {/* Floating Availability Pill */}
                <div className="absolute -bottom-6 -left-6 rounded-2xl bg-white p-4 shadow-xl border border-slate-100 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Status Kamar
                    </span>
                    <p className="text-sm font-black text-slate-800">
                      {availableCount} Kamar Siap Huni
                    </p>
                  </div>
                </div>

                {/* Floating Location Pill */}
                <div className="absolute -top-6 -right-6 rounded-2xl bg-white p-4 shadow-xl border border-slate-100 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Lokasi Strategis
                    </span>
                    <p className="text-sm font-black text-slate-800">
                      3 Menit ke UNPAD
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Room Types Section */}
      <section id="tipe-kamar" className="py-20 bg-white border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              PILIHAN TIPE KAMAR
            </h2>
            <h3 className="text-3xl font-black text-slate-900 sm:text-4xl">
              Pilih Ruang Tinggal Sesuai Kebutuhan Anda
            </h3>
            <p className="text-slate-600 text-sm sm:text-base">
              Setiap kamar didesain dengan sirkulasi udara optimal, pencahayaan alami, dan perabotan lengkap.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            {roomTypes.map((type) => {
              let imagesList: string[] = [];
              let facilitiesList: string[] = [];
              try {
                if (type.images) imagesList = JSON.parse(type.images);
                if (type.facilities) facilitiesList = JSON.parse(type.facilities);
              } catch (e) {
                imagesList = [];
                facilitiesList = [];
              }

              const coverImage = imagesList[0] || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80";

              return (
                <div
                  key={type.id}
                  className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  <div className="relative h-60 w-full overflow-hidden bg-slate-100">
                    <img
                      src={coverImage}
                      alt={type.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-4 left-4 rounded-xl bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 text-xs font-bold text-white">
                      Ukuran {type.size || "3x3 m"}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-xl font-bold text-slate-900">{type.name}</h4>
                      </div>
                      <p className="mt-2 text-xs text-slate-500 line-clamp-2">
                        {type.description}
                      </p>

                      <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Fasilitas Kamar:
                        </span>
                        <div className="space-y-1.5">
                          {facilitiesList.slice(0, 4).map((fac, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <span>{fac}</span>
                            </div>
                          ))}
                          {facilitiesList.length > 4 && (
                            <span className="text-[11px] font-semibold text-emerald-600 pl-5 block">
                              +{facilitiesList.length - 4} fasilitas lainnya
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400">Harga Sewa</span>
                        <p className="text-xl font-black text-emerald-600">
                          {formatRupiah(type.basePrice)}
                          <span className="text-xs font-normal text-slate-500">/bln</span>
                        </p>
                      </div>

                      <Link
                        href={`/kamar?typeId=${type.id}`}
                        className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-600 transition"
                      >
                        Pilih Kamar
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Facilities Grid Section */}
      <section id="fasilitas" className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              FASILITAS BERSAMA
            </h2>
            <h3 className="text-3xl font-black text-slate-900 sm:text-4xl">
              Dirancang untuk Produktivitas & Kenyamanan
            </h3>
            <p className="text-slate-600 text-sm sm:text-base">
              Semua fasilitas dirawat berkala agar penghuni dapat beraktivitas dan istirahat dengan optimal.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {facilities.map((fac, i) => {
              const Icon = fac.icon;
              return (
                <div
                  key={i}
                  className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm hover:shadow-md transition hover:-translate-y-1"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 mb-5">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">{fac.title}</h4>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                    {fac.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* All Rooms Matrix Section */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                STATUS KETERSEDIAAN KAMAR REAL-TIME
              </h2>
              <h3 className="text-3xl font-black text-slate-900 mt-1">
                Daftar Seluruh Unit Kamar
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Cek langsung nomor kamar yang masih kosong di Lantai 1 dan Lantai 2.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl self-start md:self-auto">
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${statusFilter === "ALL" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              >
                Semua ({rooms.length})
              </button>
              <button
                onClick={() => setStatusFilter("AVAILABLE")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${statusFilter === "AVAILABLE" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              >
                Tersedia ({availableCount})
              </button>
              <button
                onClick={() => setStatusFilter("OCCUPIED")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${statusFilter === "OCCUPIED" ? "bg-rose-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              >
                Terisi
              </button>
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredRooms.map((room) => {
              const isAvailable = room.status === "AVAILABLE";
              return (
                <div
                  key={room.id}
                  className={`rounded-2xl border p-4 transition text-center flex flex-col justify-between ${isAvailable ? "bg-white border-emerald-200 hover:border-emerald-500 shadow-sm hover:shadow-md" : "bg-slate-50/70 border-slate-200 opacity-80"}`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400">
                        Lt. {room.floor}
                      </span>
                      <StatusBadge status={room.status} />
                    </div>
                    <h5 className="text-2xl font-black text-slate-900 mt-2">
                      {room.roomNumber}
                    </h5>
                    <p className="text-[11px] font-semibold text-slate-600 mt-1 line-clamp-1">
                      {room.roomType.name}
                    </p>
                    <p className="text-xs font-bold text-emerald-600 mt-2">
                      {formatRupiah(room.customPrice ?? room.roomType.basePrice)}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    {isAvailable ? (
                      <Link
                        href={`/kamar/${room.id}`}
                        className="block w-full rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
                      >
                        Pesan
                      </Link>
                    ) : (
                      <span className="block w-full py-1 text-[11px] font-semibold text-slate-400">
                        Tidak Tersedia
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimoni" className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              ULASAN PENGHUNI
            </h2>
            <h3 className="text-3xl font-black text-slate-900 sm:text-4xl">
              Pengalaman Tinggal di KamarKos
            </h3>
            <p className="text-slate-600 text-sm sm:text-base">
              Testimoni jujur dari mahasiswa dan profesional yang tinggal bersama kami.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 italic leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm">
                    {rev.tenant.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">{rev.tenant.name}</h5>
                    <span className="text-xs text-slate-400">Penghuni Terverifikasi</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Landmark Section */}
      <section id="lokasi" className="py-20 bg-white border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                AKSES STRATEGIS
              </span>
              <h3 className="text-3xl font-black text-slate-900 sm:text-4xl">
                Dekat dengan Kampus & Pusat Kuliner
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Lokasi kost sangat ideal untuk mobilitas harian mahasiswa maupun pekerja di kawasan Jatinangor dan Bandung Timur.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold">
                    3 mnt
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">Universitas Padjadjaran (UNPAD)</h5>
                    <p className="text-xs text-slate-500">Hanya 800 meter ke gerbang lama / baru</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold">
                    5 mnt
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">Institut Teknologi Bandung (ITB Jatinangor)</h5>
                    <p className="text-xs text-slate-500">Akses mudah lewat jalan raya utama</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold">
                    5 mnt
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">Gerbang Tol Cisumdawu (Jatinangor)</h5>
                    <p className="text-xs text-slate-500">Langsung terkoneksi ke Tol Purbaleunyi / Bandara Kertajati</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Card */}
            <div className="rounded-3xl border border-slate-200 bg-slate-900 p-8 text-white space-y-6 shadow-xl">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                  ALAMAT LENGKAP
                </span>
                <h4 className="text-2xl font-bold mt-1 text-white">
                  KamarKos Residence Jatinangor
                </h4>
                <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                  Jl. Raya Jatinangor No. 88, Hegarmanah, Kec. Jatinangor, Kabupaten Sumedang, Jawa Barat 45363.
                </p>
              </div>

              <div className="pt-6 border-t border-slate-800 space-y-3 text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="h-4 w-4 text-emerald-400" />
                  <span>+62 812-2334-4556 (Bpk. H. Hendra)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                  <span>Titik Koordinat: -6.9298, 107.7735</span>
                </div>
              </div>

              <div className="pt-4">
                <a
                  href="https://maps.google.com/?q=Jatinangor+Sumedang"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-500 transition"
                >
                  <MapPin className="h-4 w-4" />
                  Buka di Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              TANYA JAWAB (FAQ)
            </h2>
            <h3 className="text-3xl font-black text-slate-900">
              Pertanyaan yang Sering Diajukan
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-5 text-left text-base font-bold text-slate-900 hover:text-emerald-600 transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? "rotate-180 text-emerald-600" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-green-600 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h3 className="text-3xl sm:text-4xl font-black">
            Siap Menikmati Pengalaman Tinggal Terbaik?
          </h3>
          <p className="text-emerald-100 max-w-xl mx-auto text-sm sm:text-base">
            Unit kamar terbatas! Segera pilih nomor kamar favorit Anda dan ajukan reservasi online hari ini.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link
              href="/kamar"
              className="rounded-2xl bg-white px-8 py-4 font-bold text-emerald-700 shadow-xl hover:bg-slate-100 transition"
            >
              Cari & Pesan Kamar Sekarang
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
