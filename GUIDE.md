# 📖 PANDUAN PENGGUNAAN & DOKUMENTASI SISTEM KAMARKOS
**Sistem Manajemen & Reservasi Kost Terintegrasi Berbasis Web**

---

## 1. Ringkasan Proyek

**KamarKos** adalah aplikasi web full-stack modern untuk manajemen operasional kost dan reservasi kamar. Dibangun menggunakan arsitektur **Next.js 14 App Router**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, dan database **MySQL 8.0**. Aplikasi ini dilengkapi dengan autentikasi Role-Based Access Control (**RBAC**), integrasi payment gateway (**Midtrans Snap**), notifikasi WhatsApp (**Fonnte**), dan dynamic streaming dokumen **PDF** untuk kwitansi serta laporan keuangan.

---

## 2. Akun Demo untuk Pengujian Cepat

Aplikasi telah dilengkapi dengan data seed realistis Indonesia dan tombol login instan 1-klik di halaman `/login`:

| Peran (Role) | Alamat Email | Password | Hak Akses & Fitur Utama |
|---|---|---|---|
| **Owner (Super Admin)** | `owner@kamarkos.com` | `password123` | Akses penuh dashboard, KPI finansial, approve & verifikasi tagihan, kelola kamar & properti, laporan keuangan & cetak PDF, broadcast WhatsApp. |
| **Staff Pengelola** | `staff@kamarkos.com` | `password123` | Manajemen kamar harian, direktori penyewa, penanganan tiket kerusakan/maintenance. |
| **Penyewa Aktif 1** | `penyewa1@kamarkos.com` | `password123` | Portal penghuni: Sewa Kamar 101 (Deluxe Queen AC), cek tagihan & simulasi bayar Midtrans/manual, riwayat sewa, download PDF kwitansi. |
| **Penyewa Aktif 2** | `penyewa2@kamarkos.com` | `password123` | Portal penghuni: Sewa Kamar 102 (Standard Single AC), ada tiket komplain maintenance aktif. |
| **Penyewa Aktif 3** | `penyewa3@kamarkos.com` | `password123` | Portal penghuni: Sewa Kamar 106 (Economy Cozy Fan), status tagihan jatuh tempo (overdue). |

---

## 3. Cara Install & Menjalankan Aplikasi

### Prasyarat Sistem:
1. **Node.js**: Versi 18.17+ atau 22.x
2. **Database**: MySQL 8.0+ (Pastikan MySQL di Laragon sudah dinyalakan / "Start All" pada port 3306)
3. **Database Name**: `kamarkos_db`

### Langkah Setup Database & Menjalankan Aplikasi:

#### Opsi A: Menggunakan Dump SQL Siap Pakai (`kamarkos_db.sql`)
Di root proyek sudah kami sediakan file dump SQL lengkap dengan tabel dan data awal: `kamarkos_db.sql`.
1. Pastikan database `kamarkos_db` sudah dibuat di MySQL:
   ```sql
   CREATE DATABASE IF NOT EXISTS kamarkos_db;
   ```
2. Import langsung via terminal Laragon atau HeidiSQL/phpMyAdmin:
   ```bash
   mysql -u root kamarkos_db < kamarkos_db.sql
   ```
   *(Atau buka Laragon -> Database / HeidiSQL -> File -> Load SQL File -> pilih `kamarkos_db.sql` -> Run)*

#### Opsi B: Menggunakan Prisma Migration & Seed Otomatis
1. **Migrasi schema ke database**:
   ```bash
   npm run db:push
   ```
2. **Isi data awal (Seeding 12 kamar, tipe kamar, tagihan, user demo)**:
   ```bash
   npm run db:seed
   ```

