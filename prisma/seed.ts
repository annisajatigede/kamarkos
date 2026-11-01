import { PrismaClient, Role, RoomStatus, LeaseStatus, BillingCycle, InvoiceStatus, MaintenanceCategory, MaintenancePriority, MaintenanceStatus, ExpenseCategory } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Memulai proses seeding database KamarKos...");

  // Clean existing data in reverse order of foreign keys
  await prisma.notification.deleteMany();
  await prisma.paymentTransaction.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.lease.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.review.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.room.deleteMany();
  await prisma.roomType.deleteMany();
  await prisma.property.deleteMany();
  await prisma.tenantProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.setting.deleteMany();

  console.log("Membersihkan data lama: Sukses.");

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Create Users
  const owner = await prisma.user.create({
    data: {
      name: "H. Hendra Wijaya (Owner)",
      email: "owner@kamarkos.com",
      password: hashedPassword,
      phone: "081223344556",
      role: Role.OWNER,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: "Rian Permana (Staff Pengelola)",
      email: "staff@kamarkos.com",
      password: hashedPassword,
      phone: "081399887766",
      role: Role.STAFF,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
  });

  const tenant1 = await prisma.user.create({
    data: {
      name: "Ahmad Fauzi",
      email: "penyewa1@kamarkos.com",
      password: hashedPassword,
      phone: "081234567891",
      role: Role.TENANT,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      tenantProfile: {
        create: {
          nik: "3211012304990001",
          occupation: "Mahasiswa S1",
          institution: "Universitas Padjadjaran (UNPAD)",
          emergencyContactName: "Bpk. Bambang Fauzi (Ayah)",
          emergencyContactPhone: "081211112222",
        },
      },
    },
  });

  const tenant2 = await prisma.user.create({
    data: {
      name: "Siti Rahmawati",
      email: "penyewa2@kamarkos.com",
      password: hashedPassword,
      phone: "081234567892",
      role: Role.TENANT,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      tenantProfile: {
        create: {
          nik: "3211015609010003",
          occupation: "Karyawan Swasta",
          institution: "PT Telkom Digital",
          emergencyContactName: "Ibu Nurhayati (Ibu)",
          emergencyContactPhone: "081233334444",
        },
      },
    },
  });

  const tenant3 = await prisma.user.create({
    data: {
      name: "Budi Pratama",
      email: "penyewa3@kamarkos.com",
      password: hashedPassword,
      phone: "081234567893",
      role: Role.TENANT,
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
      tenantProfile: {
        create: {
          nik: "3211011112980005",
          occupation: "Software Engineer",
          institution: "Startup Tech Bandung",
          emergencyContactName: "Dedi Supriadi",
          emergencyContactPhone: "081255556666",
        },
      },
    },
  });

  console.log("Akun Pengguna berhasil dibuat.");

  // 2. Create Property
  const property = await prisma.property.create({
    data: {
      name: "KamarKos Residence Jatinangor",
      slug: "kamarkos-residence-jatinangor",
      address: "Jl. Raya Jatinangor No. 88, Hegarmanah, Dekat Gerbang Lama UNPAD",
      city: "Sumedang",
      district: "Jatinangor",
      description: "Hunian kost modern, bersih, dan representatif dengan fasilitas lengkap seperti hotel. Sangat strategis hanya 3 menit ke kampus UNPAD & ITB Jatinangor. Dilengkapi keamanan 24 jam dengan CCTV, akses kartu digital, WiFi 100 Mbps fiber optic, dapur bersama lengkap, dan area rooftop santai.",
      rules: JSON.stringify([
        "Tamu lawan jenis dilarang masuk ke dalam kamar tidur.",
        "Jam tenang lingkungan berlaku pukul 22.00 - 06.00 WIB demi kenyamanan bersama.",
        "Dilarang merokok dan membawa hewan peliharaan di dalam area kamar AC.",
        "Wajib menjaga kebersihan dapur bersama dan buang sampah pada tempatnya.",
        "Pembayaran sewa dilakukan paling lambat tanggal jatuh tempo setiap bulan."
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80",
      ]),
    },
  });

  console.log("Properti kost berhasil dibuat.");

  // 3. Create Room Types
  const deluxeType = await prisma.roomType.create({
    data: {
      propertyId: property.id,
      name: "Deluxe Queen AC",
      description: "Kamar paling luas dan nyaman dengan ranjang Queen Size, Smart TV, kamar mandi dalam dengan water heater, dan meja kerja luas.",
      basePrice: 1800000,
      deposit: 500000,
      size: "4 x 4 meter",
      facilities: JSON.stringify([
        "AC 1 PK Daikin Hemat Energi",
        "Kamar Mandi Dalam + Water Heater",
        "Kasur Queen Size 160x200 (Springbed)",
        "Smart TV 32 Inch (YouTube & Netflix)",
        "Lemari Pakaian 2 Pintu + Cermin Full Body",
        "Meja Belajar / Kerja Ergonomis + Kursi Busa",
        "Koneksi WiFi Fiber Optik Dedicated",
        "Kulkas Mini Portable",
        "Jendela Menghadap Taman Luar"
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80",
      ]),
    },
  });

  const standardType = await prisma.roomType.create({
    data: {
      propertyId: property.id,
      name: "Standard Single AC",
      description: "Pilihan favorit mahasiswa dan pekerja. Dilengkapi AC dingin, kamar mandi dalam, kasur single berkualitas, dan suasana tenang untuk istirahat.",
      basePrice: 1400000,
      deposit: 300000,
      size: "3.5 x 3.5 meter",
      facilities: JSON.stringify([
        "AC 1/2 PK Dingin",
        "Kamar Mandi Dalam (Shower & Kloset Duduk)",
        "Kasur Single 120x200 Nyaman",
        "Lemari Pakaian Kayu Minimalis",
        "Meja Kerja & Kursi",
        "WiFi Gratis Kecepatan Tinggi",
        "Ventilasi & Sirkulasi Udara Baik"
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&auto=format&fit=crop&q=80",
      ]),
    },
  });

  const economyType = await prisma.roomType.create({
    data: {
      propertyId: property.id,
      name: "Economy Cozy Fan",
      description: "Hemat dan fungsional. Sangat cocok bagi mahasiswa yang mencari hunian nyaman terjangkau dengan sirkulasi udara sejuk.",
      basePrice: 900000,
      deposit: 200000,
      size: "3 x 3 meter",
      facilities: JSON.stringify([
        "Exhaust Fan & Ceiling Fan Sejuk",
        "Kamar Mandi Luar Bersih (Rasio 1:2 Kamar)",
        "Kasur Single 100x200",
        "Meja Belajar Kompak",
        "Lemari Pakaian Minimalis",
        "WiFi Gratis Unlimited"
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80",
      ]),
    },
  });

  console.log("Tipe kamar berhasil dibuat.");

  // 4. Create Rooms
  // Floor 1 Rooms
  const room101 = await prisma.room.create({
    data: {
      propertyId: property.id,
      roomTypeId: deluxeType.id,
      roomNumber: "101",
      floor: 1,
      status: RoomStatus.OCCUPIED,
      notes: "Dihuni oleh Ahmad Fauzi",
    },
  });

  const room102 = await prisma.room.create({
    data: {
      propertyId: property.id,
      roomTypeId: standardType.id,
      roomNumber: "102",
      floor: 1,
      status: RoomStatus.OCCUPIED,
      notes: "Dihuni oleh Siti Rahmawati",
    },
  });

  const room103 = await prisma.room.create({
    data: {
      propertyId: property.id,
      roomTypeId: standardType.id,
      roomNumber: "103",
      floor: 1,
      status: RoomStatus.AVAILABLE,
      notes: "Kamar bersih siap huni",
    },
  });

  const room104 = await prisma.room.create({
    data: {
      propertyId: property.id,
      roomTypeId: deluxeType.id,
      roomNumber: "104",
      floor: 1,
      status: RoomStatus.MAINTENANCE,
      notes: "Dalam perbaikan servis rutin AC dan cat ulang",
    },
  });

  const room105 = await prisma.room.create({
    data: {
      propertyId: property.id,
      roomTypeId: economyType.id,
      roomNumber: "105",
      floor: 1,
      status: RoomStatus.AVAILABLE,
      notes: "Kamar siap huni lantai 1",
    },
  });

  const room106 = await prisma.room.create({
    data: {
      propertyId: property.id,
      roomTypeId: economyType.id,
      roomNumber: "106",
      floor: 1,
      status: RoomStatus.OCCUPIED,
      notes: "Dihuni oleh Budi Pratama",
    },
  });

  // Floor 2 Rooms
  const room201 = await prisma.room.create({
    data: {
      propertyId: property.id,
      roomTypeId: deluxeType.id,
      roomNumber: "201",
      floor: 2,
      status: RoomStatus.AVAILABLE,
      notes: "Kamar Deluxe lantai 2 dengan balkon menghadap barat",
    },
  });

  const room202 = await prisma.room.create({
    data: {
      propertyId: property.id,
      roomTypeId: deluxeType.id,
      roomNumber: "202",
      floor: 2,
      status: RoomStatus.AVAILABLE,
      notes: "Kamar Deluxe lantai 2 tenang",
    },
  });

  const room203 = await prisma.room.create({
    data: {
      propertyId: property.id,
      roomTypeId: standardType.id,
      roomNumber: "203",
      floor: 2,
      status: RoomStatus.AVAILABLE,
      notes: "Kamar Standard lantai 2 siap huni",
    },
  });

  const room204 = await prisma.room.create({
    data: {
      propertyId: property.id,
      roomTypeId: standardType.id,
      roomNumber: "204",
      floor: 2,
      status: RoomStatus.AVAILABLE,
      notes: "Kamar Standard lantai 2 dekat tangga",
    },
  });

  const room205 = await prisma.room.create({
    data: {
      propertyId: property.id,
      roomTypeId: economyType.id,
      roomNumber: "205",
      floor: 2,
      status: RoomStatus.AVAILABLE,
      notes: "Kamar Economy lantai 2",
    },
  });

  const room206 = await prisma.room.create({
    data: {
      propertyId: property.id,
      roomTypeId: economyType.id,
      roomNumber: "206",
      floor: 2,
      status: RoomStatus.AVAILABLE,
      notes: "Kamar Economy lantai 2 ujung",
    },
  });

  console.log("12 Kamar di lantai 1 & 2 berhasil dibuat.");

  // 5. Create Leases
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 10, 1);

  const lease1 = await prisma.lease.create({
    data: {
      tenantId: tenant1.id,
      roomId: room101.id,
      startDate: startDate,
      endDate: endDate,
      billingCycle: BillingCycle.MONTHLY,
      rentAmount: 1800000,
      depositAmount: 500000,
      status: LeaseStatus.ACTIVE,
      notes: "Kontrak 1 tahun, bayar per bulan setiap tgl 1",
    },
  });

  const lease2 = await prisma.lease.create({
    data: {
      tenantId: tenant2.id,
      roomId: room102.id,
      startDate: new Date(now.getFullYear(), now.getMonth() - 1, 15),
      endDate: new Date(now.getFullYear(), now.getMonth() + 5, 15),
      billingCycle: BillingCycle.MONTHLY,
      rentAmount: 1400000,
      depositAmount: 300000,
      status: LeaseStatus.ACTIVE,
      notes: "Kontrak 6 bulan",
    },
  });

  const lease3 = await prisma.lease.create({
    data: {
      tenantId: tenant3.id,
      roomId: room106.id,
      startDate: new Date(now.getFullYear(), now.getMonth() - 3, 10),
      endDate: new Date(now.getFullYear(), now.getMonth() + 3, 10),
      billingCycle: BillingCycle.MONTHLY,
      rentAmount: 900000,
      depositAmount: 200000,
      status: LeaseStatus.ACTIVE,
      notes: "Kontrak 6 bulan",
    },
  });

  console.log("Kontrak sewa berhasil dibuat.");

  // 6. Create Invoices
  // Invoice 1: Tenant 1 (Bulan Lalu - PAID)
  const prevMonthDue = new Date(now.getFullYear(), now.getMonth() - 1, 5);
  await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-202410-0001",
      leaseId: lease1.id,
      tenantId: tenant1.id,
      amount: 1800000,
      dueDate: prevMonthDue,
      paidDate: prevMonthDue,
      status: InvoiceStatus.PAID,
      items: JSON.stringify([
        { title: "Sewa Kamar 101 (Deluxe Queen AC)", amount: 1800000 },
      ]),
      paymentMethod: "MIDTRANS",
      adminNotes: "Lunas otomatis via Midtrans BCA VA",
    },
  });

  // Invoice 2: Tenant 1 (Bulan Ini - UNPAID)
  const currentMonthDue = new Date(now.getFullYear(), now.getMonth(), 5);
  await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-202411-0002",
      leaseId: lease1.id,
      tenantId: tenant1.id,
      amount: 1800000,
      dueDate: currentMonthDue,
      status: InvoiceStatus.UNPAID,
      items: JSON.stringify([
        { title: "Sewa Kamar 101 (Deluxe Queen AC) - Bulan Berjalan", amount: 1800000 },
      ]),
      adminNotes: "Tagihan bulan berjalan belum dibayar",
    },
  });

  // Invoice 3: Tenant 2 (Bulan Ini - PAID via Manual Transfer)
  await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-202411-0003",
      leaseId: lease2.id,
      tenantId: tenant2.id,
      amount: 1400000,
      dueDate: new Date(now.getFullYear(), now.getMonth(), 15),
      paidDate: new Date(now.getFullYear(), now.getMonth(), 12),
      status: InvoiceStatus.PAID,
      items: JSON.stringify([
        { title: "Sewa Kamar 102 (Standard Single AC)", amount: 1400000 },
      ]),
      paymentMethod: "MANUAL_TRANSFER",
      paymentProof: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80",
      adminNotes: "Bukti transfer BCA telah diverifikasi staff",
    },
  });

  // Invoice 4: Tenant 3 (OVERDUE)
  const overdueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5);
  await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-202411-0004",
      leaseId: lease3.id,
      tenantId: tenant3.id,
      amount: 900000,
      dueDate: overdueDate,
      status: InvoiceStatus.OVERDUE,
      items: JSON.stringify([
        { title: "Sewa Kamar 106 (Economy Cozy Fan)", amount: 900000 },
      ]),
      adminNotes: "Sudah terlambat 5 hari, telah dikirimi pengingat WA",
    },
  });

  console.log("Tagihan (invoices) berhasil dibuat.");

  // 7. Create Expenses
  await prisma.expense.createMany({
    data: [
      {
        propertyId: property.id,
        category: ExpenseCategory.UTILITY,
        title: "Token Listrik Prabayar Induk & Koridor",
        amount: 1250000,
        date: new Date(now.getFullYear(), now.getMonth(), 3),
        notes: "Pengisian token PLN prabayar 1.250.000",
      },
      {
        propertyId: property.id,
        category: ExpenseCategory.INTERNET,
        title: "Tagihan WiFi Indihome Fiber 100 Mbps",
        amount: 650000,
        date: new Date(now.getFullYear(), now.getMonth(), 5),
        notes: "Paket internet dedicated kost",
      },
      {
        propertyId: property.id,
        category: ExpenseCategory.UTILITY,
        title: "Tagihan Air PDAM Tirta Medal",
        amount: 320000,
        date: new Date(now.getFullYear(), now.getMonth(), 6),
        notes: "Air PDAM lancar",
      },
      {
        propertyId: property.id,
        category: ExpenseCategory.MAINTENANCE,
        title: "Servis Berkala & Cuci AC 4 Unit",
        amount: 450000,
        date: new Date(now.getFullYear(), now.getMonth(), 8),
        notes: "Cuci AC kamar 101, 102, 104, dan 201 oleh teknisi langganan",
      },
      {
        propertyId: property.id,
        category: ExpenseCategory.SALARY,
        title: "Gaji Petugas Kebersihan & Jaga Malam",
        amount: 1800000,
        date: new Date(now.getFullYear(), now.getMonth(), 1),
        notes: "Honor bulanan Mas Supri",
      },
    ],
  });

  console.log("Pengeluaran operasional berhasil dicatat.");

  // 8. Create Maintenance Requests
  await prisma.maintenanceRequest.create({
    data: {
      tenantId: tenant2.id,
      roomId: room102.id,
      category: MaintenanceCategory.PLUMBING,
      title: "Keran wastafel kamar mandi rembes air",
      description: "Halo mas admin, keran wastafel di kamar mandi bawah agak rembes dan netes terus walau sudah diputar kencang. Mohon dicek seal karetnya ya.",
      priority: MaintenancePriority.MEDIUM,
      status: MaintenanceStatus.IN_PROGRESS,
      photo: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500&auto=format&fit=crop&q=80",
      repairNotes: "Sudah dicek oleh Pak Joko, besok diganti seal karet baru.",
    },
  });

  await prisma.maintenanceRequest.create({
    data: {
      tenantId: tenant1.id,
      roomId: room101.id,
      category: MaintenanceCategory.AIR_CONDITIONER,
      title: "AC mengeluarkan suara getar saat menyala",
      description: "Unit indoor AC sesekali bergetar agak bising waktu malam hari, mohon dibantu pembersihan filternya.",
      priority: MaintenancePriority.HIGH,
      status: MaintenanceStatus.REPORTED,
    },
  });

  await prisma.maintenanceRequest.create({
    data: {
      tenantId: tenant3.id,
      roomId: room106.id,
      category: MaintenanceCategory.ELECTRICAL,
      title: "Lampu kamar mandi mati",
      description: "Lampu LED kamar mandi putus tiba-tiba tadi pagi.",
      priority: MaintenancePriority.LOW,
      status: MaintenanceStatus.COMPLETED,
      cost: 45000,
      repairNotes: "Sudah diganti dengan lampu Philips LED 9W oleh staff pada hari yang sama.",
      resolvedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2),
    },
  });

  console.log("Tiket keluhan maintenance berhasil dibuat.");

  // 9. Create Reviews
  await prisma.review.createMany({
    data: [
      {
        propertyId: property.id,
        roomId: room101.id,
        tenantId: tenant1.id,
        rating: 5,
        comment: "Kamar sangat nyaman dan bersih, fasilitas sesuai deskripsi, WiFi ngebut banget buat nugas dan streaming kuliah online. Pengelolanya juga ramah dan responsif!",
        isPublished: true,
      },
      {
        propertyId: property.id,
        roomId: room102.id,
        tenantId: tenant2.id,
        rating: 5,
        comment: "Lingkungan sangat tenang dan aman, CCTV ada di setiap sudut. Dapur bersama selalu bersih. Sangat direkomendasikan untuk mahasiswa/pekerja di Jatinangor.",
        isPublished: true,
      },
      {
        propertyId: property.id,
        roomId: room106.id,
        tenantId: tenant3.id,
        rating: 4,
        comment: "Kost strategis dekat tempat makan dan minimarket. Kamar ekonomi tetap nyaman walau kamar mandi luar karena selalu dijaga kebersihannya tiap hari.",
        isPublished: true,
      },
    ],
  });

  // 10. Create Default Settings
  await prisma.setting.createMany({
    data: [
      {
        key: "BANK_NAME",
        value: "Bank Central Asia (BCA)",
        description: "Nama bank untuk pembayaran transfer manual",
      },
      {
        key: "BANK_ACCOUNT_NUMBER",
        value: "8470198822",
        description: "Nomor rekening tujuan pembayaran",
      },
      {
        key: "BANK_ACCOUNT_HOLDER",
        value: "HENDRA WIJAYA",
        description: "Nama pemilik rekening bank",
      },
      {
        key: "WA_NOTIFICATION_ENABLED",
        value: "true",
        description: "Status pengiriman notifikasi otomatis via WhatsApp Fonnte",
      },
      {
        key: "MIDTRANS_AUTO_VERIFY",
        value: "true",
        description: "Otomatis lunaskan invoice setelah webhook Midtrans berhasil",
      },
    ],
  });

  console.log("Semua data seeding KamarKos berhasil ditanam ke database!");
}

main()
  .catch((e) => {
    console.error("Gagal melakukan seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
