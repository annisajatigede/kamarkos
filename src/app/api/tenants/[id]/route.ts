import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tenant = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        tenantProfile: true,
        leases: {
          include: {
            room: {
              include: {
                roomType: true,
                property: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        invoices: {
          orderBy: { createdAt: "desc" },
        },
        maintenanceRequests: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Data penyewa tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ tenant });
  } catch (error) {
    console.error("Get tenant detail error:", error);
    return NextResponse.json({ error: "Gagal memuat detail penyewa" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user.role !== "OWNER" && session.user.role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, phone, nik, occupation, institution, emergencyContactName, emergencyContactPhone } = body;

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: {
        name,
        phone,
        tenantProfile: {
          upsert: {
            create: {
              nik,
              occupation,
              institution,
              emergencyContactName,
              emergencyContactPhone,
            },
            update: {
              nik,
              occupation,
              institution,
              emergencyContactName,
              emergencyContactPhone,
            },
          },
        },
      },
      include: {
        tenantProfile: true,
      },
    });

    return NextResponse.json({ tenant: updated, message: "Data penyewa berhasil diperbarui" });
  } catch (error) {
    console.error("Update tenant error:", error);
    return NextResponse.json({ error: "Gagal memperbarui data penyewa" }, { status: 500 });
  }
}
