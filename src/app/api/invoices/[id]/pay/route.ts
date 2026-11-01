import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createMidtransTransaction } from "@/lib/midtrans";
import { TransactionStatus } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { paymentMethod, paymentProof } = body;

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

    if (invoice.status === "PAID") {
      return NextResponse.json({ error: "Tagihan ini sudah lunas." }, { status: 400 });
    }

    // Tenant authorization check
    if (session.user.role === "TENANT" && invoice.tenantId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 1. Manual Bank Transfer proof upload
    if (paymentMethod === "MANUAL_TRANSFER") {
      if (!paymentProof) {
        return NextResponse.json({ error: "Foto bukti transfer wajib disertakan" }, { status: 400 });
      }

      const updated = await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          paymentMethod: "MANUAL_TRANSFER",
          paymentProof: paymentProof,
          adminNotes: "Menunggu verifikasi pembayaran transfer manual oleh admin",
        },
      });

      return NextResponse.json({
        message: "Bukti transfer berhasil diunggah. Pengelola akan segera memverifikasi pembayaran Anda.",
        invoice: updated,
      });
    }

    // 2. Midtrans Snap Online Gateway
    if (paymentMethod === "MIDTRANS") {
      let itemsList: Array<{ id: string; price: number; quantity: number; name: string }> = [];
      try {
        if (invoice.items) {
          const parsed = JSON.parse(invoice.items);
          itemsList = parsed.map((item: { title: string; amount: number }, idx: number) => ({
            id: `ITEM-${idx + 1}`,
            price: item.amount,
            quantity: 1,
            name: item.title.substring(0, 50),
          }));
        }
      } catch {
        itemsList = [
          {
            id: invoice.invoiceNumber,
            price: invoice.amount,
            quantity: 1,
            name: `Tagihan Kost ${invoice.invoiceNumber}`,
          },
        ];
      }

      if (itemsList.length === 0) {
        itemsList = [
          {
            id: invoice.invoiceNumber,
            price: invoice.amount,
            quantity: 1,
            name: `Tagihan Kost ${invoice.invoiceNumber}`,
          },
        ];
      }

      const snapResult = await createMidtransTransaction({
        orderId: `${invoice.invoiceNumber}-${Date.now().toString().slice(-4)}`,
        grossAmount: invoice.amount,
        customerDetails: {
          firstName: invoice.tenant.name,
          email: invoice.tenant.email,
          phone: invoice.tenant.phone || undefined,
        },
        itemDetails: itemsList,
      });

      // Update snap token on invoice
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          snapToken: snapResult.token,
          paymentMethod: "MIDTRANS",
        },
      });

      // Record transaction
      await prisma.paymentTransaction.create({
        data: {
          invoiceId: invoice.id,
          transactionNumber: `TX-${Date.now()}`,
          amount: invoice.amount,
          paymentType: "midtrans_snap",
          status: TransactionStatus.PENDING,
          rawResponse: JSON.stringify(snapResult),
        },
      });

      return NextResponse.json({
        snapToken: snapResult.token,
        redirectUrl: snapResult.redirectUrl,
        isMock: snapResult.isMock,
        message: snapResult.isMock
          ? "Mode Simulasi Midtrans Aktif (Sandbox/Mock)"
          : "Sesi pembayaran Midtrans berhasil dibuat",
      });
    }

    return NextResponse.json({ error: "Metode pembayaran tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json({ error: "Gagal memproses pembayaran" }, { status: 500 });
  }
}
