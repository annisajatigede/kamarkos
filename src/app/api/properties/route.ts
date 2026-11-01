import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { propertySchema } from "@/lib/validations";

export async function GET() {
  try {
    const property = await prisma.property.findFirst({
      include: {
        roomTypes: true,
        rooms: true,
      },
    });
    return NextResponse.json({ property });
  } catch (error) {
    console.error("Get property error:", error);
    return NextResponse.json({ error: "Gagal mengambil data properti" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user.role !== "OWNER" && session.user.role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = propertySchema.parse(body);

    const existing = await prisma.property.findFirst();
    if (!existing) {
      const created = await prisma.property.create({
        data: {
          name: data.name,
          slug: data.slug || "kamarkos",
          address: data.address,
          city: data.city,
          district: data.district,
          description: data.description,
          rules: data.rules,
          images: data.images,
        },
      });
      return NextResponse.json({ property: created, message: "Properti berhasil dibuat" });
    }

    const updated = await prisma.property.update({
      where: { id: existing.id },
      data: {
        name: data.name,
        address: data.address,
        city: data.city,
        district: data.district,
        description: data.description,
        rules: data.rules,
        images: data.images,
      },
    });

    return NextResponse.json({ property: updated, message: "Properti berhasil diperbarui" });
  } catch (error) {
    console.error("Update property error:", error);
    return NextResponse.json({ error: "Gagal memperbarui properti" }, { status: 500 });
  }
}
