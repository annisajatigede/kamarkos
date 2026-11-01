import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { leaseSchema } from "@/lib/validations";
import { RoomStatus, LeaseStatus } from "@prisma/client";
import { generateInvoiceNumber, formatRupiah, formatDate } from "@/lib/format";
import { sendWhatsAppMessage } from "@/lib/fonnte";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const isTenant = session.user.role === "TENANT";
    const whereClause = isTenant ? { tenantId: session.user.id } : {};

    const leases = await prisma.lease.findMany({
      where: whereClause,
      include: {
        tenant: {
          select: { id: true, name: true, email: true, phone: true },
        },
        room: {
          include: {
            roomType: true,
            property: true,
          },
        },
        invoices: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ leases });
  } catch (error) {
    console.error("Get leases error:", error);
    return NextResponse.json({ error: "Gagal memuat data kontrak sewa" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user.role !== "OWNER" && session.user.role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = leaseSchema.parse(body);

    // Check room availability
    const room = await prisma.room.findUnique({
      where: { id: data.roomId },
      include: { property: true, roomType: true },
    });

    if (!room) {
      return NextResponse.json({ error: "Kamar tidak ditemukan" }, { status: 404 });
    }

    if (room.status === RoomStatus.OCCUPIED) {
      return NextResponse.json({ error: `Kamar ${room.roomNumber} saat ini sedang terisi.` }, { status: 400 });
    }

    const tenant = await prisma.user.findUnique({
      where: { id: data.tenantId },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Penyewa tidak ditemukan" }, { status: 404 });
    }

    const sDate = new Date(data.startDate);
    const eDate = new Date(data.endDate);

    // Create lease transaction and update room status
    const result = await prisma.$transaction(async (tx) => {
      const lease = await tx.lease.create({
        data: {
          tenantId: data.tenantId,
          roomId: data.roomId,
          startDate: sDate,
          endDate: eDate,
          billingCycle: data.billingCycle,
          rentAmount: data.rentAmount,
          depositAmount: data.depositAmount,
          status: LeaseStatus.ACTIVE,
          notes: data.notes,
        },
      });

      await tx.room.update({
        where: { id: data.roomId },
        data: {
          status: RoomStatus.OCCUPIED,
          notes: `Dihuni oleh ${tenant.name}`,
        },
      });

      // Generate first invoice
      const invoiceCount = await tx.invoice.count();
      const invoiceNumber = generateInvoiceNumber(invoiceCount + 1);

      const items = [
        { title: `Sewa Kamar ${room.roomNumber} (${room.roomType.name})`, amount: data.rentAmount },
      ];
      if (data.depositAmount > 0) {
        items.push({ title: "Deposit Jaminan Sewa", amount: data.depositAmount });
      }

      const totalInvoice = data.rentAmount + data.depositAmount;

      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          leaseId: lease.id,
          tenantId: tenant.id,
          amount: totalInvoice,
          dueDate: new Date(sDate.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days grace
          status: "UNPAID",
          items: JSON.stringify(items),
          adminNotes: "Tagihan awal sewa & deposit",
        },
      });

      return { lease, invoice };
    });

    // Send WhatsApp notification if tenant has phone
    if (tenant.phone) {
      await sendWhatsAppMessage({
        target: tenant.phone,
        message: `Selamat datang di *${room.property.name}*, Kak *${tenant.name}*! 🎉\n\nKontrak sewa untuk *Kamar ${room.roomNumber}* telah aktif mulai ${formatDate(sDate)} s/d ${formatDate(eDate)}.\n\nTagihan pertama Anda sebesar *${formatRupiah(data.rentAmount + data.depositAmount)}* telah diterbitkan. Silakan akses portal tenant Anda di ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/portal untuk informasi tagihan.\n\nTerima kasih!`,
      });
    }

    return NextResponse.json(
      { message: "Kontrak sewa berhasil dibuat dan kamar telah diaktifkan", lease: result.lease },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error && typeof error === "object" && "errors" in error) {
      return NextResponse.json({ error: (error as { errors: unknown[] }).errors }, { status: 400 });
    }
    console.error("Create lease error:", error);
    return NextResponse.json({ error: "Gagal membuat kontrak sewa" }, { status: 500 });
  }
}
