import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage, buildInvoiceReminderMessage } from "@/lib/fonnte";
import { formatRupiah, formatDate } from "@/lib/format";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user.role !== "OWNER" && session.user.role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        tenant: true,
        lease: {
          include: {
            room: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
    }

    if (!invoice.tenant.phone) {
      return NextResponse.json({ error: "Nomor WhatsApp penyewa tidak terdaftar" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const paymentUrl = `${appUrl}/portal/tagihan/${invoice.id}`;

    const message = buildInvoiceReminderMessage({
      tenantName: invoice.tenant.name,
      roomNumber: invoice.lease?.room.roomNumber || "-",
      invoiceNumber: invoice.invoiceNumber,
      amountFormatted: formatRupiah(invoice.amount),
      dueDateFormatted: formatDate(invoice.dueDate),
      paymentUrl,
    });

    const waResult = await sendWhatsAppMessage({
      target: invoice.tenant.phone,
      message,
    });

    return NextResponse.json({
      message: waResult.isMock
        ? `Pengingat WhatsApp berhasil disimulasikan ke nomor ${invoice.tenant.phone}`
        : `Pengingat WhatsApp berhasil dikirim ke nomor ${invoice.tenant.phone}`,
      isMock: waResult.isMock,
    });
  } catch (error) {
    console.error("Send reminder error:", error);
    return NextResponse.json({ error: "Gagal mengirim pengingat WhatsApp" }, { status: 500 });
  }
}
