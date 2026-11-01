import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "KamarKos - Kost Eksklusif & Modern",
  description: "Sistem Manajemen & Reservasi Kost Terintegrasi. Kamar nyaman, fasilitas lengkap, bayar sewa serba digital & transparan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
