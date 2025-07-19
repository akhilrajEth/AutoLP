export interface Position {
  id: string;
  token0: string;
  token1: string;
  liquidity: string;
  feeGrowthInside0LastX128: string;
  feeGrowthInside1LastX128: string;
  tokensOwed0: string;
  tokensOwed1: string;
  tickLower: number;
  tickUpper: number;
  depositedAt: Date;
  depositPrices: {
    token0Price: number;
    token1Price: number;
  };
}

// 1inch API Types
export interface TokenBalance {
  chain_id: number;
  address: string;
  decimals: number;
  symbol?: string | null;
  name?: string | null;
  amount: number;
  price_usd?: number | null;
  value_usd?: number | null;
}

export interface HistoryMetrics {
  index: string;
  profit_abs_usd?: number | null;
  roi?: number | null;
  weighted_apr?: number | null;
  holding_time_days?: number | null;
  rewards_tokens?: TokenBalance[] | null;
  rewards_usd?: number | null;
  claimed_fees?: TokenBalance[] | null;
  unclaimed_fees?: TokenBalance[] | null;
  impermanent_loss?: TokenBalance[] | null;
  claimed_fees_usd?: number | null;
  unclaimed_fees_usd?: number | null;
  impermanent_loss_usd?: number | null;
}

export interface ProcessingInfo {
  click_time: number;
  node_time: number;
  microservices_time: number;
  redis_time: number;
  total_time: number;
}

export interface ResponseMeta {
  cached_at?: number | null;
  system?: ProcessingInfo | null;
}

export interface PortfolioResponse {
  result: HistoryMetrics[];
  meta?: ResponseMeta | null;
}
//: end of 1inch API Types

export interface PoolInfo {
  address: string;
  token0: string;
  token1: string;
  fee: number;
  tickSpacing: number;
  liquidity: string;
  sqrtPriceX96: string;
  tick: number;
  token0Price: number;
  token1Price: number;
}

export interface ImpermanentLossData {
  depositValue: number;
  currentValue: number;
  impermanentLoss: number;
  impermanentLossPercentage: number;
  token0Change: number;
  token1Change: number;
}

export interface YieldData {
  totalFeesEarned: number;
  totalFeesEarnedUSD: number;
  apr: number;
  dailyYield: number;
}

export interface DepositQuote {
  token0Amount: string;
  token1Amount: string;
  token0AmountUSD: number;
  token1AmountUSD: number;
  totalUSD: number;
  priceImpact: number;
}
