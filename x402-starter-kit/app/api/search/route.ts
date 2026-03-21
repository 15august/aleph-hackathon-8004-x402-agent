import { settlePayment, facilitator } from "thirdweb/x402";
import { createThirdwebClient } from "thirdweb";
import { avalancheFuji } from "thirdweb/chains";
import { USDC_FUJI_ADDRESS } from "@/lib/constants";

const BACKEND_URL = "https://ai-agent-property.vercel.app";

const client = createThirdwebClient({
  secretKey: process.env.THIRDWEB_SECRET_KEY!,
});

const thirdwebFacilitator = facilitator({
  client,
  serverWalletAddress: process.env.THIRDWEB_SERVER_WALLET_ADDRESS!,
});

export async function POST(request: Request) {
  const paymentData = request.headers.get("x-payment");
  const resourceUrl = new URL(request.url).href;

  const result = await settlePayment({
    resourceUrl,
    method: "POST",
    paymentData,
    payTo: process.env.MERCHANT_WALLET_ADDRESS!,
    network: avalancheFuji,
    price: {
      amount: "10000", // $0.01 USDC
      asset: {
        address: USDC_FUJI_ADDRESS,
      },
    },
    facilitator: thirdwebFacilitator,
  });

  if (result.status === 200) {
    // Payment accepted — forward query to Dev 1 backend
    let query = "2 ambientes en Palermo";
    try {
      const body = await request.json();
      query = body.query || query;
    } catch {}

    const backendResponse = await fetch(`${BACKEND_URL}/api/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    let data: Record<string, unknown> = {};
    try {
      data = await backendResponse.json();
    } catch {
      return Response.json({
        error: `Backend returned non-JSON response (status ${backendResponse.status})`,
        payment: {
          transaction: result.paymentReceipt.transaction,
          network: result.paymentReceipt.network,
          payer: result.paymentReceipt.payer,
        },
      }, { status: 502 });
    }

    return Response.json({
      ...data,
      payment: {
        transaction: result.paymentReceipt.transaction,
        network: result.paymentReceipt.network,
        payer: result.paymentReceipt.payer,
      },
    }, { status: backendResponse.status });
  } else {
    return Response.json(result.responseBody, {
      status: result.status,
      headers: result.responseHeaders,
    });
  }
}