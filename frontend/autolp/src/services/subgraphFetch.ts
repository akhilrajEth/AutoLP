import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// Enhanced types for comprehensive data fetching
export interface Token {
  id: string;
  symbol: string;
  name: string;
  decimals: string;
  derivedETH: string;
  totalValueLocked: string;
  totalValueLockedUSD: string;
  volume: string;
  volumeUSD: string;
  feesUSD: string;
}

export interface Pool {
  id: string;
  hooks: string;
  tick: string;
  feeTier: string;
  liquidity: string;
  liquidityProviderCount: string;
  feesUSD: string;
  token0: Token;
  token1: Token;
  token0Price: string;
  token1Price: string;
  totalValueLockedToken0: string;
  totalValueLockedToken1: string;
  totalValueLockedUSD: string;
  totalValueLockedETH: string;
  volumeToken0: string;
  volumeToken1: string;
  volumeUSD: string;
  txCount: string;
  createdAtTimestamp: string;
  createdAtBlockNumber: string;
}

export interface Transaction {
  id: string;
  timestamp: string;
  blockNumber: string;
  gasUsed: string;
  gasPrice: string;
}

export interface ModifyLiquidity {
  id: string;
  amount0: string;
  amountUSD: string;
  amount1: string;
  origin: string;
  pool: Pool;
  amount: string;
  timestamp: string;
  transaction: Transaction;
  tickLower: string;
  tickUpper: string;
  logIndex: string;
}

export interface Position {
  id: string;
  tokenId: string;
  owner: string;
  origin: string;
  createdAtTimestamp: string;
  subscriptions: Subscribe[];
  unsubscriptions: Unsubscribe[];
  transfers: Transfer[];
}

export interface Subscribe {
  id: string;
  tokenId: string;
  address: string;
  timestamp: string;
  origin: string;
}

export interface Unsubscribe {
  id: string;
  tokenId: string;
  address: string;
  timestamp: string;
  origin: string;
}

export interface Transfer {
  id: string;
  tokenId: string;
  from: string;
  to: string;
  timestamp: string;
  origin: string;
}

export interface Swap {
  id: string;
  amount0: string;
  amount1: string;
  amountUSD: string;
  origin: string;
  pool: Pool;
  timestamp: string;
  transaction: Transaction;
  sqrtPriceX96: string;
  tick: string;
}

export interface SubgraphResponse {
  data: {
    modifyLiquidities: ModifyLiquidity[];
  };
}

export interface PoolResponse {
  data: {
    pool: Pool;
  };
}

export interface PositionsResponse {
  data: {
    positions: Position[];
  };
}

export interface SwapsResponse {
  data: {
    swaps: Swap[];
  };
}

export interface TokenResponse {
  data: {
    token: Token;
  };
}

export interface BundleResponse {
  data: {
    bundle: {
      id: string;
      ethPriceUSD: string;
    };
  };
}

// Configuration
const SUBGRAPH_URL = 'https://gateway.thegraph.com/api/subgraphs/id/EoCvJ5tyMLMJcTnLQwWpjAtPdn74PcrZgzfcT5bYxNBH';
const SUBGRAPH_API_KEY = process.env.SUBGRAPH_API_KEY;

if (!SUBGRAPH_API_KEY) {
  throw new Error('Missing SUBGRAPH_API_KEY in environment variables.');
}

export class SubgraphFetchService {
  private subgraphUrl: string;
  private apiKey: string;

  constructor(subgraphUrl: string = SUBGRAPH_URL, apiKey: string = SUBGRAPH_API_KEY!) {
    this.subgraphUrl = subgraphUrl;
    this.apiKey = apiKey;
  }

