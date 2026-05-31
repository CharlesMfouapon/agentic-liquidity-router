import { NextRequest } from "next/server";

// Edge runtime for streaming
export const runtime = "edge";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    amount,
    fromCurrency,
    toCurrency,
    fromCountry,
    toCountry,
    destinationType,
    optimizeFor,
  } = body;

  const apiKey = process.env.ANTHROPIC_API_KEY || "";

  if (!apiKey) {
    // Demo mode: return synthetic response
    return new Response(streamDemoResponse(body), {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  // Live mode: call Claude
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2048,
      stream: true,
      system: `You are an autonomous liquidity routing agent specialized in African cross-border payments.
      
Your expertise:
- Mobile money rails: MTN Mobile Money, Orange Money, M-Pesa, Wave
- African currency corridors: XOF, XAF, NGN, GHS, KES, UGX, ZAR
- Onchain liquidity: Uniswap, Curve on L2s
- P2P markets: Binance P2P, Paxful

Always respond with structured JSON:
{
  "recommendedRoute": {
    "hops": [{"from": "USDC", "to": "USDT", "source": "Uniswap V3", "rate": 1.0001, "fee": 0.25}],
    "totalFeePercent": 0.025,
    "totalFeeAbsolute": 12.50,
    "estimatedSettlementSeconds": 195,
    "confidenceScore": 0.94
  },
  "alternatives": [...],
  "riskFactors": ["..."],
  "reasoning": "..."
}`,
      messages: [
        {
          role: "user",
          content: `Route ${amount} ${fromCurrency} from ${fromCountry} to ${toCountry} as ${toCurrency}. Destination: ${JSON.stringify(destinationType)}. Optimize for: ${optimizeFor}.`,
        },
      ],
    }),
  });

  return new Response(response.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

function streamDemoResponse(body: any) {
  const encoder = new TextEncoder();
  const demoData = {
    recommendedRoute: {
      hops: [
        {
          from: body.fromCurrency || "USDC",
          to: "USDT",
          source: "Uniswap V3 (Polygon)",
          rate: 1.0001,
          fee: (body.amount || 500) * 0.0005,
        },
        {
          from: "USDT",
          to: body.toCurrency || "XOF",
          source: "Orange Money CI",
          rate: 605,
          fee: (body.amount || 500) * 0.02,
        },
      ],
      totalFeePercent: 2.5,
      totalFeeAbsolute: (body.amount || 500) * 0.025,
      estimatedSettlementSeconds: 195,
      confidenceScore: 0.94,
    },
    alternatives: [
      {
        hops: [
          {
            from: body.fromCurrency || "USDC",
            to: body.toCurrency || "XOF",
            source: "Binance P2P",
            rate: 608,
            fee: (body.amount || 500) * 0.015,
          },
        ],
        totalFeePercent: 1.5,
        totalFeeAbsolute: (body.amount || 500) * 0.015,
        estimatedSettlementSeconds: 600,
        confidenceScore: 0.82,
      },
    ],
    riskFactors: [
      "Orange Money may have daily limits on weekends",
      "XOF parallel market spread can widen during market hours",
      "USDC/USDT pool liquidity is deep (>$50M) on Polygon",
    ],
    reasoning:
      "Orange Money offers the best balance of speed and reliability for the XOF corridor. The Uniswap hop adds minimal cost (0.05% pool fee) and provides instant USDC→USDT conversion. Total settlement under 4 minutes with 94% confidence based on historical success rates.",
  };

  const stream = new ReadableStream({
    start(controller) {
      const words = JSON.stringify(demoData).split("");
      let i = 0;

      const interval = setInterval(() => {
        if (i < words.length) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ chunk: words[i] })}\n\n`)
          );
          i++;
        } else {
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
          clearInterval(interval);
        }
      }, 10);
    },
  });

  return stream;
}
