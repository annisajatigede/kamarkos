# RENCANA IMPLEMENTASI APLIKASI KAMARKOS
**Sistem Manajemen & Reservasi Kost Terintegrasi Berbasis Web**

---

## 1. Ringkasan Arsitektur & Tech Stack Final

### Tech Stack:
- **Framework Full-stack**: Next.js 14+ (App Router) dengan TypeScript
- **Styling & UI**: Tailwind CSS, Lucide React Icons, Tailwind Merge, Class Variance Authority
- **Database**: MySQL 8.0+ (Running on Laragon port 3306)
- **ORM**: Prisma ORM dengan konfigurasi `@db.Text` untuk data teks panjang (deskripsi, catatan, log, JSON)
- **Autentikasi & Otorisasi**: NextAuth.js (Credentials Provider + JWT Strategy) dengan Role-Based Access Control (RBAC):
  - `OWNER`: Akses penuh ke seluruh modul dashboard & pengaturan keuangan
  - `STAFF`: Akses operasional harian (kamar, tiket maintenance, penyewa)
  - `TENANT`: Akses khusus Tenant Portal (tagihan, bayar, komplain, profil)
- **Form Handling & Validation**: React Hook Form + Zod (validasi skema bersama antara client dan API)
- **Visualisasi & Chart**: Recharts (Pendapatan bulanan, pengeluaran, rasio okupansi)
- **Integrasi Pembayaran**: Midtrans Snap API (Sandbox mode & Mock Fallback untuk pengujian tanpa gateway delay)
- **Integrasi Notifikasi**: Fonnte WhatsApp API (Notifikasi tagihan otomatis, broadcast, & pengingat jatuh tempo)
- **Export Dokumen**: PDF Generation untuk Kwitansi Pembayaran Resmi & Laporan Keuangan Bulanan, plus Export Excel/CSV

---

## 2. Struktur Database & Model Data (Prisma Schema)

Database menggunakan MySQL `kamarkos_db`. Skema data dirancang untuk menangani operasional kost multi-kamar dan multi-properti:

1. **User**: Autentikasi (`id`, `name`, `email`, `password`, `phone`, `role: OWNER|STAFF|TENANT`, `avatar`, timestamp).
2. **TenantProfile**: Detail penyewa (`id`, `userId`, `nik`, `emergencyContactName`, `emergencyContactPhone`, `occupation`, `institution`, `idCardImage`).
3. **Property**: Data properti kost (`id`, `name`, `slug`, `address`, `city`, `district`, `description`, `rules`, `images`, timestamp).
4. **RoomType**: Tipe kamar (`id`, `propertyId`, `name`, `description`, `basePrice`, `deposit`, `size`, `facilities`, `images`).
5. **Room**: Kamar fisik (`id`, `propertyId`, `roomTypeId`, `roomNumber`, `floor`, `status: AVAILABLE|OCCUPIED|MAINTENANCE`, `customPrice`, `notes`).
6. **Lease**: Kontrak sewa (`id`, `tenantId`, `roomId`, `startDate`, `endDate`, `billingCycle: MONTHLY|QUARTERLY|ANNUALLY`, `rentAmount`, `depositAmount`, `status: ACTIVE|PENDING|EXPIRED|TERMINATED`).
7. **Invoice**: Tagihan sewa & utilitas (`id`, `invoiceNumber`, `leaseId`, `tenantId`, `amount`, `dueDate`, `paidDate`, `status: UNPAID|PAID|OVERDUE|CANCELLED`, `snapToken`, `paymentMethod`, `paymentProof`, `items`).
8. **PaymentTransaction**: Riwayat transaksi payment gateway (`id`, `invoiceId`, `transactionNumber`, `gatewayTransactionId`, `amount`, `paymentType`, `status: SUCCESS|PENDING|FAILED`, `rawResponse`).
9. **MaintenanceRequest**: Keluhan & servis kamar (`id`, `tenantId`, `roomId`, `category: PLUMBING|ELECTRICAL|FURNITURE|AC|CLEANING|OTHER`, `title`, `description`, `priority: LOW|MEDIUM|HIGH|URGENT`, `status: REPORTED|IN_PROGRESS|COMPLETED|CANCELLED`, `photo`, `cost`, `resolvedAt`).
10. **Expense**: Pengeluaran operasional kost (`id`, `propertyId`, `category: UTILITY|MAINTENANCE|SALARY|INTERNET|TAX|OTHER`, `title`, `amount`, `date`, `receiptImage`, `notes`).
11. **Review**: Ulasan penghuni (`id`, `propertyId`, `roomId`, `tenantId`, `rating`, `comment`, `isPublished`).
12. **Setting**: Konfigurasi dinamis (`id`, `key`, `value`, `description`).

