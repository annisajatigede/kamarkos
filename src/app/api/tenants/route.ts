import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user.role !== "OWNER" && session.user.role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tenants = await prisma.user.findMany({
      where: { role: Role.TENANT },
      include: {
        tenantProfile: true,
        leases: {
          where: { status: "ACTIVE" },
          include: {
            room: {
              include: {
                roomType: true,
              },
            },
          },
        },
        invoices: {
          where: { status: { in: ["UNPAID", "OVERDUE"] } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tenants });
  } catch (error) {
    console.error("Get tenants error:", error);
    return NextResponse.json({ error: "Gagal memuat daftar penyewa" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user.role !== "OWNER" && session.user.role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, email, phone, nik, occupation, institution, emergencyContactName, emergencyContactPhone, password } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Nama dan email wajib diisi" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password || "password123", 10);

    const tenant = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        phone,
        password: hashedPassword,
        role: Role.TENANT,
        tenantProfile: {
          create: {
            nik,
            occupation,
            institution,
            emergencyContactName,
            emergencyContactPhone,
          },
        },
      },
      include: {
        tenantProfile: true,
      },
    });

    return NextResponse.json({ tenant, message: "Penyewa berhasil didaftarkan" }, { status: 201 });
  } catch (error) {
    console.error("Create tenant error:", error);
    return NextResponse.json({ error: "Gagal mendaftarkan penyewa" }, { status: 500 });
  }
}
