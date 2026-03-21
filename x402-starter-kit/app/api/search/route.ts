import { settlePayment, facilitator } from "thirdweb/x402";
import { createThirdwebClient } from "thirdweb";
import { avalancheFuji } from "thirdweb/chains";
import { USDC_FUJI_ADDRESS } from "@/lib/constants";

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
    // Parse the search query from request body
    let query = "default search";
    try {
      const body = await request.json();
      query = body.query || query;
    } catch {}

    // Mock response matching Dev 1's format
    return Response.json({
      status: "done",
      result: {
        properties: [
          {
            title: "2BR Palermo Soho - Luminoso",
            price: 750,
            currency: "USD",
            neighborhood: "Palermo",
            rooms: 2,
            matchScore: 92,
            image: "https://placehold.co/400x300?text=Palermo+Soho",
          },
          {
            title: "1BR Recoleta - Centro",
            price: 600,
            currency: "USD",
            neighborhood: "Recoleta",
            rooms: 1,
            matchScore: 78,
            image: "https://placehold.co/400x300?text=Recoleta",
          },
          {
            title: "3BR Belgrano - Cerca Subte",
            price: 900,
            currency: "USD",
            neighborhood: "Belgrano",
            rooms: 3,
            matchScore: 65,
            image: "https://placehold.co/400x300?text=Belgrano",
          },
        ],
        metadata: {
          query,
          totalResults: 3,
          searchTime: "1.2s",
          timestamp: new Date().toISOString(),
        },
      },
    });
  } else {
    return Response.json(result.responseBody, {
      status: result.status,
      headers: result.responseHeaders,
    });
  }
}