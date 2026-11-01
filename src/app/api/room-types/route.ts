import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { roomTypeSchema } from "@/lib/validations";

export async function GET() {
  try {
    const roomTypes = await prisma.roomType.findMany({
      include: {
        rooms: true,
        _count: {
          select: { rooms: true },
        },
      },
      orderBy: { basePrice: "asc" },
    });
    return NextResponse.json({ roomTypes });
  } catch (error) {
    console.error("Get room types error:", error);
    return NextResponse.json({ error: "Gagal mengambil tipe kamar" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user.role !== "OWNER" && session.user.role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = roomTypeSchema.parse(body);

    const roomType = await prisma.roomType.create({
      data: {
        propertyId: data.propertyId,
        name: data.name,
        description: data.description,
        basePrice: data.basePrice,
        deposit: data.deposit,
        size: data.size,
        facilities: data.facilities,
        images: data.images,
      },
    });

    return NextResponse.json({ roomType, message: "Tipe kamar berhasil ditambahkan" }, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "errors" in error) {
      return NextResponse.json({ error: (error as { errors: unknown[] }).errors }, { status: 400 });
    }
    console.error("Create room type error:", error);
    return NextResponse.json({ error: "Gagal menambahkan tipe kamar" }, { status: 500 });
  }
}
