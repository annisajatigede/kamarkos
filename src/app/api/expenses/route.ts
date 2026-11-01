import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { expenseSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user.role !== "OWNER" && session.user.role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const month = searchParams.get("month"); // e.g. "2024-11"

    const where: Record<string, unknown> = {};
    if (category && category !== "ALL") {
      where.category = category;
    }

    if (month) {
      const [year, m] = month.split("-").map(Number);
      const start = new Date(year, m - 1, 1);
      const end = new Date(year, m, 0, 23, 59, 59);
      where.date = { gte: start, lte: end };
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        property: {
          select: { name: true },
        },
      },
      orderBy: { date: "desc" },
    });

    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

    return NextResponse.json({ expenses, totalExpense });
  } catch (error) {
    console.error("Get expenses error:", error);
    return NextResponse.json({ error: "Gagal memuat pengeluaran" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user.role !== "OWNER" && session.user.role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = expenseSchema.parse(body);

    const expense = await prisma.expense.create({
      data: {
        propertyId: data.propertyId,
        category: data.category,
        title: data.title,
        amount: data.amount,
        date: data.date ? new Date(data.date) : new Date(),
        receipt: data.receipt || null,
        notes: data.notes || null,
      },
    });

    return NextResponse.json({ expense, message: "Pengeluaran berhasil dicatat" }, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "errors" in error) {
      return NextResponse.json({ error: (error as { errors: unknown[] }).errors }, { status: 400 });
    }
    console.error("Create expense error:", error);
    return NextResponse.json({ error: "Gagal mencatat pengeluaran" }, { status: 500 });
  }
}
