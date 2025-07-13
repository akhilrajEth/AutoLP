import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// Types for the subgraph response
export interface Pool {
  hooks: string;
  tick: string;
  feeTier: string;
  liquidity: string;
  liquidityProviderCount: string;
  feesUSD: string;
}

export interface Transaction {
  id: string;
}

export interface ModifyLiquidity {
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
}

export interface SubgraphResponse {
  data: {
    modifyLiquidities: ModifyLiquidity[];
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
            amount0
            amountUSD
            amount1
            origin
            pool {
              hooks
              tick
              feeTier
              liquidity
              liquidityProviderCount
              feesUSD
            }
            amount
            timestamp
            transaction {
              id
            }
            tickLower
            tickUpper
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

      // Debug: print the full response
      console.log('Full subgraph response:', JSON.stringify(response.data, null, 2));

      return response.data.data.modifyLiquidities;
    } catch (error) {
      console.error('Error fetching data from subgraph:', error);
      throw new Error(`Failed to fetch user data: ${error instanceof Error ? error.message : 'Unknown error'}`);
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