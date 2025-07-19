import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { Position, ImpermanentLossData, YieldData, HistoryMetrics, PortfolioResponse } from "../types";

// Mock data for demonstration
const mockPositions: Position[] = [
  {
    id: "1",
    token0: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
    token1: "0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8", // USDC
    liquidity: "1000000000000000000",
    feeGrowthInside0LastX128: "0",
    feeGrowthInside1LastX128: "0",
    tokensOwed0: "100000000000000000",
    tokensOwed1: "100000000",
    tickLower: -887220,
    tickUpper: 887220,
    depositedAt: new Date("2024-01-01"),
    depositPrices: {
      token0Price: 2500, // ETH at $2500
      token1Price: 1, // USDC at $1
    },
  },
];

const mockPoolInfo = {
  address: "0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8",
  token0: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  token1: "0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8",
  fee: 3000,
  tickSpacing: 60,
  liquidity: "1000000000000000000000",
  sqrtPriceX96: "177184290212558734586",
  tick: 194595,
  token0Price: 3200, // Current ETH price
  token1Price: 1, // Current USDC price
};

function convertHistoryMetricsToPosition(metric: HistoryMetrics): Position {
  const token0 = metric.claimed_fees?.[0] || metric.impermanent_loss?.[0];
  const token1 = metric.claimed_fees?.[1] || metric.impermanent_loss?.[1];
  
  return {
    id: metric.index,
    token0: token0?.address || "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // ETH
    token1: token1?.address || "0x078d782b760474a361dda0af3839290b0ef57ad6", // USDC
    liquidity: "0", // Not available in 1inch data
    feeGrowthInside0LastX128: "0",
    feeGrowthInside1LastX128: "0",
    tokensOwed0: "0",
    tokensOwed1: "0",
    tickLower: 0,
    tickUpper: 0,
    depositedAt: new Date(Date.now() - (metric.holding_time_days || 0) * 24 * 60 * 60 * 1000),
    depositPrices: {
      token0Price: token0?.price_usd || 3554.92, // Current ETH price
      token1Price: token1?.price_usd || 1, // USDC price
    },
  };
}

export function useInchPositions() {
  const { user, authenticated } = usePrivy();
  const address = user?.wallet?.address;

  return useQuery({
    queryKey: ["inch-positions", address],
    queryFn: async (): Promise<HistoryMetrics[]> => {
      if (!address || !authenticated) return [];

      try {
        console.log("Fetching positions for address:", address);
        const response = await fetch(`/api/positions?userPublicAddress=${address}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error:", response.status, errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("API Response:", data);
        
        if (!data.success) {
          throw new Error(data.error || "Failed to fetch positions");
        }

        // Return only positions with actual data
        const filteredPositions = data.data.result.filter((metric: HistoryMetrics) => 
          metric.profit_abs_usd !== null || 
          metric.claimed_fees_usd !== null || 
          metric.impermanent_loss_usd !== null
        );

        console.log("Filtered positions:", filteredPositions.length);
        return filteredPositions;
      } catch (error) {
        console.error("Error fetching positions:", error);
        return [];
      }
    },
    enabled: !!address && authenticated,
    retry: 2,
    retryDelay: 1000,
  });
}

export function usePositions() {
  const { user, authenticated } = usePrivy();
  const address = user?.wallet?.address;

  return useQuery({
    queryKey: ["positions", address],
    queryFn: async (): Promise<Position[]> => {
      if (!address || !authenticated) return [];

      try {
        const response = await fetch(`/api/positions?userPublicAddress=${address}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || "Failed to fetch positions");
        }

        // Convert 1inch API response to Position format
        const positions = data.data.result
          .filter((metric: HistoryMetrics) => 
            metric.profit_abs_usd !== null || 
            metric.claimed_fees_usd !== null || 
            metric.impermanent_loss_usd !== null
          )
          .map(convertHistoryMetricsToPosition);

        return positions;
      } catch (error) {
        console.error("Error fetching positions:", error);
        return [];
      }
    },
    enabled: !!address && authenticated,
  });
}

export function usePoolInfo(poolAddress: string) {
  return useQuery({
    queryKey: ["pool-info", poolAddress],
    queryFn: async () => {
      // In a real app, this would fetch from Uniswap V4 pool contract
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockPoolInfo;
    },
  });
}

export function useImpermanentLoss(
  position: Position | undefined,
  currentPrices: { token0Price: number; token1Price: number }
) {
  return useQuery({
    queryKey: ["impermanent-loss", position?.id, currentPrices],
    queryFn: async (): Promise<ImpermanentLossData> => {
      if (!position) {
        throw new Error("Position is required");
      }
      
      const token0Amount = (parseFloat(position.liquidity) / 1e18) * 0.5; // Simplified calculation
      const token1Amount =
        (parseFloat(position.liquidity) / 1e18) *
        0.5 *
        position.depositPrices.token0Price;

      const { calculateImpermanentLoss } = await import("@/lib/utils");

      return calculateImpermanentLoss(
        position.depositPrices,
        currentPrices,
        token0Amount,
        token1Amount
      );
    },
    enabled: !!position && !!currentPrices,
  });
}

export function useYield(position: Position | undefined) {
  return useQuery({
    queryKey: ["yield", position?.id],
    queryFn: async (): Promise<YieldData> => {
      if (!position) {
        throw new Error("Position is required");
      }
      
      const daysSinceDeposit =
        (Date.now() - position.depositedAt.getTime()) / (1000 * 60 * 60 * 24);
      const feesEarned =
        (parseFloat(position.tokensOwed0) / 1e18) * 3200 +
        parseFloat(position.tokensOwed1) / 1e6;
      const positionValue = (parseFloat(position.liquidity) / 1e18) * 3200;

      const { calculateYield } = await import("@/lib/utils");

      return calculateYield(feesEarned, positionValue, daysSinceDeposit);
    },
    enabled: !!position,
  });
}
