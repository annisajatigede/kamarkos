import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const typeId = searchParams.get("typeId");
    const status = searchParams.get("status");
    const floor = searchParams.get("floor");
    const maxPrice = searchParams.get("maxPrice");

    const whereClause: Record<string, unknown> = {};

    if (typeId) {
      whereClause.roomTypeId = typeId;
    }

    if (status) {
      whereClause.status = status;
    }

    if (floor) {
      whereClause.floor = parseInt(floor, 10);
    }

    const rooms = await prisma.room.findMany({
      where: whereClause,
      include: {
        roomType: true,
        property: true,
      },
      orderBy: [
        { floor: "asc" },
        { roomNumber: "asc" },
      ],
    });

    const roomTypes = await prisma.roomType.findMany({
      include: {
        rooms: true,
      },
    });

    const property = await prisma.property.findFirst({
      include: {
        reviews: {
          where: { isPublished: true },
          include: {
            tenant: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 6,
        },
      },
    });

    // Filter by max price if requested
    let filteredRooms = rooms;
    if (maxPrice) {
      const maxVal = parseFloat(maxPrice);
      filteredRooms = rooms.filter(
        (r) => (r.customPrice ?? r.roomType.basePrice) <= maxVal
      );
    }

    return NextResponse.json({
      property,
      roomTypes,
      rooms: filteredRooms,
      totalRooms: rooms.length,
      availableCount: rooms.filter((r) => r.status === "AVAILABLE").length,
    });
  } catch (error) {
    console.error("Public rooms API error:", error);
    return NextResponse.json(
      { error: "Gagal memuat data kamar" },
      { status: 500 }
    );
  }
}