  /**
   * Fetch user liquidity modifications from the subgraph
   * @param origin - The user's address
   * @param pool - The pool address
   * @returns Promise<ModifyLiquidity[]>
   */
  async fetchUserData(origin: string, pool: string): Promise<ModifyLiquidity[]> {
    try {
      const query = `
        query {
          modifyLiquidities(
            where: {origin: "${origin}", pool: "${pool}"}
            orderBy: timestamp
            orderDirection: desc
          ) {
            id
            amount0
            amountUSD
            amount1
            origin
            pool {
              id
              hooks
              tick
              feeTier
              liquidity
              liquidityProviderCount
              feesUSD
              token0 {
                id
                symbol
                name
                decimals
                derivedETH
                totalValueLocked
                totalValueLockedUSD
                volume
                volumeUSD
                feesUSD
              }
              token1 {
                id
                symbol
                name
                decimals
                derivedETH
                totalValueLocked
                totalValueLockedUSD
                volume
                volumeUSD
                feesUSD
              }
              token0Price
              token1Price
              totalValueLockedToken0
              totalValueLockedToken1
              totalValueLockedUSD
              totalValueLockedETH
              volumeToken0
              volumeToken1
              volumeUSD
              txCount
              createdAtTimestamp
              createdAtBlockNumber
            }
            amount
            timestamp
            transaction {
              id
              timestamp
              blockNumber
              gasUsed
              gasPrice
            }
            tickLower
            tickUpper
            logIndex
          }
        }
      `;

      const response = await axios.post<SubgraphResponse>(
        this.subgraphUrl,
        { query },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      return response.data.data.modifyLiquidities;
    } catch (error) {
      console.error('Error fetching data from subgraph:', error);
      throw new Error(`Failed to fetch user data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch current pool state for calculations
   * @param poolId - The pool address
   * @returns Promise<Pool>
   */
  async fetchCurrentPoolState(poolId: string): Promise<Pool> {
    try {
      const query = `
        query {
          pool(id: "${poolId}") {
            id
            hooks
            tick
            feeTier
            liquidity
            liquidityProviderCount
            feesUSD
            token0 {
              id
              symbol
              name
              decimals
              derivedETH
              totalValueLocked
              totalValueLockedUSD
              volume
              volumeUSD
              feesUSD
            }
            token1 {
              id
              symbol
              name
              decimals
              derivedETH
              totalValueLocked
              totalValueLockedUSD
              volume
              volumeUSD
              feesUSD
            }
            token0Price
            token1Price
            totalValueLockedToken0
            totalValueLockedToken1
            totalValueLockedUSD
            totalValueLockedETH
            volumeToken0
            volumeToken1
            volumeUSD
            txCount
            createdAtTimestamp
            createdAtBlockNumber
          }
        }
      `;

      const response = await axios.post<PoolResponse>(
        this.subgraphUrl,
        { query },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      return response.data.data.pool;
    } catch (error) {
      console.error('Error fetching pool state:', error);
      throw new Error(`Failed to fetch pool state: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch all user positions across all pools
   * @param origin - The user's address
   * @returns Promise<ModifyLiquidity[]>
   */
  async fetchAllUserPositions(origin: string): Promise<ModifyLiquidity[]> {
    try {
      const query = `
        query {
          modifyLiquidities(
            where: {origin: "${origin}"}
            orderBy: timestamp
            orderDirection: desc
          ) {
            id
            amount0
            amountUSD
            amount1
            origin
            pool {
              id
              hooks
              tick
              feeTier
              liquidity
              liquidityProviderCount
              feesUSD
              token0 {
                id
                symbol
                name
                decimals
                derivedETH
                totalValueLocked
                totalValueLockedUSD
                volume
                volumeUSD
                feesUSD
              }
              token1 {
                id
                symbol
                name
                decimals
                derivedETH
                totalValueLocked
                totalValueLockedUSD
                volume
                volumeUSD
                feesUSD
              }
              token0Price
              token1Price
              totalValueLockedToken0
              totalValueLockedToken1
              totalValueLockedUSD
              totalValueLockedETH
              volumeToken0
              volumeToken1
              volumeUSD
              txCount
              createdAtTimestamp
              createdAtBlockNumber
            }
            amount
            timestamp
            transaction {
              id
              timestamp
              blockNumber
              gasUsed
              gasPrice
            }
            tickLower
            tickUpper
            logIndex
          }
        }
      `;

      const response = await axios.post<SubgraphResponse>(
        this.subgraphUrl,
        { query },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      return response.data.data.modifyLiquidities;
    } catch (error) {
      console.error('Error fetching all user positions:', error);
      throw new Error(`Failed to fetch user positions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch user's NFT positions
   * @param owner - The user's address
   * @returns Promise<Position[]>
   */
  async fetchUserPositions(owner: string): Promise<Position[]> {
    try {
      const query = `
        query {
          positions(
            where: {owner: "${owner}"}
            orderBy: createdAtTimestamp
            orderDirection: desc
          ) {
            id
            tokenId
            owner
            origin
            createdAtTimestamp
            subscriptions {
              id
              tokenId
              address
              timestamp
              origin
            }
            unsubscriptions {
              id
              tokenId
              address
              timestamp
              origin
            }
            transfers {
              id
              tokenId
              from
              to
              timestamp
              origin
            }
          }
        }
      `;

      const response = await axios.post<PositionsResponse>(
        this.subgraphUrl,
        { query },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      return response.data.data.positions;
    } catch (error) {
      console.error('Error fetching user positions:', error);
      throw new Error(`Failed to fetch user positions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch user's swap history
   * @param origin - The user's address
   * @param pool - Optional pool address to filter by
   * @returns Promise<Swap[]>
   */
  async fetchUserSwaps(origin: string, pool?: string): Promise<Swap[]> {
    try {
      const poolFilter = pool ? `, pool: "${pool}"` : '';
      const query = `
        query {
          swaps(
            where: {origin: "${origin}"${poolFilter}}
            orderBy: timestamp
            orderDirection: desc
          ) {
            id
            amount0
            amount1
            amountUSD
            origin
            pool {
              id
              token0 {
                id
                symbol
                name
                decimals
                derivedETH
              }
              token1 {
                id
                symbol
                name
                decimals
                derivedETH
              }
              token0Price
              token1Price
              feeTier
            }
            timestamp
            transaction {
              id
              timestamp
              blockNumber
              gasUsed
              gasPrice
            }
            sqrtPriceX96
            tick
          }
        }
      `;

      const response = await axios.post<SwapsResponse>(
        this.subgraphUrl,
        { query },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      return response.data.data.swaps;
    } catch (error) {
      console.error('Error fetching user swaps:', error);
      throw new Error(`Failed to fetch user swaps: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch token details
   * @param tokenAddress - The token address
   * @returns Promise<Token>
   */
  async fetchToken(tokenAddress: string): Promise<Token> {
    try {
      const query = `
        query {
          token(id: "${tokenAddress}") {
            id
            symbol
            name
            decimals
            derivedETH
            totalValueLocked
            totalValueLockedUSD
            volume
            volumeUSD
            feesUSD
          }
        }
      `;

      const response = await axios.post<TokenResponse>(
        this.subgraphUrl,
        { query },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      return response.data.data.token;
    } catch (error) {
      console.error('Error fetching token:', error);
      throw new Error(`Failed to fetch token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch current ETH price in USD
   * @returns Promise<string>
   */
  async fetchEthPrice(): Promise<string> {
    try {
      const query = `
        query {
          bundle(id: "1") {
            id
            ethPriceUSD
          }
        }
      `;

      const response = await axios.post<BundleResponse>(
        this.subgraphUrl,
        { query },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      return response.data.data.bundle.ethPriceUSD;
    } catch (error) {
      console.error('Error fetching ETH price:', error);
      throw new Error(`Failed to fetch ETH price: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch pool day data for historical analysis
   * @param poolId - The pool address
   * @param days - Number of days to fetch
   * @returns Promise<any[]>
   */
  async fetchPoolDayData(poolId: string, days: number = 30): Promise<any[]> {
    try {
      const query = `
        query {
          poolDayDatas(
            where: {pool: "${poolId}"}
            orderBy: date
            orderDirection: desc
            first: ${days}
          ) {
            id
            date
            pool {
              id
            }
            liquidity
            sqrtPrice
            token0Price
            token1Price
            tick
            tvlUSD
            volumeToken0
            volumeToken1
            volumeUSD
            feesUSD
            txCount
            open
            high
            low
            close
          }
        }
      `;

      const response = await axios.post(
        this.subgraphUrl,
        { query },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      return response.data.data.poolDayDatas;
    } catch (error) {
      console.error('Error fetching pool day data:', error);
      throw new Error(`Failed to fetch pool day data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch token day data for historical analysis
   * @param tokenAddress - The token address
   * @param days - Number of days to fetch
   * @returns Promise<any[]>
   */
  async fetchTokenDayData(tokenAddress: string, days: number = 30): Promise<any[]> {
    try {
      const query = `
        query {
          tokenDayDatas(
            where: {token: "${tokenAddress}"}
            orderBy: date
            orderDirection: desc
            first: ${days}
          ) {
            id
            date
            token {
              id
              symbol
            }
            volume
            volumeUSD
            totalValueLocked
            totalValueLockedUSD
            priceUSD
            feesUSD
            open
            high
            low
            close
          }
        }
      `;

      const response = await axios.post(
        this.subgraphUrl,
        { query },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      return response.data.data.tokenDayDatas;
    } catch (error) {
      console.error('Error fetching token day data:', error);
      throw new Error(`Failed to fetch token day data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export a default instance for convenience
export const subgraphService = new SubgraphFetchService();

// Export the service class for inheritance/extending
export default SubgraphFetchService;

// Test execution when file is run directly
const testUser = "0x14da5eef615205f7d3ddf80f8a0752f7f7dfe4f6";
const testPool = "0x3258f413c7a88cda2fa8709a589d221a80f6574f63df5a5b6774485d8acc39d9";

console.log('Fetching user data from subgraph...');
console.log(`User: ${testUser}`);
console.log(`Pool: ${testPool}`);
console.log('---');

subgraphService.fetchUserData(testUser, testPool)
  .then(data => {
    console.log('Success! Found', data.length, 'liquidity modifications');
    console.log('\nResults:');
    console.log(JSON.stringify(data, null, 2));
  })
  .catch(error => {
    console.error('Error:', error.message);
  });