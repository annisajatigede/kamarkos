import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookingSchema } from "@/lib/validations";
import { sendWhatsAppMessage } from "@/lib/fonnte";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = bookingSchema.parse(body);

    const room = await prisma.room.findUnique({
      where: { id: data.roomId },
      include: {
        roomType: true,
        property: true,
      },
    });

    if (!room) {
      return NextResponse.json(
        { error: "Kamar tidak ditemukan" },
        { status: 404 }
      );
    }

    // Notify guest via WhatsApp
    await sendWhatsAppMessage({
      target: data.phone,
      message: `Halo Kak *${data.name}*,\n\nTerima kasih telah mengajukan reservasi untuk *Kamar ${room.roomNumber} (${room.roomType.name})* di ${room.property.name}.\n\n📅 Rencana Masuk: ${data.checkInDate}\nPengelola kost kami akan segera menghubungi Kakak melalui WhatsApp ini untuk konfirmasi ketersediaan dan proses check-in.\n\nSalam,\n*Tim KamarKos*`,
    });

    return NextResponse.json({
      message: "Pengajuan sewa berhasil dikirim. Pengelola kost akan segera menghubungi Anda.",
      booking: {
        name: data.name,
        roomNumber: room.roomNumber,
        checkInDate: data.checkInDate,
      },
    });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "errors" in error) {
      return NextResponse.json({ error: (error as { errors: unknown[] }).errors }, { status: 400 });
    }
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Gagal memproses pengajuan booking" },
      { status: 500 }
    );
  }
}
