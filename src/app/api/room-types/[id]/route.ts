import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { roomTypeSchema } from "@/lib/validations";

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
    const data = roomTypeSchema.parse(body);

    const updated = await prisma.roomType.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description,
        basePrice: data.basePrice,
        deposit: data.deposit,
        size: data.size,
        facilities: data.facilities,
        images: data.images,
      },
    });

    return NextResponse.json({ roomType: updated, message: "Tipe kamar berhasil diperbarui" });
  } catch (error) {
    console.error("Update room type error:", error);
    return NextResponse.json({ error: "Gagal memperbarui tipe kamar" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if rooms exist for this type
    const roomsCount = await prisma.room.count({
      where: { roomTypeId: params.id },
    });

    if (roomsCount > 0) {
      return NextResponse.json(
        { error: `Tipe kamar ini sedang digunakan oleh ${roomsCount} unit kamar. Hapus atau pindahkan kamar terlebih dahulu.` },
        { status: 400 }
      );
    }

    await prisma.roomType.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Tipe kamar berhasil dihapus" });
  } catch (error) {
    console.error("Delete room type error:", error);
    return NextResponse.json({ error: "Gagal menghapus tipe kamar" }, { status: 500 });
  }
}
