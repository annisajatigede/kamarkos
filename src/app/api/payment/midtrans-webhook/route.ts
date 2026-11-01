import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { InvoiceStatus, TransactionStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const notification = await req.json();

    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;
    const paymentType = notification.payment_type;

    if (!orderId) {
      return NextResponse.json({ error: "Invalid order_id" }, { status: 400 });
    }

    // Extract invoice number from orderId (e.g. "INV-202411-0001-1234")
    const invoicePrefix = orderId.split("-").slice(0, 3).join("-");

    const invoice = await prisma.invoice.findFirst({
      where: {
        OR: [
          { invoiceNumber: invoicePrefix },
          { invoiceNumber: orderId },
        ],
      },
    });

    if (!invoice) {
      console.warn("Invoice not found for Midtrans order:", orderId);
      return NextResponse.json({ message: "Invoice not found, ignored" }, { status: 200 });
    }

    let isSuccess = false;

    if (transactionStatus === "capture") {
      if (fraudStatus === "accept") {
        isSuccess = true;
      }
    } else if (transactionStatus === "settlement") {
      isSuccess = true;
    }

    if (isSuccess) {
      await prisma.$transaction(async (tx) => {
        await tx.invoice.update({
          where: { id: invoice.id },
          data: {
            status: InvoiceStatus.PAID,
            paidDate: new Date(),
            paymentMethod: `MIDTRANS_${paymentType?.toUpperCase() || "ONLINE"}`,
            adminNotes: `Lunas otomatis melalui Midtrans Webhook (${paymentType})`,
          },
        });

        await tx.paymentTransaction.create({
          data: {
            invoiceId: invoice.id,
            transactionNumber: `TX-WEBHOOK-${Date.now()}`,
            gatewayTransactionId: notification.transaction_id,
            amount: parseFloat(notification.gross_amount || invoice.amount.toString()),
            paymentType: paymentType,
            status: TransactionStatus.SUCCESS,
            rawResponse: JSON.stringify(notification),
          },
        });
      });
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      await prisma.paymentTransaction.create({
        data: {
          invoiceId: invoice.id,
          transactionNumber: `TX-FAILED-${Date.now()}`,
          gatewayTransactionId: notification.transaction_id,
          amount: parseFloat(notification.gross_amount || invoice.amount.toString()),
          paymentType: paymentType,
          status: TransactionStatus.FAILED,
          rawResponse: JSON.stringify(notification),
        },
      });
    }

    return NextResponse.json({ message: "Webhook processed successfully", status: "OK" });
  } catch (error) {
    console.error("Midtrans webhook error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
