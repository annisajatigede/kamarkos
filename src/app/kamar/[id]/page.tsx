"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { FloatingWhatsApp } from "@/components/ui/FloatingWhatsApp";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatRupiah } from "@/lib/format";
import {
  ArrowLeft,
  CheckCircle2,
  Calendar,
  User,
  Mail,
  Phone,
  FileText,
  ShieldAlert,
  MapPin,
  Sparkles,
  BedDouble,
  Check,
} from "lucide-react";

interface RoomDetail {
  id: string;
  roomNumber: string;
  floor: number;
  status: string;
  customPrice?: number;
  notes?: string;
  roomType: {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    deposit: number;
    size: string;
    facilities: string;
    images: string;
  };
  property: {
    id: string;
    name: string;
    address: string;
    city: string;
    district: string;
    description: string;
    rules: string;
  };
}

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Booking Form State
  const [bookingName, setBookingName] = useState("");
  const [bookingEmail, setBookingEmail] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch(`/api/public/rooms/${roomId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.room) {
          setRoom(data.room);
          try {
            const imgs = JSON.parse(data.room.roomType.images || "[]");
            if (imgs.length > 0) setSelectedImage(imgs[0]);
          } catch {
            setSelectedImage("");
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [roomId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-7xl mx-auto px-4 py-16 w-full">
          <div className="h-96 rounded-3xl bg-slate-200 animate-pulse" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-md mx-auto px-4 py-20 text-center">
          <BedDouble className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800">Kamar Tidak Ditemukan</h2>
          <p className="text-sm text-slate-500 mt-2">Kamar mungkin telah dihapus atau dipindahkan.</p>
          <Link
            href="/kamar"
            className="mt-6 inline-flex rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white"
          >
            Kembali ke Katalog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  let imagesList: string[] = [];
  let facilitiesList: string[] = [];
  let rulesList: string[] = [];

  try {
    if (room.roomType.images) imagesList = JSON.parse(room.roomType.images);
    if (room.roomType.facilities) facilitiesList = JSON.parse(room.roomType.facilities);
    if (room.property.rules) rulesList = JSON.parse(room.property.rules);
  } catch {
    // fallback
  }

  if (imagesList.length === 0) {
    imagesList = ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1000&auto=format&fit=crop&q=80"];
  }
  const currentImg = selectedImage || imagesList[0];
  const price = room.customPrice ?? room.roomType.basePrice;
  const isAvailable = room.status === "AVAILABLE";

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/public/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room.id,
          name: bookingName,
          email: bookingEmail,
          phone: bookingPhone,
          checkInDate,
          notes: bookingNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengajukan booking");
      }

      setBookingSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Terjadi kesalahan");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb Back */}
        <Link
          href="/kamar"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-600 transition mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Katalog Kamar</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Photos & Details */}
          <div className="lg:col-span-8 space-y-8">
            {/* Main Photo Showcase */}
            <div className="space-y-4">
              <div className="relative h-[380px] sm:h-[460px] w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-md">
                <img
                  src={currentImg}
                  alt={`Kamar ${room.roomNumber}`}
                  className="h-full w-full object-cover transition duration-500"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="rounded-xl bg-slate-900/90 backdrop-blur-sm px-3.5 py-1.5 text-xs font-bold text-white shadow-sm">
                    Kamar {room.roomNumber}
                  </span>
                  <span className="rounded-xl bg-white/90 backdrop-blur-sm px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm">
                    Lantai {room.floor}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <StatusBadge status={room.status} />
                </div>
              </div>

              {/* Thumbnail Selector */}
              {imagesList.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {imagesList.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-2xl border-2 transition ${currentImg === img ? "border-emerald-600 ring-2 ring-emerald-600/20" : "border-slate-200 opacity-70 hover:opacity-100"}`}
                    >
                      <img src={img} alt="Thumb" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Room Info Header */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                    Kamar {room.roomNumber} - {room.roomType.name}
                  </h1>
                  <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <span>{room.property.name} • {room.property.address}</span>
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                {room.roomType.description}
              </p>

              {/* Quick Specs Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Dimensi</span>
                  <p className="text-sm font-bold text-slate-800">{room.roomType.size || "3x4 m"}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Posisi Lantai</span>
                  <p className="text-sm font-bold text-slate-800">Lantai {room.floor}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Deposit Jaminan</span>
                  <p className="text-sm font-bold text-slate-800">{formatRupiah(room.roomType.deposit)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Status Unit</span>
                  <p className="text-sm font-bold text-emerald-600">
                    {isAvailable ? "Siap Dihuni" : "Terisi / Servis"}
                  </p>
                </div>
              </div>
            </div>

            {/* Room Facilities List */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Fasilitas Kamar Ini</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {facilitiesList.map((fac, idx) => (
                  <div key={idx} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 border border-slate-100">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    <span className="text-xs font-semibold text-slate-700">{fac}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Property Rules */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-bold text-slate-900">Tata Tertib & Ketentuan Kost</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 list-disc list-inside leading-relaxed pt-2">
                {rulesList.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Pricing & Booking Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl space-y-6">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Harga Sewa Bulanan
                </span>
                <div className="mt-1 flex items-baseline gap-1">
                  <h3 className="text-3xl font-black text-emerald-600">
                    {formatRupiah(price)}
                  </h3>
                  <span className="text-xs font-semibold text-slate-400">/ bulan</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  * Sudah termasuk biaya air PDAM dan WiFi internet 100 Mbps.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Biaya Sewa per Bulan</span>
                  <span className="font-bold text-slate-800">{formatRupiah(price)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Deposit Awal (Refundable)</span>
                  <span className="font-bold text-slate-800">{formatRupiah(room.roomType.deposit)}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900 text-sm">
                  <span>Estimasi Bayar Pertama</span>
                  <span className="text-emerald-600">{formatRupiah(price + room.roomType.deposit)}</span>
                </div>
              </div>

              {isAvailable ? (
                <button
                  onClick={() => setIsBookingOpen(true)}
                  className="w-full rounded-2xl bg-emerald-600 py-4 font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 active:scale-95 transition"
                >
                  Ajukan Sewa Kamar Ini
                </button>
              ) : (
                <div className="rounded-2xl bg-slate-100 p-4 text-center">
                  <p className="text-xs font-bold text-slate-500">
                    Kamar ini saat ini sedang terisi / dalam perawatan.
                  </p>
                  <Link
                    href="/kamar"
                    className="mt-2 block text-xs font-bold text-emerald-600 hover:underline"
                  >
                    Lihat Kamar Kosong Lainnya
                  </Link>
                </div>
              )}

              <div className="border-t border-slate-100 pt-4 space-y-2">
                <a
                  href={`https://wa.me/6281223344556?text=${encodeURIComponent(`Halo Pengelola KamarKos, saya tertarik bertanya mengenai ketersediaan Kamar ${room.roomNumber} (${room.roomType.name}).`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 py-3 text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition"
                >
                  <Phone className="h-4 w-4" />
                  <span>Tanya Langsung ke Pengelola via WA</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Form Modal */}
      <Modal
        isOpen={isBookingOpen}
        onClose={() => {
          setIsBookingOpen(false);
          setBookingSuccess(false);
          setErrorMsg("");
        }}
        title={`Reservasi Kamar ${room.roomNumber}`}
        description={`Ajukan permohonan sewa untuk ${room.roomType.name} di ${room.property.name}`}
      >
        {bookingSuccess ? (
          <div className="py-6 text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mx-auto">
              <Check className="h-8 w-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Pengajuan Berhasil Dikirim!</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Pengelola KamarKos telah menerima data Anda dan akan segera menghubungi nomor WhatsApp <b>{bookingPhone}</b> untuk konfirmasi penandatanganan kontrak dan jadwal check-in.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={() => {
                  setIsBookingOpen(false);
                  router.push("/kamar");
                }}
                className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
              >
                Selesai
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit} className="space-y-4 pt-2">
            {errorMsg && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Nama Lengkap Sesuai KTP *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={bookingName}
                  onChange={(e) => setBookingName(e.target.value)}
                  placeholder="Contoh: Ahmad Fauzi"
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nomor WhatsApp Aktif *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={bookingPhone}
                    onChange={(e) => setBookingPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Alamat Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={bookingEmail}
                    onChange={(e) => setBookingEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Rencana Tanggal Mulai Masuk (Check-in) *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  required
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Catatan Tambahan (Opsional)
              </label>
              <textarea
                rows={2}
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder="Misal: Saya mahasiswa UNPAD baru angkatan 2024..."
                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsBookingOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                {submitting ? "Mengirim..." : "Kirim Pengajuan Sewa"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
