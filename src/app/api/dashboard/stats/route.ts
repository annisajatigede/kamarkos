import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    // 1. Rooms stats
    const totalRooms = await prisma.room.count();
    const occupiedRooms = await prisma.room.count({
      where: { status: "OCCUPIED" },
    });
    const availableRooms = await prisma.room.count({
      where: { status: "AVAILABLE" },
    });
    const maintenanceRooms = await prisma.room.count({
      where: { status: "MAINTENANCE" },
    });
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // 2. Financial this month
    const paidInvoicesThisMonth = await prisma.invoice.findMany({
      where: {
        status: "PAID",
        paidDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: { amount: true },
    });
    const totalIncomeThisMonth = paidInvoicesThisMonth.reduce((acc, curr) => acc + curr.amount, 0);

    const expensesThisMonth = await prisma.expense.findMany({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: { amount: true },
    });
    const totalExpenseThisMonth = expensesThisMonth.reduce((acc, curr) => acc + curr.amount, 0);
    const netProfitThisMonth = totalIncomeThisMonth - totalExpenseThisMonth;

    // 3. Unpaid & Overdue Invoices
    const unpaidInvoices = await prisma.invoice.findMany({
      where: {
        status: { in: ["UNPAID", "OVERDUE"] },
      },
      select: { amount: true },
    });
    const unpaidCount = unpaidInvoices.length;
    const unpaidAmount = unpaidInvoices.reduce((acc, curr) => acc + curr.amount, 0);

    // 4. Active Maintenance tickets
    const activeMaintenanceCount = await prisma.maintenanceRequest.count({
      where: {
        status: { in: ["REPORTED", "IN_PROGRESS"] },
      },
    });

    // 5. Monthly Cashflow Chart (Last 6 months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const chartData = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const mInvoices = await prisma.invoice.findMany({
        where: {
          status: "PAID",
          paidDate: { gte: mStart, lte: mEnd },
        },
        select: { amount: true },
      });
      const mIncome = mInvoices.reduce((sum, inv) => sum + inv.amount, 0);

      const mExpenses = await prisma.expense.findMany({
        where: {
          date: { gte: mStart, lte: mEnd },
        },
        select: { amount: true },
      });
      const mExpense = mExpenses.reduce((sum, exp) => sum + exp.amount, 0);

      chartData.push({
        name: `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`,
        pendapatan: mIncome,
        pengeluaran: mExpense,
        laba: mIncome - mExpense,
      });
    }

    // 6. Recent 5 Invoices
    const recentInvoices = await prisma.invoice.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        tenant: { select: { name: true, phone: true } },
        lease: {
          include: {
            room: { select: { roomNumber: true } },
          },
        },
      },
    });

    // 7. Recent 5 Maintenance Requests
    const recentMaintenance = await prisma.maintenanceRequest.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        room: { select: { roomNumber: true } },
        tenant: { select: { name: true } },
      },
    });

    // 8. Room Floor Plan Matrix
    const rooms = await prisma.room.findMany({
      include: {
        roomType: true,
        leases: {
          where: { status: "ACTIVE" },
          include: {
            tenant: { select: { name: true, phone: true } },
          },
        },
      },
      orderBy: [
        { floor: "asc" },
        { roomNumber: "asc" },
      ],
    });

    return NextResponse.json({
      kpi: {
        totalRooms,
        occupiedRooms,
        availableRooms,
        maintenanceRooms,
        occupancyRate,
        totalIncomeThisMonth,
        totalExpenseThisMonth,
        netProfitThisMonth,
        unpaidCount,
        unpaidAmount,
        activeMaintenanceCount,
      },
      chartData,
      recentInvoices,
      recentMaintenance,
      rooms,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Gagal memuat ringkasan dashboard" },
      { status: 500 }
    );
  }
}