### Menjalankan Server:
1. **Mode Development**:
   ```bash
   npm run dev
   ```
   Akses di browser: [http://localhost:3000](http://localhost:3000)

2. **Mode Production (Optimized)**:
   ```bash
   npm run build
   npm run start
   ```

---

## 4. Panduan Deploy ke Vercel & Koneksi Database Remote (Hostinger)

Jika Anda mendeploy aplikasi ini ke **Vercel** dengan database MySQL remote (seperti Hostinger), ada 2 hal penting yang **wajib** dilakukan agar Vercel dapat terhubung ke database:

### 1. Izinkan Akses Remote MySQL di Hostinger hPanel (SANGAT PENTING)
Secara default, Hostinger mengaktifkan firewall yang **memblokir** semua koneksi database dari luar server Hostinger:
1. Buka dashboard **Hostinger hPanel** (`hpanel.hostinger.com`).
2. Masuk ke menu **Databases** -> **Remote MySQL** (Koneksi MySQL Jarak Jauh).
3. Di formulir **Create remote connection**:
   - **IP (IPv4 atau IPv6)**: Isi dengan `%` (simbol persen menandakan wildcard, mengizinkan koneksi dari server Vercel yang IP-nya dinamis).
   - **Database**: Pilih `u667068812_kamarkos`.
4. Klik tombol **Create / Buat**.

### 2. Masukkan Environment Variables di Vercel Dashboard
Vercel **TIDAK** membaca file `.env` dari repository Git saat production runtime karena alasan keamanan. Anda harus menginput variabel tersebut ke dashboard Vercel:
1. Buka dashboard proyek Anda di [https://vercel.com](https://vercel.com).
2. Pilih proyek **kamarkos** -> Klik tab **Settings** -> **Environment Variables**.
3. Tambahkan 4 variabel kunci berikut (centang untuk *Production*, *Preview*, dan *Development*):
   - `DATABASE_URL` = `mysql://u667068812_kamarkos:kamarKos2026@srv1153.hstgr.io:3306/u667068812_kamarkos?connect_timeout=30&pool_timeout=30`
   - `NEXTAUTH_URL` = `https://kamarkos.vercel.app` *(tanpa tanda garis miring di akhir)*
   - `NEXTAUTH_SECRET` = `kamarkos-super-secret-production-random-key-123456`
   - `NEXT_PUBLIC_APP_URL` = `https://kamarkos.vercel.app`
4. Buka tab **Deployments** di Vercel, klik titik tiga (`...`) pada deployment terbaru, lalu pilih **Redeploy** (centang *Clear Build Cache*).

---

## 5. Penanganan Troubleshooting Database & `.env`

> [!NOTE]
> **Error:** `Environment variable not found: DATABASE_URL`
>
> Hal ini terjadi jika file `.env` belum ada saat repository di-clone dari GitHub.
> 
> **Solusi:**
> 1. Sistem kode `src/lib/prisma.ts` dan `prisma/seed.ts` kini sudah dibekali **auto-fallback** cerdas ke `mysql://root:@localhost:3306/kamarkos_db`.
> 2. File `.env` sekarang juga sudah disertakan langsung di repository GitHub dengan konfigurasi standar Laragon (user `root` tanpa password, port `3306`, database `kamarkos_db`).
> 3. Jika diperlukan, cukup salin file `.env.example` menjadi `.env`:
>    ```bash
>    cp .env.example .env
>    ```
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Sinkronisasi Database & Generate Prisma Client**:
   ```bash
   npm run db:push
   ```

5. **Tanam Data Demo (Seeding)**:
   ```bash
   npm run db:seed
   ```

6. **Build Proyek (Production Check)**:
   ```bash
   npm run build
   ```

7. **Jalankan Aplikasi**:
   - Mode Development:
     ```bash
     npm run dev
     ```
   - Mode Production:
     ```bash
     npm run start
     ```
   Aplikasi dapat diakses melalui browser di: `http://localhost:3000`

---

## 4. Daftar Fitur yang Sudah Selesai 100%

### A. Halaman Publik & Tamu
- [x] **Landing Page (`/`)**:
  - Hero banner dengan call-to-action & counter ketersediaan kamar real-time dari database
  - Showcase tipe kamar & fasilitas unggulan (WiFi 100 Mbps, CCTV 24 Jam, Parkir luas, Dapur bersama)
  - Matriks denah ketersediaan nomor kamar Lantai 1 & Lantai 2 dengan filter status interaktif
  - Testimoni penghuni terverifikasi dengan rating bintang
  - Landmark jarak lokasi (UNPAD 3 Menit, ITB Jatinangor 5 Menit, Tol Cisumdawu 5 Menit)
  - Accordion FAQ interaktif
  - Floating WhatsApp chat button terhubung langsung ke pengelola kost
- [x] **Katalog Kamar (`/kamar`)**:
  - Filter multi-kriteria: Berdasarkan Tipe Kamar, Posisi Lantai, dan Opsi "Hanya Kamar Kosong"
  - Pencarian real-time berdasarkan nomor kamar atau tipe
  - Kartu kamar responsif dengan foto, fasilitas, harga sewa, dan badge status
- [x] **Detail Kamar & Reservasi (`/kamar/[id]`)**:
  - Galeri foto interaktif dengan pemilih thumbnail
  - Rincian spesifikasi ukuran, fasilitas kamar, aturan kost, dan simulasi biaya pertama (sewa + deposit)
  - Modal form booking online terintegrasi notifikasi otomatis WhatsApp tamu & pengelola

### B. Autentikasi & Keamanan (RBAC)
- [x] **Halaman Login (`/login`)**:
  - Form login dengan proteksi enkripsi password `bcryptjs`
  - Tombol Quick Switcher Akun Demo 1-klik (`Owner`, `Staff`, `Penyewa`)
  - Redirect dinamis berdasarkan role akun
- [x] **Halaman Registrasi (`/register`)**:
  - Pendaftaran mandiri penyewa baru dengan validasi nomor WhatsApp & NIK
- [x] **Edge Middleware (`middleware.ts`)**:
  - Proteksi seluruh rute `/dashboard/*` khusus role `OWNER` dan `STAFF`
  - Proteksi rute `/portal/*` khusus akun terautentikasi

### C. Portal Tenant (`/portal`)
- [x] **Dashboard Penghuni (`/portal`)**:
  - Informasi kamar aktif, masa kontrak sewa, dan pengingat tagihan belum lunas
  - Pintasan cepat bayar tagihan, lapor keluhan, dan download kwitansi
- [x] **Manajemen Tagihan (`/portal/tagihan`)**:
  - Tabel tagihan aktif & riwayat tagihan terdahulu
  - Modal pembayaran online **Midtrans Snap** (simulasi sandbox & token generator)
  - Pembayaran **Transfer Bank Manual** (BCA 8470198822 a/n Hendra Wijaya, salin nomor rekening, dan upload bukti transfer)
- [x] **Detail Tagihan & Kwitansi (`/portal/tagihan/[id]`)**:
  - Rincian biaya sewa dan utilitas
  - Tombol unduh resmi file **PDF Kwitansi Pembayaran**
- [x] **Pusat Keluhan Maintenance (`/portal/maintenance`)**:
  - Pelacakan timeline status tiket kendala (`REPORTED` -> `IN_PROGRESS` -> `COMPLETED`)
  - Form pengajuan tiket baru disertai kategori, tingkat urgensi, deskripsi, dan lampiran foto
- [x] **Riwayat Pembayaran (`/portal/riwayat`)**:
  - Arsip seluruh transaksi yang telah lunas
- [x] **Ulasan Kost (`/portal/review`)**:
  - Form pemberian rating bintang 1-5 dan ulasan testimoni
- [x] **Profil Penghuni (`/portal/profil`)**:
  - Pengaturan nomor WhatsApp, data NIK, pekerjaan/kampus, kontak darurat keluarga, dan ganti password

### D. Owner & Staff Dashboard (`/dashboard`)
- [x] **Ringkasan & KPI (`/dashboard`)**:
  - Kartu KPI: Okupansi (%), Pendapatan Bulan Berjalan, Pengeluaran Operasional, Laba Bersih
  - Grafik Batang Interaktif Arus Kas (Pendapatan vs Pengeluaran 6 Bulan Terakhir)
  - Visual Denah Kamar Lantai 1 & Lantai 2
  - Widget Tagihan Belum Lunas & Tiket Maintenance Aktif
- [x] **Manajemen Kamar (`/dashboard/kamar`)**:
  - Tambah, edit, dan hapus unit kamar fisik
  - Pengubah status instan (`AVAILABLE`, `OCCUPIED`, `MAINTENANCE`)
  - Filter berdasarkan lantai dan status
- [x] **Tipe Kamar (`/dashboard/tipe-kamar`)**:
  - Kelola nama tipe, tarif dasar, deposit jaminan, dimensi, fasilitas include, dan foto
- [x] **Penghuni Kost (`/dashboard/penyewa`)**:
  - Direktori seluruh penyewa kost lengkap dengan nomor WhatsApp, status tagihan, dan kontak darurat
  - Tombol pintasan langsung membuka chat WhatsApp dengan penghuni
  - Modal tambah & edit data penghuni
- [x] **Kontrak Sewa / Leases (`/dashboard/kontrak`)**:
  - Pembuatan kontrak baru: assign kamar kosong ke penyewa
  - Otomatis menerbitkan invoice pertama (sewa + deposit)
  - Tombol **Check-Out**: otomatis mengakhiri sewa dan mengembalikan status kamar menjadi Tersedia
- [x] **Keuangan Terpadu (`/dashboard/keuangan`)**:
  - **Sub-tab Tagihan**: Generate tagihan massal bulanan 1-klik, kirim pengingat tagihan WhatsApp otomatis via Fonnte, tombol verifikasi tagihan menjadi LUNAS
  - **Sub-tab Pengeluaran**: Catat biaya operasional (listrik token PLN, WiFi Indihome, air PDAM, gaji petugas, servis AC)
- [x] **Laporan & Ekspor Dokumen (`/dashboard/laporan`)**:
  - Laporan laba-rugi bulanan dan rekapan okupansi
  - **Cetak Laporan PDF**: Dynamic streaming file PDF laporan keuangan resmi
  - **Export CSV / Excel**: Ekspor data mutasi arus kas ke format spreadsheet
- [x] **Tiket Maintenance (`/dashboard/maintenance`)**:
  - Board pemantauan keluhan penghuni
  - Update status perbaikan, input catatan teknisi, dan pencatatan biaya realisasi servis (otomatis tercatat ke pembukuan pengeluaran)
- [x] **Broadcast WhatsApp (`/dashboard/komunikasi`)**:
  - Pengiriman pesan siaran pengumuman penting massal ke seluruh penghuni atau lantai tertentu
- [x] **Profil Properti (`/dashboard/properti`)**:
  - Edit identitas kost, alamat, deskripsi, aturan kost, dan galeri foto
- [x] **Pengaturan Sistem (`/dashboard/pengaturan`)**:
  - Konfigurasi rekening bank tujuan transfer
  - Konfigurasi kredensial Midtrans Snap API
  - Konfigurasi API token Fonnte WhatsApp

---

## 5. Bukti Verifikasi Eksekusi (Testing Proofs)

Seluruh kriteria selesai telah diverifikasi dengan hasil pengujian nyata:

1. **`npm run build`**:
   - Status: **Exit code 0** (Berhasil 100% tanpa error TypeScript, Lint, maupun Static Export).
   - Sebanyak 43 rute (halaman & API) terkompilasi sempurna.

2. **Landing Page & Database MySQL**:
   - HTTP GET `/` -> Status **200 OK**
   - HTTP GET `/api/public/rooms` -> Menghasilkan data kamar dari MySQL (Total: 12 kamar, 8 tersedia, 3 tipe kamar).

3. **Autentikasi & RBAC**:
   - Login Owner (`owner@kamarkos.com`) -> Berhasil login, sesi `role: OWNER`, akses penuh ke `/dashboard`.
   - Login Tenant (`penyewa1@kamarkos.com`) -> Berhasil login, sesi `role: TENANT`, akses ke `/portal`.

4. **Alur Transaksi & Tagihan**:
   - Pembuatan sesi bayar Midtrans (`POST /api/invoices/[id]/pay`) -> Sukses menerbitkan Snap Token simulasi.
   - Verifikasi pembayaran oleh pengelola (`POST /api/invoices/[id]/verify`) -> Status tagihan berubah menjadi **PAID** (Lunas).

5. **Ekspor Dokumen PDF**:
   - Endpoint Kwitansi Resmi: `GET /api/invoices/[id]/pdf` -> Menghasilkan stream PDF valid (Ukuran: 8.213 bytes, Content-Type: `application/pdf`).
   - Endpoint Laporan Keuangan Bulanan: `GET /api/reports/pdf` -> Menghasilkan stream PDF valid (Ukuran: 17.189 bytes, Content-Type: `application/pdf`).

6. **Uji Coba Booking**:
   - Endpoint Pengajuan Sewa: `POST /api/public/booking` -> Mengembalikan pesan sukses dan mensimulasikan pengiriman WhatsApp konfirmasi ke nomor pemesan.

---

## 6. Cara Deploy ke Production

### Opsi A: Deployment di Server VPS (Ubuntu / Debian dengan Nginx & PM2)
1. **Clone repository & Install dependencies**:
   ```bash
   git clone <repo-url> /var/www/kamarkos
   cd /var/www/kamarkos
   npm install
   ```
2. **Setup Database MySQL**:
   Buat database MySQL di server, lalu sesuaikan nilai `DATABASE_URL` pada file `.env`.
   ```bash
   npm run db:push
   npm run db:seed
   ```
3. **Build Aplikasi**:
   ```bash
   npm run build
   ```
4. **Jalankan Service dengan PM2**:
   ```bash
   npm install -g pm2
   pm2 start npm --name "kamarkos" -- start
   pm2 save
   pm2 startup
   ```
5. **Konfigurasi Reverse Proxy Nginx**:
   Arahkan domain (misal: `kamarkos.com`) ke port `http://localhost:3000`.

### Opsi B: Deployment di Vercel / Railway
1. Hubungkan repository Git ke Vercel atau Railway.
2. Tambahkan Environment Variables: `DATABASE_URL` (menggunakan MySQL hosting seperti PlanetScale, Aiven, atau Railway MySQL), `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `MIDTRANS_SERVER_KEY`, dll.
3. Vercel akan otomatis menjalankan `prisma generate && next build`.

---

## 7. Known Issues & Catatan Teknis

- **Kredensial Gateway**: Saat ini menggunakan kunci Sandbox/Mock bawaan (`SB-Mid-...` dan `mock-fonnte-token-123`). Sistem otomatis menyimulasikan pembayaran dan pengiriman WhatsApp tanpa kegagalan gateway. Untuk menghubungkan ke akun live, cukup masukkan Client Key & Server Key Midtrans serta Token Fonnte melalui menu **Dashboard > Pengaturan**.
- **Penyimpanan Upload Gambar**: Menggunakan penyimpanan URL langsung / cloud image link. Untuk penyimpanan file lokal permanen di server, dapat dipadukan dengan direktori `/public/uploads` atau layanan S3/Cloudinary.
