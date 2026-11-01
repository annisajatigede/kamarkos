import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
    }

    // Role check: tenants can only see their own invoices
    if (session.user.role === "TENANT" && invoice.tenantId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("Get invoice detail error:", error);
    return NextResponse.json({ error: "Gagal memuat detail tagihan" }, { status: 500 });
  }
}
