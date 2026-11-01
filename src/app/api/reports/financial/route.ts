import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user.role !== "OWNER" && session.user.role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month"); // e.g. "2024-11"

    const now = new Date();
    const [year, m] = month ? month.split("-").map(Number) : [now.getFullYear(), now.getMonth() + 1];

    const startOfMonth = new Date(year, m - 1, 1);
    const endOfMonth = new Date(year, m, 0, 23, 59, 59);

    // 1. Incomes (Paid invoices in this period)
    const paidInvoices = await prisma.invoice.findMany({
      where: {
        status: "PAID",
        paidDate: { gte: startOfMonth, lte: endOfMonth },
      },
      include: {
        tenant: { select: { name: true } },
        lease: {
          include: {
            room: { select: { roomNumber: true } },
          },
        },
      },
      orderBy: { paidDate: "desc" },
    });

    const totalIncome = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    // 2. Expenses in this period
    const expenses = await prisma.expense.findMany({
      where: {
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      orderBy: { date: "desc" },
    });

    const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netProfit = totalIncome - totalExpense;

    // 3. Occupancy in this period
    const totalRooms = await prisma.room.count();
    const occupiedRooms = await prisma.room.count({
      where: { status: "OCCUPIED" },
    });
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // 4. Combined transactions chronologically
    const transactions = [
      ...paidInvoices.map((inv) => ({
        id: inv.id,
        date: inv.paidDate || inv.createdAt,
        type: "INCOME" as const,
        category: "Sewa Kost",
        description: `Pembayaran ${inv.invoiceNumber} - ${inv.tenant.name} (Kamar ${inv.lease?.room.roomNumber || "-"})`,
        amount: inv.amount,
      })),
      ...expenses.map((exp) => ({
        id: exp.id,
        date: exp.date,
        type: "EXPENSE" as const,
        category: exp.category,
        description: exp.title,
        amount: exp.amount,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      period: `${year}-${m.toString().padStart(2, "0")}`,
      totalIncome,
      totalExpense,
      netProfit,
      occupancyRate,
      paidInvoicesCount: paidInvoices.length,
      expensesCount: expenses.length,
      transactions,
    });
  } catch (error) {
    console.error("Get financial report error:", error);
    return NextResponse.json({ error: "Gagal memuat laporan keuangan" }, { status: 500 });
  }
}
