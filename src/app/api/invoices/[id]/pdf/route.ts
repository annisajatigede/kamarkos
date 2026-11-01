import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateInvoiceReceiptPdf } from "@/lib/pdf";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        tenant: true,
        lease: {
          include: {
            room: {
              include: {
                property: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
    }

    if (session.user.role === "TENANT" && invoice.tenantId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let parsedItems: Array<{ title: string; amount: number }> = [];
    try {
      if (invoice.items) {
        parsedItems = JSON.parse(invoice.items);
      }
    } catch {
      parsedItems = [{ title: "Tagihan Sewa Kost", amount: invoice.amount }];
    }

    if (parsedItems.length === 0) {
      parsedItems = [{ title: "Tagihan Sewa Kost", amount: invoice.amount }];
    }

    const pdfBuffer = generateInvoiceReceiptPdf({
      invoiceNumber: invoice.invoiceNumber,
      date: invoice.createdAt,
      dueDate: invoice.dueDate,
      status: invoice.status,
      tenantName: invoice.tenant.name,
      tenantPhone: invoice.tenant.phone || undefined,
      roomNumber: invoice.lease?.room.roomNumber || "-",
      propertyName: invoice.lease?.room.property.name || "KamarKos Residence",
      propertyAddress: invoice.lease?.room.property.address || "Jatinangor, Sumedang",
      items: parsedItems,
      totalAmount: invoice.amount,
      paymentMethod: invoice.paymentMethod || undefined,
      paidDate: invoice.paidDate,
    });

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Kwitansi-${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Gagal membuat dokumen PDF kwitansi" }, { status: 500 });
  }
}
