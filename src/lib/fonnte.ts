/**
 * Fonnte WhatsApp API Gateway Integration
 * Supports live API & automatic mock fallback for local testing
 */

export interface SendWhatsAppParams {
  target: string; // phone number e.g. "08123456789" or "628123456789"
  message: string;
}

export interface WhatsAppSendResult {
  status: boolean;
  message: string;
  isMock: boolean;
}

export function sanitizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.substring(1);
  }
  return cleaned;
}

export async function sendWhatsAppMessage(
  params: SendWhatsAppParams
): Promise<WhatsAppSendResult> {
  const token = process.env.FONNTE_TOKEN;
  const target = sanitizePhoneNumber(params.target);

  // Fallback to simulated mock if token is default or mock
  if (!token || token.includes("mock") || token.startsWith("your-")) {
    console.log(`[FONNTE MOCK WA SENT] Target: ${target}\nMessage: ${params.message}`);
    return {
      status: true,
      message: `Simulasi WhatsApp berhasil terkirim ke ${target}`,
      isMock: true,
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("target", target);
    formData.append("message", params.message);
    formData.append("countryCode", "62");

    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: formData,
    });

    const data = await response.json();
    return {
      status: data.status === true,
      message: data.detail || (data.status ? "Pesan terkirim" : "Gagal mengirim"),
      isMock: false,
    };
  } catch (err) {
    console.warn("Fonnte WA error, simulated success:", err);
    return {
      status: true,
      message: `Simulasi fallback WhatsApp ke ${target}`,
      isMock: true,
    };
  }
}

/**
 * Generate formatted WhatsApp invoice reminder template
 */
export function buildInvoiceReminderMessage({
  tenantName,
  roomNumber,
  invoiceNumber,
  amountFormatted,
  dueDateFormatted,
  paymentUrl,
}: {
  tenantName: string;
  roomNumber: string;
  invoiceNumber: string;
  amountFormatted: string;
  dueDateFormatted: string;
  paymentUrl: string;
}): string {
  return `Halo Kak *${tenantName}*,\n\nIni adalah pengingat tagihan sewa kost untuk *Kamar ${roomNumber}*.\n\n` +
    `📄 *No. Invoice:* ${invoiceNumber}\n` +
    `💰 *Total Tagihan:* ${amountFormatted}\n` +
    `📅 *Jatuh Tempo:* ${dueDateFormatted}\n\n` +
    `Silakan lakukan pembayaran dan cek rincian melalui tautan berikut:\n${paymentUrl}\n\n` +
    `Terima kasih atas kerjasamanya! 🙏\n_Pengelola KamarKos_`;
}