---

## 3. Daftar Semua Halaman

### A. Halaman Publik & Tamu
1. **`/` (Landing Page)**:
   - Hero Section dengan call-to-action & pencarian cepat kamar
   - Katalog Tipe Kamar & Fasilitas Unggulan (WiFi, AC, Parkir, Dapur bersama)
   - Filter harga & fasilitas interaktif
   - Galeri Foto & Virtual Showcase
   - Testimoni Penghuni & Google Review style
   - FAQ Interaktif
   - Footer & Floating WhatsApp Chat Button
2. **`/kamar` (Katalog Lengkap Kamar)**:
   - Filter multi-kriteria: Harga min-max, tipe kamar, lantai, status ketersediaan
   - Grid kartu kamar dengan badge status langsung (`Tersedia`, `Terisi`, `Perawatan`)
3. **`/kamar/[id]` (Detail Kamar)**:
   - Slider foto resolusi tinggi
   - Spesifikasi detail (ukuran, fasilitas, aturan kost)
   - Form Ajukan Sewa / Booking modal langsung

### B. Halaman Autentikasi
1. **`/login`**:
   - Form login aman (Email/Phone + Password)
   - Tab / Quick Switcher akun demo 1-klik (`Owner`, `Staff`, `Penyewa`) untuk kemudahan pengujian
2. **`/register`**:
   - Pendaftaran akun penyewa baru dengan validasi data nomor WhatsApp & NIK

### C. Portal Tenant (`/portal`)
1. **`/portal` (Dashboard Tenant)**:
   - Status kamar yang sedang disewa, nomor kamar, tanggal jatuh tempo sewa
   - Ringkasan tagihan bulan berjalan & notifikasi
   - Pintasan lapor kerusakan & bayar cepat
2. **`/portal/tagihan` (Daftar Tagihan)**:
   - Tabel tagihan aktif & riwayat tagihan terdahulu
   - Status badge (`Belum Dibayar`, `Lunas`, `Jatuh Tempo`)
   - Modal Pembayaran Online (Midtrans Snap) atau Transfer Manual (Upload Bukti Transfer)
3. **`/portal/tagihan/[id]` (Detail & Cetak Kwitansi)**:
   - Rincian biaya (sewa, listrik, air, denda/diskon)
   - Tombol download PDF Kwitansi Pembayaran Resmi
4. **`/portal/maintenance` (Pusat Keluhan & Perbaikan)**:
   - Form pengajuan tiket kerusakan baru (kategori, foto kendala, deskripsi, tingkat urgensi)
   - Timeline pelacakan status tiket real-time (`Dilaporkan` -> `Sedang Dikerjakan` -> `Selesai`)
5. **`/portal/riwayat` (Riwayat Transaksi & Kontrak)**:
   - Arsip seluruh pembayaran yang pernah dilakukan & kontrak sewa
6. **`/portal/review` (Ulasan & Rating)**:
   - Form memberikan ulasan rating 1-5 bintang untuk kost
7. **`/portal/profil`**:
   - Pengaturan data diri, kontak darurat, foto KTP, dan ubah password

### D. Owner & Staff Dashboard (`/dashboard`)
1. **`/dashboard` (Overview & Analytics)**:
   - Kartu Metrik KPI: Tingkat Okupansi (%), Total Kamar Terisi vs Kosong, Pendapatan Bulan Ini, Tagihan Tertunggak, Tiket Kendala Aktif
   - Grafik Interaktif: Arus Kas Bulanan (Pendapatan vs Pengeluaran)
   - Matrix Cepat Ketersediaan Kamar (Visual Room Floor Plan)
   - Tabel 5 Transaksi Terbaru & 5 Tiket Kerusakan Prioritas
2. **`/dashboard/kamar` (Manajemen Kamar Fisik)**:
   - Grid & List view seluruh kamar
   - Modal tambah/edit kamar (nomor, lantai, tipe, status, catatan)
   - Aksi cepat ubah status kamar (Tersedia / Terisi / Perawatan)
3. **`/dashboard/tipe-kamar` (Katalog Tipe Kamar)**:
   - Kelola tipe kamar, deskripsi, harga sewa dasar, biaya deposit, fasilitas include, dan upload/link galeri foto
4. **`/dashboard/properti` (Manajemen Properti Kost)**:
   - Profil properti kost, alamat, kontak pengelola, jam malam/aturan kost
