"use client";
import React from "react";
import { MessageCircle } from "lucide-react";

export function FloatingWhatsApp() {
  const phoneNumber = "6281223344556";
  const defaultMessage = encodeURIComponent(
    "Halo Admin KamarKos, saya tertarik untuk bertanya tentang ketersediaan kamar kost dan fasilitasnya. Apakah ada kamar yang siap huni?"
  );

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${defaultMessage}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-3 font-semibold text-white shadow-xl shadow-emerald-500/30 transition hover:bg-emerald-600 hover:scale-105 active:scale-95 group"
      title="Tanya Pengelola via WhatsApp"
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 group-hover:rotate-12 transition">
        <MessageCircle className="h-5 w-5 fill-white text-emerald-500" />
      </div>
      <span className="hidden sm:inline text-sm font-bold tracking-wide">
        Tanya via WhatsApp
      </span>
    </a>
  );
}
