import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validations";

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: { isPublished: true },
      include: {
        tenant: {
          select: { name: true, avatar: true },
        },
        room: {
          select: { roomNumber: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json({ error: "Gagal memuat ulasan" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = reviewSchema.parse(body);

    const review = await prisma.review.create({
      data: {
        tenantId: session.user.id,
        propertyId: data.propertyId,
        roomId: data.roomId || null,
        rating: data.rating,
        comment: data.comment,
        isPublished: true,
      },
    });

    return NextResponse.json({ review, message: "Terima kasih atas ulasan Anda!" }, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "errors" in error) {
      return NextResponse.json({ error: (error as { errors: unknown[] }).errors }, { status: 400 });
    }
    console.error("Create review error:", error);
    return NextResponse.json({ error: "Gagal mengirim ulasan" }, { status: 500 });
  }
}