5. **`/dashboard/penyewa` (Direktori Penghuni)**:
   - Daftar seluruh penghuni kost aktif dan arsip mantan penghuni
   - Detail data kontak, dokumen NIK/KTP, kamar yang dihuni, tanggal masuk
   - Tombol kontak cepat langsung ke WhatsApp penyewa
6. **`/dashboard/kontrak` (Manajemen Kontrak Sewa / Lease)**:
   - Buat kontrak sewa baru untuk penyewa
   - Perpanjang periode sewa (extend lease)
   - Proses Check-Out / Terminasi kontrak dengan pengembalian deposit
7. **`/dashboard/keuangan` (Manajemen Keuangan Terpadu)**:
   - **Sub-tab Tagihan (Invoices)**: Buat tagihan tunggal atau generate tagihan bulanan massal otomatis, tombol kirim WA reminder via Fonnte, verifikasi pembayaran manual
   - **Sub-tab Pengeluaran (Expenses)**: Catat pengeluaran operasional (listrik, internet indihome, air pdam, kebersihan, gaji staf) + upload struk
   - **Sub-tab Transaksi (Cash Flow)**: Rekapitulasi mutasi masuk dan keluar
8. **`/dashboard/laporan` (Laporan & Cetak PDF)**:
   - Filter laporan berdasarkan rentang tanggal & bulan
   - Laporan Laba Rugi (Profit & Loss Statement)
   - Laporan Okupansi & Tingkat Hunian Kamar
   - Laporan Piutang / Tagihan Belum Lunas
   - Tombol Cetak PDF Laporan Keuangan Resmi & Export Excel/CSV
9. **`/dashboard/maintenance` (Manajemen Keluhan & Pemeliharaan)**:
   - Kanban board / Tabel keluhan penyewa
   - Pengalihan status (Diproses, Butuh Teknisi, Selesai)
   - Input catatan perbaikan & biaya realisasi servis (otomatis masuk ke pembukuan pengeluaran)
10. **`/dashboard/komunikasi` (Broadcast WhatsApp)**:
    - Kirim pesan pengumuman massal atau tagihan via WhatsApp Fonnte ke seluruh penyewa atau kamar lantai tertentu
11. **`/dashboard/pengaturan` (Pengaturan Sistem)**:
    - Konfigurasi Rekening Bank Kost untuk transfer manual
    - Konfigurasi Kredensial Midtrans (Client Key & Server Key)
    - Konfigurasi Token WhatsApp Fonnte
    - Template pesan pengingat tagihan WhatsApp otomatis

---

## 4. Daftar Semua API Endpoint

### Autentikasi & Akun
- `POST /api/auth/[...nextauth]` — Handler sesi NextAuth (login, callback, session)
- `POST /api/auth/register` — Registrasi penyewa baru
- `GET  /api/auth/me` — Ambil data user yang sedang login
- `PUT  /api/auth/me` — Update profil & ubah password

### Data Publik & Reservasi
- `GET  /api/public/rooms` — Mengambil daftar kamar dan tipe kamar untuk landing page
- `GET  /api/public/rooms/[id]` — Detail kamar untuk landing page & modal booking
- `POST /api/public/booking` — Pengajuan minat sewa baru dari tamu landing page

### Properti & Kamar
- `GET    /api/properties` — Ambil data properti kost
- `PUT    /api/properties` — Update identitas properti & aturan
- `GET    /api/room-types` — Daftar tipe kamar
- `POST   /api/room-types` — Tambah tipe kamar baru
- `PUT    /api/room-types/[id]` — Update tipe kamar
- `DELETE /api/room-types/[id]` — Hapus tipe kamar
- `GET    /api/rooms` — Daftar semua kamar dengan filter status & lantai
- `POST   /api/rooms` — Tambah kamar baru
- `PUT    /api/rooms/[id]` — Update data & status kamar
- `DELETE /api/rooms/[id]` — Hapus kamar

### Penyewa & Kontrak Sewa
- `GET    /api/tenants` — Daftar penyewa kost
- `POST   /api/tenants` — Pendaftaran penyewa manual oleh admin
- `GET    /api/tenants/[id]` — Detail penyewa beserta histori sewa
- `PUT    /api/tenants/[id]` — Update data penyewa
- `GET    /api/leases` — Daftar kontrak sewa aktif & selesai
- `POST   /api/leases` — Buat kontrak sewa baru (assign kamar ke penyewa)
- `PUT    /api/leases/[id]` — Perpanjang kontrak atau akhiri kontrak (Check-Out)

