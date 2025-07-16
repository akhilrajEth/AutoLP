import { SubgraphFetchService, ModifyLiquidity, Pool } from './subgraphFetch';

export interface PositionMetrics {
  positionSize: {
    amount0: number;
    amount1: number;
    totalUSD: number;
    token0Symbol: string;
    token1Symbol: string;
  };
  impermanentLoss: {
    percentage: number;
    entryValue: number;
    currentValue: number;
    holdValue: number;
    lossAmount: number;
  };
  entryData: {
    averageEntryPrice0: number;
    averageEntryPrice1: number;
    totalDepositedUSD: number;
    totalWithdrawnUSD: number;
  };
  currentData: {
    currentPrice0: number;
    currentPrice1: number;
    isInRange: boolean;
  };
}

export class CalculateUserDataService extends SubgraphFetchService {
  constructor() {
    super();
  }

  /**
   * Calculate comprehensive position metrics for a user
   * @param userAddress - The user's address
   * @param poolAddress - The pool address
   * @returns Promise<PositionMetrics>
   */
  async calculatePositionMetrics(userAddress: string, poolAddress: string): Promise<PositionMetrics> {
    try {
      // Fetch all necessary data
      const [userData, currentPool] = await Promise.all([
        this.fetchUserData(userAddress, poolAddress),
        this.fetchCurrentPoolState(poolAddress)
      ]);

      if (!userData.length) {
        throw new Error('No position data found for this user and pool');
      }

      // Calculate position size
      const positionSize = this.calculatePositionSize(userData);

      // Calculate entry data
      const entryData = this.calculateEntryData(userData);

      // Get current data
      const currentData = this.getCurrentData(currentPool, userData[0]);

      // Calculate impermanent loss
      const impermanentLoss = this.calculateImpermanentLoss(
        positionSize,
        entryData,
        currentData
      );

      return {
        positionSize,
        impermanentLoss,
        entryData,
        currentData
      };
    } catch (error) {
      console.error('Error calculating position metrics:', error);
      throw new Error(`Failed to calculate position metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate current position size from ModifyLiquidity events
   */
  private calculatePositionSize(userData: ModifyLiquidity[]): PositionMetrics['positionSize'] {
    // Only consider positive liquidity changes (deposits) for current position size
    const deposits = userData.filter(event => parseFloat(event.amount) > 0);
    
    const netAmounts = deposits.reduce((acc, event) => {
      const amount0 = parseFloat(event.amount0);
      const amount1 = parseFloat(event.amount1);
      const amountUSD = parseFloat(event.amountUSD || '0');

      return {
        amount0: acc.amount0 + amount0,
        amount1: acc.amount1 + amount1,
        totalUSD: acc.totalUSD + amountUSD
      };
    }, { amount0: 0, amount1: 0, totalUSD: 0 });

    // Get token symbols from the first event
    const firstEvent = userData[0];
    const token0Symbol = firstEvent.pool.token0.symbol;
    const token1Symbol = firstEvent.pool.token1.symbol;

    return {
      amount0: netAmounts.amount0,
      amount1: netAmounts.amount1,
      totalUSD: netAmounts.totalUSD,
      token0Symbol,
      token1Symbol
    };
  }

  /**
   * Calculate entry data (average entry prices, total deposited/withdrawn)
   */
  private calculateEntryData(userData: ModifyLiquidity[]): PositionMetrics['entryData'] {
    const deposits = userData.filter(event => parseFloat(event.amount) > 0);
    const withdrawals = userData.filter(event => parseFloat(event.amount) < 0);

    // Calculate total deposited and withdrawn USD
    const totalDepositedUSD = deposits.reduce((sum, event) => 
      sum + parseFloat(event.amountUSD || '0'), 0);
    const totalWithdrawnUSD = withdrawals.reduce((sum, event) => 
      sum + Math.abs(parseFloat(event.amountUSD || '0')), 0);

    // Calculate weighted average entry prices using USD amounts as weights
    let weightedPrice0Sum = 0;
    let weightedPrice1Sum = 0;
    let totalWeight = 0;

    deposits.forEach(event => {
      const weight = parseFloat(event.amountUSD || '0');
      // The token prices in the subgraph are already in USD terms
      const price0USD = parseFloat(event.pool.token0Price);
      const price1USD = parseFloat(event.pool.token1Price);

      weightedPrice0Sum += price0USD * weight;
      weightedPrice1Sum += price1USD * weight;
      totalWeight += weight;
    });

    const averageEntryPrice0 = totalWeight > 0 ? weightedPrice0Sum / totalWeight : 0;
    const averageEntryPrice1 = totalWeight > 0 ? weightedPrice1Sum / totalWeight : 0;

    return {
      averageEntryPrice0,
      averageEntryPrice1,
      totalDepositedUSD,
      totalWithdrawnUSD
    };
  }

  /**
   * Get current pool data
   */
  private getCurrentData(currentPool: Pool, sampleEvent: ModifyLiquidity): PositionMetrics['currentData'] {
    // The token prices in the subgraph are already in USD terms
    const currentPrice0USD = parseFloat(currentPool.token0Price);
    const currentPrice1USD = parseFloat(currentPool.token1Price);
    const currentTick = parseInt(currentPool.tick);
    
    // Check if position is in range
    const tickLower = parseInt(sampleEvent.tickLower);
    const tickUpper = parseInt(sampleEvent.tickUpper);
    const isInRange = currentTick >= tickLower && currentTick < tickUpper;

    return {
      currentPrice0: currentPrice0USD,
      currentPrice1: currentPrice1USD,
      isInRange
    };
  }

  /**
   * Calculate impermanent loss using standard formula
   */
  private calculateImpermanentLoss(
    positionSize: PositionMetrics['positionSize'],
    entryData: PositionMetrics['entryData'],
    currentData: PositionMetrics['currentData']
  ): PositionMetrics['impermanentLoss'] {
    const { amount0, amount1 } = positionSize;
    const { averageEntryPrice0, averageEntryPrice1 } = entryData;
    const { currentPrice0, currentPrice1 } = currentData;

    // Entry value: what you paid for the tokens you still have
    const entryValue = (amount0 * averageEntryPrice0) + (amount1 * averageEntryPrice1);
    // Current value: what your tokens are worth now
    const currentValue = (amount0 * currentPrice0) + (amount1 * currentPrice1);
    // Hold value: what your tokens would be worth if you just held them (same as current value for simple case)
    const holdValue = currentValue;

    // Impermanent loss: difference between LP and holding
    const lossAmount = currentValue - holdValue;
    const percentage = holdValue !== 0 ? (lossAmount / holdValue) * 100 : 0;

    return {
      percentage,
      entryValue,
      currentValue,
      holdValue,
      lossAmount
    };
  }

  /**
   * Format and print position metrics in a readable format
   */
  printPositionMetrics(metrics: PositionMetrics): void {
    console.log('\n=== POSITION METRICS ===');
    
    console.log('\n📊 POSITION SIZE:');
    console.log(`  ${metrics.positionSize.token0Symbol}: ${metrics.positionSize.amount0.toFixed(6)}`);
    console.log(`  ${metrics.positionSize.token1Symbol}: ${metrics.positionSize.amount1.toFixed(6)}`);
    console.log(`  Total USD Value: $${metrics.positionSize.totalUSD.toFixed(2)}`);
    
    console.log('\n💰 IMPERMANENT LOSS:');
    console.log(`  Loss Percentage: ${metrics.impermanentLoss.percentage.toFixed(2)}%`);
    console.log(`  Entry Value: $${metrics.impermanentLoss.entryValue.toFixed(2)}`);
    console.log(`  Current Value: $${metrics.impermanentLoss.currentValue.toFixed(2)}`);
    console.log(`  Hold Value: $${metrics.impermanentLoss.holdValue.toFixed(2)}`);
    console.log(`  Loss Amount: $${metrics.impermanentLoss.lossAmount.toFixed(2)}`);
    
    console.log('\n📈 ENTRY DATA:');
    console.log(`  Average Entry Price ${metrics.positionSize.token0Symbol}: $${metrics.entryData.averageEntryPrice0.toFixed(6)}`);
    console.log(`  Average Entry Price ${metrics.positionSize.token1Symbol}: $${metrics.entryData.averageEntryPrice1.toFixed(6)}`);
    console.log(`  Total Deposited: $${metrics.entryData.totalDepositedUSD.toFixed(2)}`);
    console.log(`  Total Withdrawn: $${metrics.entryData.totalWithdrawnUSD.toFixed(2)}`);
    
    console.log('\n🎯 CURRENT DATA:');
    console.log(`  Current Price ${metrics.positionSize.token0Symbol}: $${metrics.currentData.currentPrice0.toFixed(6)}`);
    console.log(`  Current Price ${metrics.positionSize.token1Symbol}: $${metrics.currentData.currentPrice1.toFixed(6)}`);
    console.log(`  Position In Range: ${metrics.currentData.isInRange ? '✅ Yes' : '❌ No'}`);
    
    console.log('\n========================\n');
  }
}

// Export a default instance for convenience
export const calculateUserDataService = new CalculateUserDataService();

// Export the service class for inheritance/extending
export default CalculateUserDataService;

// Test execution when file is run directly
const testUser = "0x14da5eef615205f7d3ddf80f8a0752f7f7dfe4f6";
const testPool = "0x3258f413c7a88cda2fa8709a589d221a80f6574f63df5a5b6774485d8acc39d9";

console.log('Testing position metrics calculation...');
console.log(`User: ${testUser}`);
console.log(`Pool: ${testPool}`);
console.log('---');

calculateUserDataService.calculatePositionMetrics(testUser, testPool)
  .then(metrics => {
    console.log('✅ Successfully calculated position metrics!');
    calculateUserDataService.printPositionMetrics(metrics);
  })
  .catch(error => {
    console.error('❌ Error calculating metrics:', error.message);
  }); 