import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const room = await prisma.room.findUnique({
      where: { id: params.id },
      include: {
        roomType: true,
        property: true,
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
        },
      },
    });

    if (!room) {
      return NextResponse.json(
        { error: "Kamar tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ room });
  } catch (error) {
    console.error("Room detail API error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data detail kamar" },
      { status: 500 }
    );
  }
}
