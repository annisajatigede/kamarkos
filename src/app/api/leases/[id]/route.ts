import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RoomStatus, LeaseStatus } from "@prisma/client";

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
    const { action, endDate, notes } = body;

    const lease = await prisma.lease.findUnique({
      where: { id: params.id },
      include: { room: true },
    });

    if (!lease) {
      return NextResponse.json({ error: "Kontrak sewa tidak ditemukan" }, { status: 404 });
    }

    if (action === "TERMINATE" || action === "CHECK_OUT") {
      // End lease and free room
      await prisma.$transaction(async (tx) => {
        await tx.lease.update({
          where: { id: params.id },
          data: {
            status: LeaseStatus.TERMINATED,
            notes: notes || "Penyewa telah check-out",
          },
        });

        await tx.room.update({
          where: { id: lease.roomId },
          data: {
            status: RoomStatus.AVAILABLE,
            notes: "Kamar kosong (pasca check-out, siap huni)",
          },
        });
      });

      return NextResponse.json({ message: "Check-out berhasil. Kamar kini berstatus Tersedia." });
    }

    if (action === "EXTEND") {
      if (!endDate) {
        return NextResponse.json({ error: "Tanggal perpanjangan (endDate) wajib diisi" }, { status: 400 });
      }

      const updated = await prisma.lease.update({
        where: { id: params.id },
        data: {
          endDate: new Date(endDate),
          status: LeaseStatus.ACTIVE,
          notes: notes || lease.notes,
        },
      });

      return NextResponse.json({ message: "Masa kontrak sewa berhasil diperpanjang", lease: updated });
    }

    return NextResponse.json({ error: "Aksi tidak dikenal" }, { status: 400 });
  } catch (error) {
    console.error("Update lease error:", error);
    return NextResponse.json({ error: "Gagal memperbarui kontrak sewa" }, { status: 500 });
  }
}
