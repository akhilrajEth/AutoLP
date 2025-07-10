export interface Position {
  id: string
  token0: string
  token1: string
  liquidity: string
  feeGrowthInside0LastX128: string
  feeGrowthInside1LastX128: string
  tokensOwed0: string
  tokensOwed1: string
  tickLower: number
  tickUpper: number
  depositedAt: Date
  depositPrices: {
    token0Price: number
    token1Price: number
  }
}

export interface PoolInfo {
  address: string
  token0: string
  token1: string
  fee: number
  tickSpacing: number
  liquidity: string
  sqrtPriceX96: string
  tick: number
  token0Price: number
  token1Price: number
}

export interface ImpermanentLossData {
  depositValue: number
  currentValue: number
  impermanentLoss: number
  impermanentLossPercentage: number
  token0Change: number
  token1Change: number
}

export interface YieldData {
  totalFeesEarned: number
  totalFeesEarnedUSD: number
  apr: number
  dailyYield: number
}

export interface DepositQuote {
  token0Amount: string
  token1Amount: string
  token0AmountUSD: number
  token1AmountUSD: number
  totalUSD: number
  priceImpact: number
} 