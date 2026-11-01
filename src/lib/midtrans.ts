/**
 * Midtrans Payment Gateway Integration
 * Supports Sandbox API with seamless Mock Fallback
 */

export interface CreateSnapTransactionParams {
  orderId: string;
  grossAmount: number;
  customerDetails: {
    firstName: string;
    email: string;
    phone?: string;
  };
  itemDetails?: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
}

export interface SnapTransactionResult {
  token: string;
  redirectUrl: string;
  isMock: boolean;
}

export async function createMidtransTransaction(
  params: CreateSnapTransactionParams
): Promise<SnapTransactionResult> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-mock-sample-key";
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
  const endpoint = isProduction
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";

  // If using sample or mock key, return simulated token immediately
  if (
    !serverKey ||
    serverKey.includes("mock") ||
    serverKey.includes("sample") ||
    serverKey.startsWith("your-")
  ) {
    const mockToken = `MOCK-SNAP-TOKEN-${params.orderId}-${Date.now()}`;
    return {
      token: mockToken,
      redirectUrl: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${mockToken}`,
      isMock: true,
    };
  }

  try {
    const authHeader = Buffer.from(`${serverKey}:`).toString("base64");
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: params.orderId,
          gross_amount: Math.round(params.grossAmount),
        },
        customer_details: {
          first_name: params.customerDetails.firstName,
          email: params.customerDetails.email,
          phone: params.customerDetails.phone,
        },
        item_details: params.itemDetails,
      }),
    });

    if (!response.ok) {
      console.warn("Midtrans API call failed, falling back to sandbox mock token", await response.text());
      const mockToken = `MOCK-SNAP-TOKEN-${params.orderId}-${Date.now()}`;
      return {
        token: mockToken,
        redirectUrl: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${mockToken}`,
        isMock: true,
      };
    }

    const data = await response.json();
    return {
      token: data.token,
      redirectUrl: data.redirect_url,
      isMock: false,
    };
  } catch (err) {
    console.warn("Midtrans connection error, falling back to mock:", err);
    const mockToken = `MOCK-SNAP-TOKEN-${params.orderId}-${Date.now()}`;
    return {
      token: mockToken,
      redirectUrl: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${mockToken}`,
      isMock: true,
    };
  }
}
