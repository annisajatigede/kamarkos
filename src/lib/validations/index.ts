import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit").regex(/^[0-9+]+$/, "Nomor telepon hanya boleh angka atau +"),
  nik: z.string().optional(),
});

export const propertySchema = z.object({
  name: z.string().min(3, "Nama kost minimal 3 karakter"),
  slug: z.string().min(3).optional(),
  address: z.string().min(5, "Alamat lengkap wajib diisi"),
  city: z.string().min(2, "Kota wajib diisi"),
  district: z.string().min(2, "Kecamatan wajib diisi"),
  description: z.string().optional(),
  rules: z.string().optional(),
  images: z.string().optional(),
});

export const roomTypeSchema = z.object({
  propertyId: z.string().min(1, "Properti wajib dipilih"),
  name: z.string().min(2, "Nama tipe kamar minimal 2 karakter"),
  description: z.string().optional(),
  basePrice: z.coerce.number().min(100000, "Harga sewa minimal Rp 100.000"),
  deposit: z.coerce.number().min(0).default(0),
  size: z.string().optional(),
  facilities: z.string().optional(), // JSON string array
  images: z.string().optional(), // JSON string array
});

export const roomSchema = z.object({
  propertyId: z.string().min(1, "Properti wajib dipilih"),
  roomTypeId: z.string().min(1, "Tipe kamar wajib dipilih"),
  roomNumber: z.string().min(1, "Nomor kamar wajib diisi"),
  floor: z.coerce.number().int().min(1, "Lantai minimal 1").default(1),
  status: z.enum(["AVAILABLE", "OCCUPIED", "MAINTENANCE"]).default("AVAILABLE"),
  customPrice: z.coerce.number().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const leaseSchema = z.object({
  tenantId: z.string().min(1, "Penyewa wajib dipilih"),
  roomId: z.string().min(1, "Kamar wajib dipilih"),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  billingCycle: z.enum(["MONTHLY", "QUARTERLY", "ANNUALLY"]).default("MONTHLY"),
  rentAmount: z.coerce.number().min(100000, "Harga sewa minimal Rp 100.000"),
  depositAmount: z.coerce.number().min(0).default(0),
  notes: z.string().optional().nullable(),
});

export const invoiceSchema = z.object({
  leaseId: z.string().optional().nullable(),
  tenantId: z.string().min(1, "Penyewa wajib dipilih"),
  amount: z.coerce.number().min(10000, "Nominal tagihan minimal Rp 10.000"),
  dueDate: z.string().or(z.date()),
  items: z.string().optional().nullable(), // JSON string
  status: z.enum(["UNPAID", "PAID", "OVERDUE", "CANCELLED"]).default("UNPAID"),
  adminNotes: z.string().optional().nullable(),
});

export const maintenanceSchema = z.object({
  roomId: z.string().min(1, "Kamar wajib dipilih"),
  category: z.enum(["PLUMBING", "ELECTRICAL", "FURNITURE", "AIR_CONDITIONER", "CLEANING", "OTHER"]),
  title: z.string().min(3, "Judul keluhan minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi keluhan minimal 10 karakter"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  photo: z.string().optional().nullable(),
});

export const expenseSchema = z.object({
  propertyId: z.string().min(1, "Properti wajib dipilih"),
  category: z.enum(["UTILITY", "MAINTENANCE", "SALARY", "INTERNET", "TAX", "SUPPLIES", "OTHER"]),
  title: z.string().min(3, "Nama pengeluaran minimal 3 karakter"),
  amount: z.coerce.number().min(1000, "Nominal minimal Rp 1.000"),
  date: z.string().or(z.date()).optional(),
  receipt: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const reviewSchema = z.object({
  propertyId: z.string().min(1, "Properti wajib dipilih"),
  roomId: z.string().optional().nullable(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(5, "Ulasan minimal 5 karakter"),
});

export const bookingSchema = z.object({
  roomId: z.string().min(1, "Kamar wajib dipilih"),
  name: z.string().min(2, "Nama lengkap wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().min(10, "Nomor WhatsApp wajib valid"),
  checkInDate: z.string().min(1, "Tanggal rencana masuk wajib diisi"),
  notes: z.string().optional(),
});
