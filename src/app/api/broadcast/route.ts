import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/fonnte";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user.role !== "OWNER" && session.user.role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { message, targetGroup, floor } = body;

    if (!message || message.trim().length < 5) {
      return NextResponse.json({ error: "Pesan pengumuman minimal 5 karakter" }, { status: 400 });
    }

    // Find target tenants
    const leaseWhere: Record<string, unknown> = { status: "ACTIVE" };
    if (targetGroup === "FLOOR" && floor) {
      leaseWhere.room = { floor: parseInt(floor, 10) };
    }

    const activeLeases = await prisma.lease.findMany({
      where: leaseWhere,
      include: {
        tenant: true,
        room: true,
      },
    });

    let sentCount = 0;
    const recipients: string[] = [];

    for (const lease of activeLeases) {
      if (lease.tenant.phone && !recipients.includes(lease.tenant.phone)) {
        recipients.push(lease.tenant.phone);
        const personalizedMsg = `📢 *PENGUMUMAN DARI PENGELOLA KOST*\n\nHalo Kak *${lease.tenant.name}* (Kamar ${lease.room.roomNumber}),\n\n${message}\n\nSalam,\n_Manajemen KamarKos_`;
        await sendWhatsAppMessage({
          target: lease.tenant.phone,
          message: personalizedMsg,
        });
        sentCount++;
      }
    }

    return NextResponse.json({
      message: `Pengumuman WhatsApp berhasil dikirim ke ${sentCount} penghuni aktif.`,
      sentCount,
    });
  } catch (error) {
    console.error("Broadcast error:", error);
    return NextResponse.json({ error: "Gagal mengirim broadcast WhatsApp" }, { status: 500 });
  }
}
