import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { roomSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const floor = searchParams.get("floor");
    const status = searchParams.get("status");
    const typeId = searchParams.get("typeId");

    const where: Record<string, unknown> = {};
    if (floor) where.floor = parseInt(floor, 10);
    if (status) where.status = status;
    if (typeId) where.roomTypeId = typeId;

    const rooms = await prisma.room.findMany({
      where,
      include: {
        roomType: true,
        property: true,
        leases: {
          where: { status: "ACTIVE" },
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: [
        { floor: "asc" },
        { roomNumber: "asc" },
      ],
    });

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error("Get rooms error:", error);
    return NextResponse.json({ error: "Gagal memuat kamar" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user.role !== "OWNER" && session.user.role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = roomSchema.parse(body);

    // Check duplicate room number in same property
    const existing = await prisma.room.findUnique({
      where: {
        propertyId_roomNumber: {
          propertyId: data.propertyId,
          roomNumber: data.roomNumber,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Nomor kamar ${data.roomNumber} sudah ada di properti ini` },
        { status: 400 }
      );
    }

    const room = await prisma.room.create({
      data: {
        propertyId: data.propertyId,
        roomTypeId: data.roomTypeId,
        roomNumber: data.roomNumber,
        floor: data.floor,
        status: data.status,
        customPrice: data.customPrice,
        notes: data.notes,
      },
      include: {
        roomType: true,
      },
    });

    return NextResponse.json({ room, message: "Kamar baru berhasil ditambahkan" }, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "errors" in error) {
      return NextResponse.json({ error: (error as { errors: unknown[] }).errors }, { status: 400 });
    }
    console.error("Create room error:", error);
    return NextResponse.json({ error: "Gagal menambahkan kamar" }, { status: 500 });
  }
}