### Tagihan & Keuangan
- `GET    /api/invoices` — Ambil daftar invoice dengan filter status/bulan
- `POST   /api/invoices` — Generate tagihan (manual atau otomatis)
- `GET    /api/invoices/[id]` — Detail invoice
- `POST   /api/invoices/[id]/pay` — Buat Snap Token Midtrans atau simpan upload bukti transfer
- `POST   /api/invoices/[id]/verify` — Verifikasi dan lunasi pembayaran manual oleh Owner/Staff
- `POST   /api/invoices/[id]/send-reminder` — Kirim pesan tagihan WhatsApp via Fonnte
- `POST   /api/payment/midtrans-webhook` — Webhook HTTP penerima callback notifikasi pembayaran Midtrans
- `GET    /api/expenses` — Daftar catatan pengeluaran kost
- `POST   /api/expenses` — Tambah catatan pengeluaran operasional
- `DELETE /api/expenses/[id]` — Hapus catatan pengeluaran
- `GET    /api/reports/financial` — Data agregat laporan keuangan bulanan
- `GET    /api/reports/pdf` — Endpoint dynamic PDF stream untuk Laporan Keuangan
- `GET    /api/invoices/[id]/pdf` — Endpoint dynamic PDF stream untuk Kwitansi Pembayaran Resmi

### Keluhan & Pemeliharaan (Maintenance)
- `GET    /api/maintenance` — Daftar keluhan (sesuai role: semua untuk admin, milik sendiri untuk tenant)
- `POST   /api/maintenance` — Ajukan keluhan baru
- `PUT    /api/maintenance/[id]` — Update status keluhan & catatan penyelesaian

### Komunikasi & Pengaturan
- `POST   /api/broadcast` — Kirim pengumuman WhatsApp massal ke penghuni kost
- `GET    /api/settings` — Ambil konfigurasi sistem
- `PUT    /api/settings` — Simpan konfigurasi payment gateway, WA token, dan rekening

---

## 5. Urutan Build yang Logis

1. **Fase 1: Inisialisasi & Setup Environment**
   - Inisialisasi Next.js 14 (App Router) + TypeScript di `c:\laragon\www\kamarkos`
   - Setup Tailwind CSS, PostCSS, Lucide Icons, font, dan konfigurasi path alias `@/*`
   - Buat `.env` dan `.env.example` terkonfigurasi dengan MySQL Laragon (`DATABASE_URL="mysql://root:@localhost:3306/kamarkos_db"`), NextAuth secret, dan mock keys.

2. **Fase 2: Database, ORM & Seeding Data Realistis**
   - Pembuatan skema lengkap Prisma `prisma/schema.prisma` dengan tipe MySQL (@db.Text)
   - Eksekusi migrasi database Prisma ke MySQL lokal
   - Pembuatan skrip seed `prisma/seed.ts` berisi data realistis Indonesia:
     - 1 Akun Owner (`owner@kamarkos.com` / `password123`)
     - 1 Akun Staff (`staff@kamarkos.com` / `password123`)
     - 3 Akun Penyewa Demo (`penyewa1@kamarkos.com`, `penyewa2@kamarkos.com`, dll / `password123`)
     - Properti Kost ("KamarKos Residence - Jatinangor / Sumedang")
     - 3 Tipe Kamar (Deluxe AC Queen, Standard Single AC, Economy Fan)
     - 12 Kamar di Lantai 1 & Lantai 2 dengan status bervariasi (Tersedia, Terisi, Perawatan)
     - Data kontrak sewa aktif, riwayat tagihan, pengeluaran operasional, tiket komplain, dan ulasan.

3. **Fase 3: Core Utilities, Validasi Zod & Services**
   - Skema validasi bersama di `/src/lib/validations/` (auth, room, lease, invoice, maintenance, expense)
   - Utilitas format Rupiah (`formatRupiah`), tanggal bahasa Indonesia (`date-fns/locale/id`), dan nomor invoice
   - Midtrans Service dengan mode Sandbox + Mock Fallback instan
   - Fonnte WhatsApp Service dengan mode Live + Mock Fallback instan
   - Engine PDF Generator untuk Kwitansi dan Laporan Keuangan

4. **Fase 4: Autentikasi & Middleware RBAC**
   - Setup NextAuth konfigurasi di `/src/lib/auth.ts`
   - Password hashing menggunakan `bcryptjs`
   - Next.js Edge Middleware (`middleware.ts`) untuk proteksi rute:
     - Rute `/dashboard/*` khusus role `OWNER` dan `STAFF`
     - Rute `/portal/*` khusus role `TENANT`
     - Redirect otomatis jika belum login

5. **Fase 5: API Routes Implementation**
   - Implementasi seluruh API endpoint di `/src/app/api/...`
   - Penanganan error standar (Zod validation errors, 401 unauthorized, 404, 500)

