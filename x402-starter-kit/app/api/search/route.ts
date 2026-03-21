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

export async function GET(request: Request) {
  const paymentData = request.headers.get("x-payment");
  const url = new URL(request.url);
  const resourceUrl = url.href;
  const query = url.searchParams.get("q") || "2 ambientes en Palermo";

  console.log("[search] paymentData present:", !!paymentData);
  console.log("[search] query:", query);

  const result = await settlePayment({
    resourceUrl,
    method: "GET",
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
    console.log("[search] payment failed, status:", result.status);
    console.log("[search] responseBody:", JSON.stringify(result.responseBody));
    console.log("[search] responseHeaders:", JSON.stringify(result.responseHeaders));
    return Response.json(result.responseBody, {
      status: result.status,
      headers: result.responseHeaders,
    });
  }
}
