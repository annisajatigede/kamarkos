import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { maintenanceSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const isTenant = session.user.role === "TENANT";

    const where: Record<string, unknown> = {};
    if (isTenant) {
      where.tenantId = session.user.id;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    const tickets = await prisma.maintenanceRequest.findMany({
      where,
      include: {
        room: {
          include: {
            roomType: true,
            property: true,
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("Get maintenance error:", error);
    return NextResponse.json({ error: "Gagal memuat tiket keluhan" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = maintenanceSchema.parse(body);

    const ticket = await prisma.maintenanceRequest.create({
      data: {
        tenantId: session.user.id,
        roomId: data.roomId,
        category: data.category,
        title: data.title,
        description: data.description,
        priority: data.priority,
        photo: data.photo || null,
        status: "REPORTED",
      },
      include: {
        room: true,
      },
    });

    return NextResponse.json({ ticket, message: "Laporan keluhan berhasil diajukan" }, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "errors" in error) {
      return NextResponse.json({ error: (error as { errors: unknown[] }).errors }, { status: 400 });
    }
    console.error("Create maintenance ticket error:", error);
    return NextResponse.json({ error: "Gagal membuat laporan keluhan" }, { status: 500 });
  }
}