6. **Fase 6: Komponen Reusable & Layout**
   - Navbar Publik, Footer, Floating WhatsApp
   - Dashboard Sidebar, Top Header, Profile Dropdown, Notification Bell
   - Tenant Portal Navbar & Mobile Bottom Navigation bar
   - Komponen UI: Modal Dialog, Badge Status, Card, Data Table, Stat Card, Empty State, Skeleton Loader

7. **Fase 7: Frontend Publik & Autentikasi**
   - Halaman Landing Page responsif `/`
   - Halaman Katalog Kamar `/kamar` & Detail Kamar `/kamar/[id]` dengan modal booking
   - Halaman Login `/login` (dengan tombol auto-fill akun demo 1-klik untuk kemudahan review) & Registrasi `/register`

8. **Fase 8: Frontend Portal Tenant (`/portal`)**
   - Dashboard ringkasan sewa penghuni
   - Halaman tagihan sewa & integrasi tombol bayar (Midtrans Snap & Transfer Manual)
   - Halaman lapor keluhan maintenance + pelacakan status
   - Download PDF kwitansi pembayaran
   - Halaman ulasan/review kost & profil penyewa

9. **Fase 9: Frontend Owner & Admin Dashboard (`/dashboard`)**
   - Overview KPI Cards & Recharts Arus Kas
   - Modul Manajemen Kamar & Matrix Kamar
   - Modul Penyewa & Pembuatan Kontrak Sewa
   - Modul Keuangan (Buat tagihan, verifikasi pembayaran, catat pengeluaran)
   - Modul Keluhan Pemeliharaan & Update Status Servis
   - Modul Broadcast WhatsApp Fonnte
   - Modul Laporan & Download PDF Laporan Keuangan
   - Modul Pengaturan Sistem

10. **Fase 10: Integrasi Pembayaran, WhatsApp & Ekspor PDF**
    - Verifikasi alur Midtrans Snap Checkout & Webhook handler
    - Verifikasi notifikasi Fonnte WA saat tagihan terbit
    - Verifikasi dynamic streaming PDF Kwitansi & Laporan Laba Rugi

11. **Fase 11: Pengujian, Optimasi & Dokumentasi**
    - Eksekusi `npm run build` untuk memastikan 0 TypeScript/Lint/Build error
    - Pengujian responsivitas (Mobile 375px & Desktop 1440px)
    - Pembuatan panduan lengkap `GUIDE.md`

---

## 6. Daftar Dependencies yang Akan Di-install

### Production Dependencies (`dependencies`):
- `next`: ^14.2.0 (Framework React SSR/SSG/App Router)
- `react`, `react-dom`: ^18.3.0
- `@prisma/client`: ^5.18.0 (ORM database client)
- `next-auth`: ^4.24.7 (Autentikasi & session management)
- `bcryptjs`: ^2.4.3 (Hashing password)
- `@types/bcryptjs`: ^2.4.6
- `zod`: ^3.23.8 (Validasi skema)
- `lucide-react`: ^0.428.0 (Icon pack modern)
- `recharts`: ^2.12.7 (Komponen chart dan visualisasi data)
- `date-fns`: ^3.6.0 (Format manipulasi tanggal)
- `clsx`, `tailwind-merge`: ^2.5.2 (Class utility)
- `jspdf`, `jspdf-autotable`: ^2.5.2 (Generasi file PDF kwitansi & laporan keuangan)

### Development Dependencies (`devDependencies`):
- `prisma`: ^5.18.0 (Prisma CLI untuk migrasi & schema)
- `typescript`: ^5.5.0
- `@types/node`: ^20.0.0
- `@types/react`: ^18.3.0
- `@types/react-dom`: ^18.3.0
- `tailwindcss`: ^3.4.0
- `postcss`: ^8.4.0
- `autoprefixer`: ^10.4.0
- `ts-node`: ^10.9.2 (Untuk mengeksekusi seed script Prisma)

---

## 7. Rencana Akun Demo untuk Pengujian Cepat

| Role | Email | Password | Kegunaan |
|---|---|---|---|
| **Owner (Super Admin)** | `owner@kamarkos.com` | `password123` | Akses penuh dashboard, KPI finansial, approve pembayaran, buat kamar |
| **Staff Pengelola** | `staff@kamarkos.com` | `password123` | Manajemen operasional kamar, keluhan maintenance, data penghuni |
| **Penyewa Aktif 1** | `penyewa1@kamarkos.com` | `password123` | Akses portal tenant, ada tagihan belum lunas & riwayat sewa |
| **Penyewa Aktif 2** | `penyewa2@kamarkos.com` | `password123` | Akses portal tenant, ada tiket keluhan aktif |
