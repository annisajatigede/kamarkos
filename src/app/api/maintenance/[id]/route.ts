import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MaintenanceStatus } from "@prisma/client";

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
    const { status, cost, repairNotes } = body;

    const existing = await prisma.maintenanceRequest.findUnique({
      where: { id: params.id },
      include: { room: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Tiket keluhan tidak ditemukan" }, { status: 404 });
    }

    const resolvedAt = status === "COMPLETED" ? new Date() : existing.resolvedAt;

    const updated = await prisma.maintenanceRequest.update({
      where: { id: params.id },
      data: {
        status: status as MaintenanceStatus,
        cost: cost !== undefined ? parseFloat(cost) : existing.cost,
        repairNotes: repairNotes || existing.repairNotes,
        resolvedAt,
      },
    });

    // If completed and cost > 0, auto record expense if not already recorded
    if (status === "COMPLETED" && cost && parseFloat(cost) > 0) {
      await prisma.expense.create({
        data: {
          propertyId: existing.room.propertyId,
          category: "MAINTENANCE",
          title: `Biaya Servis: ${existing.title} (Kamar ${existing.room.roomNumber})`,
          amount: parseFloat(cost),
          date: new Date(),
          notes: repairNotes || "Perbaikan dari tiket keluhan penghuni",
        },
      });
    }

    return NextResponse.json({ ticket: updated, message: "Status keluhan berhasil diperbarui" });
  } catch (error) {
    console.error("Update maintenance error:", error);
    return NextResponse.json({ error: "Gagal memperbarui status keluhan" }, { status: 500 });
  }
}
