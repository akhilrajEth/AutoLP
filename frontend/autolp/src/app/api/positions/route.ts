import { NextResponse } from "next/server";
import axios from "axios";

interface TokenBalance {
  chain: number;
  address: string;
  decimals: number;
  symbol?: string | null;
  name?: string | null;
  amount: number;
  price_usd?: number | null;
}

interface HistoryMetrics {
  index: string;
  profit_abs_usd?: number | null;
  roi?: number | null;
  weighted_apr?: number | null;
  holding_time_days?: number | null;
  rewards_tokens?: TokenBalance[] | null;
  claimed_fees?: TokenBalance[] | null;
  unclaimed_fees?: TokenBalance[] | null;
  impermanent_loss?: TokenBalance[] | null;
  claimed_fees_usd?: number | null;
  unclaimed_fees_usd?: number | null;
  impermanent_loss_usd?: number | null;
}

interface ProcessingInfo {
  click_time: number;
  node_time: number;
  microservices_time: number;
  redis_time: number;
  total_time: number;
}

interface ResponseMeta {
  cached_at?: number | null;
  system?: ProcessingInfo | null;
}

interface PortfolioResponse {
  result: HistoryMetrics[];
  meta?: ResponseMeta | null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userPublicAddress = searchParams.get("userPublicAddress");

  if (!userPublicAddress) {
    return NextResponse.json({ error: "Missing userPublicAddress" }, { status: 400 });
  }

  const apiKey = process.env.INCH_API_KEY;
  
  if (!apiKey) {
    console.error("INCH_API_KEY environment variable is not set");
    return NextResponse.json(
      { error: "API configuration error" }, 
      { status: 500 }
    );
  }

  try {
    const url = "https://api.1inch.dev/portfolio/portfolio/v5.0/protocols/metrics";
    
    const config = {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      params: {
        addresses: [userPublicAddress],
        chain_id: "130", 
      },
      paramsSerializer: {
        indexes: null,
      },
    };

    const response = await axios.get<PortfolioResponse>(url, config);
    
    return NextResponse.json({
      success: true,
      data: response.data,
    });

  } catch (error) {
    console.error("Error fetching portfolio data:", error);
    
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { 
          error: "Failed to fetch portfolio data", 
          details: error.response?.data || error.message 
        }, 
        { status: error.response?.status || 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}