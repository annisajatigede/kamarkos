import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InvoiceStatus, TransactionStatus } from "@prisma/client";
import { formatRupiah, formatDate } from "@/lib/format";
import { sendWhatsAppMessage } from "@/lib/fonnte";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user.role !== "OWNER" && session.user.role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { adminNotes, paymentMethod } = body;

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

    if (invoice.status === InvoiceStatus.PAID) {
      return NextResponse.json({ error: "Tagihan ini sudah berstatus LUNAS" }, { status: 400 });
    }

    const paidDate = new Date();

    const updated = await prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          status: InvoiceStatus.PAID,
          paidDate,
          paymentMethod: paymentMethod || invoice.paymentMethod || "MANUAL_TRANSFER",
          adminNotes: adminNotes || `Diverifikasi dan dilunasi oleh ${session.user.name} pada ${formatDate(paidDate)}`,
        },
      });

      // Record successful transaction
      await tx.paymentTransaction.create({
        data: {
          invoiceId: invoice.id,
          transactionNumber: `TX-VERIFIED-${Date.now()}`,
          amount: invoice.amount,
          paymentType: paymentMethod || invoice.paymentMethod || "MANUAL_TRANSFER",
          status: TransactionStatus.SUCCESS,
          rawResponse: JSON.stringify({ verifiedBy: session.user.name, verifiedAt: paidDate }),
        },
      });

      return inv;
    });

    // Notify tenant via WhatsApp
    if (invoice.tenant.phone) {
      await sendWhatsAppMessage({
        target: invoice.tenant.phone,
        message: `Terima kasih Kak *${invoice.tenant.name}*! ✅\n\nPembayaran tagihan Anda dengan No. *${invoice.invoiceNumber}* sebesar *${formatRupiah(invoice.amount)}* telah *DIVERIFIKASI & LUNAS*.\n\nKwitansi elektronik dapat diunduh di ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/portal/tagihan/${invoice.id}\n\nSalam,\n*Pengelola KamarKos*`,
      });
    }

    return NextResponse.json({
      message: "Pembayaran berhasil diverifikasi. Status tagihan kini LUNAS.",
      invoice: updated,
    });
  } catch (error) {
    console.error("Verify invoice error:", error);
    return NextResponse.json({ error: "Gagal memverifikasi tagihan" }, { status: 500 });
  }
}
