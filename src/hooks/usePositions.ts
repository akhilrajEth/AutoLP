import { useQuery } from '@tanstack/react-query'
import { usePrivy } from '@privy-io/react-auth'
import { Position, ImpermanentLossData, YieldData } from '@/types'

// Mock data for demonstration
const mockPositions: Position[] = [
  {
    id: '1',
    token0: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
    token1: '0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8', // USDC
    liquidity: '1000000000000000000',
    feeGrowthInside0LastX128: '0',
    feeGrowthInside1LastX128: '0',
    tokensOwed0: '100000000000000000',
    tokensOwed1: '100000000',
    tickLower: -887220,
    tickUpper: 887220,
    depositedAt: new Date('2024-01-01'),
    depositPrices: {
      token0Price: 2500, // ETH at $2500
      token1Price: 1, // USDC at $1
    },
  },
]

const mockPoolInfo = {
  address: '0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8',
  token0: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  token1: '0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8',
  fee: 3000,
  tickSpacing: 60,
  liquidity: '1000000000000000000000',
  sqrtPriceX96: '177184290212558734586',
  tick: 194595,
  token0Price: 3200, // Current ETH price
  token1Price: 1, // Current USDC price
}

export function usePositions() {
  const { user, authenticated } = usePrivy()
  const address = user?.wallet?.address

  return useQuery({
    queryKey: ['positions', address],
    queryFn: async (): Promise<Position[]> => {
      // In a real app, this would fetch from a subgraph or API
      if (!address || !authenticated) return []
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return mockPositions
    },
    enabled: !!address && authenticated,
  })
}

export function usePoolInfo(poolAddress: string) {
  return useQuery({
    queryKey: ['pool-info', poolAddress],
    queryFn: async () => {
      // In a real app, this would fetch from Uniswap V4 pool contract
      await new Promise(resolve => setTimeout(resolve, 500))
      return mockPoolInfo
    },
  })
}

export function useImpermanentLoss(position: Position, currentPrices: { token0Price: number; token1Price: number }) {
  return useQuery({
    queryKey: ['impermanent-loss', position.id, currentPrices],
    queryFn: async (): Promise<ImpermanentLossData> => {
      const token0Amount = parseFloat(position.liquidity) / 1e18 * 0.5 // Simplified calculation
      const token1Amount = parseFloat(position.liquidity) / 1e18 * 0.5 * position.depositPrices.token0Price
      
      const { calculateImpermanentLoss } = await import('@/lib/utils')
      
      return calculateImpermanentLoss(
        position.depositPrices,
        currentPrices,
        token0Amount,
        token1Amount
      )
    },
    enabled: !!position && !!currentPrices,
  })
}

export function useYield(position: Position) {
  return useQuery({
    queryKey: ['yield', position.id],
    queryFn: async (): Promise<YieldData> => {
      const daysSinceDeposit = (Date.now() - position.depositedAt.getTime()) / (1000 * 60 * 60 * 24)
      const feesEarned = parseFloat(position.tokensOwed0) / 1e18 * 3200 + parseFloat(position.tokensOwed1) / 1e6
      const positionValue = parseFloat(position.liquidity) / 1e18 * 3200
      
      const { calculateYield } = await import('@/lib/utils')
      
      return calculateYield(feesEarned, positionValue, daysSinceDeposit)
    },
    enabled: !!position,
  })
} 