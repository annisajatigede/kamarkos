"use client";
import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { FloatingWhatsApp } from "@/components/ui/FloatingWhatsApp";
import { StatusBadge } from "@/components/ui/Badge";
import { formatRupiah } from "@/lib/format";
import { BedDouble, Filter, CheckCircle2, Search, SlidersHorizontal, ArrowLeft } from "lucide-react";

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
  notes?: string;
  roomType: RoomType;
}

function KamarCatalogContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("typeId") || "ALL";

  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [selectedFloor, setSelectedFloor] = useState<string>("ALL");
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/rooms")
      .then((res) => res.json())
      .then((data) => {
        if (data.rooms) setRooms(data.rooms);
        if (data.roomTypes) setRoomTypes(data.roomTypes);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredRooms = rooms.filter((room) => {
    if (selectedType !== "ALL" && room.roomType.id !== selectedType) {
      return false;
    }
    if (selectedFloor !== "ALL" && room.floor.toString() !== selectedFloor) {
      return false;
    }
    if (onlyAvailable && room.status !== "AVAILABLE") {
      return false;
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchNumber = room.roomNumber.toLowerCase().includes(q);
      const matchType = room.roomType.name.toLowerCase().includes(q);
      if (!matchNumber && !matchType) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Header Banner */}
      <div className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Beranda</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Katalog Kamar Kost
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl">
            Cari dan temukan kamar kost idaman Anda. Pilih tipe fasilitas, lokasi lantai, dan cek ketersediaan secara langsung.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="border-b border-slate-200 bg-white sticky top-20 z-30 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nomor kamar (misal: 101, 203) atau tipe..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Filters Group */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Tipe Kamar */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                  Tipe:
                </span>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="ALL">Semua Tipe Kamar</option>
                  {roomTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Lantai */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                  Lantai:
                </span>
                <select
                  value={selectedFloor}
                  onChange={(e) => setSelectedFloor(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="ALL">Semua Lantai</option>
                  <option value="1">Lantai 1</option>
                  <option value="2">Lantai 2</option>
                </select>
              </div>

              {/* Checkbox Hanya Tersedia */}
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 select-none">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Hanya Kamar Kosong</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Content Area */}
      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-semibold text-slate-600">
            Menampilkan <span className="text-slate-900 font-bold">{filteredRooms.length}</span> kamar kost
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-80 rounded-3xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center max-w-md mx-auto my-12">
            <BedDouble className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-slate-800">Tidak ada kamar ditemukan</h4>
            <p className="text-xs text-slate-500 mt-1">
              Coba sesuaikan filter atau kata kunci pencarian Anda untuk melihat unit kamar lainnya.
            </p>
            <button
              onClick={() => {
                setSelectedType("ALL");
                setSelectedFloor("ALL");
                setOnlyAvailable(false);
                setSearchQuery("");
              }}
              className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRooms.map((room) => {
              let imagesList: string[] = [];
              let facilitiesList: string[] = [];
              try {
                if (room.roomType.images) imagesList = JSON.parse(room.roomType.images);
                if (room.roomType.facilities) facilitiesList = JSON.parse(room.roomType.facilities);
              } catch {
                imagesList = [];
                facilitiesList = [];
              }

              const coverImage =
                imagesList[0] ||
                "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80";
              const price = room.customPrice ?? room.roomType.basePrice;

              return (
                <div
                  key={room.id}
                  className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-xl transition flex flex-col group"
                >
                  {/* Photo & Badges */}
                  <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                    <img
                      src={coverImage}
                      alt={`Kamar ${room.roomNumber}`}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <div className="rounded-xl bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                        Kamar {room.roomNumber}
                      </div>
                      <div className="rounded-xl bg-white/90 backdrop-blur-sm px-2.5 py-1.5 text-xs font-bold text-slate-800 shadow-sm">
                        Lt. {room.floor}
                      </div>
                    </div>

                    <div className="absolute top-4 right-4">
                      <StatusBadge status={room.status} />
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">
                        {room.roomType.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {room.notes || room.roomType.description}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Fasilitas Kamar:
                        </span>
                        <div className="space-y-1">
                          {facilitiesList.slice(0, 3).map((f, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400">Harga Sewa</span>
                        <p className="text-xl font-black text-emerald-600">
                          {formatRupiah(price)}
                          <span className="text-xs font-normal text-slate-500">/bln</span>
                        </p>
                      </div>

                      <Link
                        href={`/kamar/${room.id}`}
                        className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                      >
                        Detail & Pesan
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}

export default function KamarCatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm font-semibold text-slate-400">Memuat katalog kamar...</div>}>
      <KamarCatalogContent />
    </Suspense>
  );
}
