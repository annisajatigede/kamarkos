import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { invoiceSchema } from "@/lib/validations";
import { generateInvoiceNumber } from "@/lib/format";
import { InvoiceStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const isTenant = session.user.role === "TENANT";

    const where: Record<string, unknown> = {};

    if (isTenant) {
      where.tenantId = session.user.id;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        tenant: {
          select: { id: true, name: true, email: true, phone: true },
        },
        lease: {
          include: {
            room: {
              include: {
                roomType: true,
                property: true,
              },
            },
          },
        },
        paymentTransactions: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("Get invoices error:", error);
    return NextResponse.json({ error: "Gagal memuat data tagihan" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user.role !== "OWNER" && session.user.role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Check if bulk generation is requested
    if (body.action === "GENERATE_MONTHLY_BULK") {
      const activeLeases = await prisma.lease.findMany({
        where: { status: "ACTIVE" },
        include: {
          tenant: true,
          room: { include: { roomType: true } },
        },
      });

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const dueDate = new Date(currentYear, currentMonth, 10); // Due 10th of this month

      let createdCount = 0;

      for (const lease of activeLeases) {
        // Check if invoice already exists for this lease this month
        const startOfMonth = new Date(currentYear, currentMonth, 1);
        const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

        const existing = await prisma.invoice.findFirst({
          where: {
            leaseId: lease.id,
            dueDate: { gte: startOfMonth, lte: endOfMonth },
          },
        });

        if (!existing) {
          const totalInvoices = await prisma.invoice.count();
          const invoiceNumber = generateInvoiceNumber(totalInvoices + 1);

          const items = [
            {
              title: `Sewa Kamar ${lease.room.roomNumber} (${lease.room.roomType.name}) - Periode ${now.toLocaleString("id-ID", { month: "long", year: "numeric" })}`,
              amount: lease.rentAmount,
            },
          ];

          await prisma.invoice.create({
            data: {
              invoiceNumber,
              leaseId: lease.id,
              tenantId: lease.tenantId,
              amount: lease.rentAmount,
              dueDate,
              status: InvoiceStatus.UNPAID,
              items: JSON.stringify(items),
              adminNotes: "Tagihan rutin bulanan (Generated otomatis)",
            },
          });
          createdCount++;
        }
      }

      return NextResponse.json({
        message: `Berhasil menerbitkan ${createdCount} tagihan bulanan baru untuk seluruh penghuni aktif.`,
        createdCount,
      });
    }

    // Manual single invoice creation
    const data = invoiceSchema.parse(body);
    const invoiceCount = await prisma.invoice.count();
    const invoiceNumber = generateInvoiceNumber(invoiceCount + 1);

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        leaseId: data.leaseId || null,
        tenantId: data.tenantId,
        amount: data.amount,
        dueDate: new Date(data.dueDate),
        status: data.status as InvoiceStatus,
        items: data.items || JSON.stringify([{ title: "Tagihan Kost", amount: data.amount }]),
        adminNotes: data.adminNotes || null,
      },
      include: {
        tenant: true,
      },
    });

    return NextResponse.json({ invoice, message: "Tagihan baru berhasil dibuat" }, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "errors" in error) {
      return NextResponse.json({ error: (error as { errors: unknown[] }).errors }, { status: 400 });
    }
    console.error("Create invoice error:", error);
    return NextResponse.json({ error: "Gagal membuat tagihan" }, { status: 500 });
  }
}
