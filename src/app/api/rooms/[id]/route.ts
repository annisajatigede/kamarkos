import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { roomSchema } from "@/lib/validations";

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
        leases: {
          include: {
            tenant: {
              select: { id: true, name: true, phone: true, email: true },
            },
          },
        },
        maintenanceRequests: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Kamar tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ room });
  } catch (error) {
    console.error("Get room detail error:", error);
    return NextResponse.json({ error: "Gagal mengambil data kamar" }, { status: 500 });
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

    // Support quick status update or full update
    if (body.status && Object.keys(body).length <= 2) {
      const updated = await prisma.room.update({
        where: { id: params.id },
        data: {
          status: body.status,
          notes: body.notes !== undefined ? body.notes : undefined,
        },
      });
      return NextResponse.json({ room: updated, message: "Status kamar berhasil diubah" });
    }

    const data = roomSchema.parse(body);

    const updated = await prisma.room.update({
      where: { id: params.id },
      data: {
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

    return NextResponse.json({ room: updated, message: "Data kamar berhasil diperbarui" });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "errors" in error) {
      return NextResponse.json({ error: (error as { errors: unknown[] }).errors }, { status: 400 });
    }
    console.error("Update room error:", error);
    return NextResponse.json({ error: "Gagal memperbarui kamar" }, { status: 500 });
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
    const activeLease = await prisma.lease.findFirst({
      where: { roomId: params.id, status: "ACTIVE" },
    });

    if (activeLease) {
      return NextResponse.json(
        { error: "Kamar tidak dapat dihapus karena masih memiliki kontrak sewa aktif" },
        { status: 400 }
      );
    }

    await prisma.room.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Kamar berhasil dihapus" });
  } catch (error) {
    console.error("Delete room error:", error);
    return NextResponse.json({ error: "Gagal menghapus kamar" }, { status: 500 });
  }
}
