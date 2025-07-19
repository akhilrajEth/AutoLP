import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import axios from "axios";

export type TokenPricesResponse = Record<string, string>;

interface Position {
  userPublicAddress: string;
  poolAddress: string;
  token0Address: string;
  token1Address: string;
  token0LiquidityAmount: number;
  token1LiquidityAmount: number;
  token0InitialPrice: number;
  token1InitialPrice: number;
  createdAt: string;
}

const SUPPORTED_NETWORK = "base";
const GECKOTERMINAL_BASE_URL = "https://api.geckoterminal.com/api/v2";

if (
  !process.env.AWS_REGION ||
  !process.env.AWS_ACCESS_KEY_ID ||
  !process.env.AWS_SECRET_ACCESS_KEY
) {
  console.error(
    "Missing AWS environment variables. Please set AWS_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY in your .env.local file."
  );
}

const client = new DynamoDBClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const docClient = DynamoDBDocumentClient.from(client);

/**
 * Fetches token prices from the GeckoTerminal API.
 * @param addresses An array of token addresses.
 * @returns A promise that resolves to a record of token prices.
 */
async function getTokenPrices(
  addresses: string[]
): Promise<TokenPricesResponse> {
  if (!GECKOTERMINAL_BASE_URL) {
    throw new Error("GECKOTERMINAL_BASE_URL is not configured.");
  }
  try {
    const endpoint = `/simple/networks/${SUPPORTED_NETWORK}/token_price/${addresses.join(
      ","
    )}`;
    const url = `${GECKOTERMINAL_BASE_URL}${endpoint}`;

    const response = await axios.get(url);

    console.log(
      "GeckoTerminal RESPONSE DATA:",
      response.data.data.attributes.token_prices
    );
    return response.data.data.attributes.token_prices;
  } catch (error) {
    console.error("Error fetching token prices from GeckoTerminal:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(
        `GeckoTerminal API error: ${error.response?.status} - ${
          error.response?.data?.message || error.message
        }`
      );
    }
    throw error;
  }
}

/**
 * Puts a position item into the DynamoDB 'positions' table.
 * @param position The position object to put.
 * @returns A promise that resolves when the operation is complete.
 */
async function putPosition(position: Position): Promise<void> {
  const params = {
    TableName: "positions",
    Item: position,
  };

  try {
    const command = new PutCommand(params);
    await docClient.send(command);
    console.log(
      "Position added successfully to DynamoDB:",
      position.poolAddress
    );
  } catch (error) {
    console.error("Error adding position to DynamoDB:", error);
    throw error;
  }
}

/**
 * Orchestrates fetching initial prices and adding an active position to DynamoDB.
 * @param userPublicAddress The public address of the user.
 * @param poolAddress The address of the liquidity pool.
 * @param token0Address The address of token 0.
 * @param token1Address The address of token 1.
 * @param token0LiquidityAmount The liquidity amount for token 0 (as string).
 * @param token1LiquidityAmount The liquidity amount for token 1 (as string).
 * @returns A promise that resolves when the position is added.
 */
async function addActivePositionInDynamo(
  userPublicAddress: string,
  poolAddress: string,
  token0Address: string,
  token1Address: string,
  token0LiquidityAmount: string,
  token1LiquidityAmount: string
): Promise<void> {
  const token0LiquidityAmountNumber = parseFloat(token0LiquidityAmount);
  const token1LiquidityAmountNumber = parseFloat(token1LiquidityAmount);

  if (
    isNaN(token0LiquidityAmountNumber) ||
    isNaN(token1LiquidityAmountNumber)
  ) {
    throw new Error(
      "Invalid liquidity amounts provided. Must be valid numbers."
    );
  }

  const lowercaseToken0Address = token0Address.toLowerCase();
  const lowercaseToken1Address = token1Address.toLowerCase();

  const addresses = [token0Address, token1Address];

  try {
    const prices = await getTokenPrices(addresses);

    if (!prices[lowercaseToken0Address] || !prices[lowercaseToken1Address]) {
      throw new Error(
        `Could not get prices for one or both tokens. Received: ${JSON.stringify(
          prices
        )}`
      );
    }

    const token0InitialPrice = parseFloat(prices[lowercaseToken0Address]);
    const token1InitialPrice = parseFloat(prices[lowercaseToken1Address]);

    if (isNaN(token0InitialPrice) || isNaN(token1InitialPrice)) {
      throw new Error("Initial prices from GeckoTerminal are invalid.");
    }

    console.log("Fetched Initial TOKEN 0 PRICE:", token0InitialPrice);
    console.log("Fetched Initial TOKEN 1 PRICE:", token1InitialPrice);

    const position: Position = {
      userPublicAddress,
      poolAddress,
      token0Address,
      token1Address,
      token0LiquidityAmount: token0LiquidityAmountNumber,
      token1LiquidityAmount: token1LiquidityAmountNumber,
      token0InitialPrice,
      token1InitialPrice,
      createdAt: new Date().toISOString(),
    };

    await putPosition(position);
  } catch (error) {
    console.error("Error in addActivePositionInDynamo:", error);
    throw error;
  }
}

/**
 * Fetches all positions for a given user from DynamoDB.
 * @param userPublicAddress The public address of the user.
 * @returns A promise that resolves to an array of Position objects.
 */
async function getPositionByUserPublicAddress(
  userPublicAddress: string
): Promise<Position[]> {
  const params = {
    TableName: "positions",
    KeyConditionExpression: "#userPublicAddress = :userPublicAddress",
    ExpressionAttributeNames: {
      "#userPublicAddress": "userPublicAddress", // Attribute name for partition key
    },
    ExpressionAttributeValues: {
      ":userPublicAddress": userPublicAddress, // Value for the partition key
    },
  };

  try {
    const command = new QueryCommand(params);
    const response = await docClient.send(command);

    console.log("Query Results:", response.Items);

    return (response.Items as Position[]) || [];
  } catch (error) {
    console.error("Error fetching positions for user:", error);
    throw error;
  }
}

/**
 * POST handler for /api/positions
 * Adds a new active liquidity position to DynamoDB after fetching initial token prices.
 *
 * Expects a JSON body with the following parameters:
 * {
 * "userPublicAddress": string,
 * "poolAddress": string,
 * "token0Address": string,
 * "token1Address": string,
 * "token0LiquidityAmount": string, // String to parse later
 * "token1LiquidityAmount": string, // String to parse later
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      userPublicAddress,
      poolAddress,
      token0Address,
      token1Address,
      token0LiquidityAmount,
      token1LiquidityAmount,
    } = body;

    if (
      !userPublicAddress ||
      !poolAddress ||
      !token0Address ||
      !token1Address ||
      !token0LiquidityAmount ||
      !token1LiquidityAmount
    ) {
      return NextResponse.json(
        { error: "Missing one or more required fields.", received: body },
        { status: 400 }
      );
    }

    await addActivePositionInDynamo(
      userPublicAddress,
      poolAddress,
      token0Address,
      token1Address,
      token0LiquidityAmount,
      token1LiquidityAmount
    );

    return NextResponse.json(
      { message: "LP position added successfully!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("API POST /api/positions error:", error);
    return NextResponse.json(
      {
        error: "Failed to add liquidity position",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler for /api/positions
 * Fetches all positions for a given user from DynamoDB.
 * Expects 'userPublicAddress' as a query parameter.
 * Example: GET /api/positions?userPublicAddress=0xabcdef123...
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userPublicAddress = searchParams.get("userPublicAddress");

    if (!userPublicAddress) {
      return NextResponse.json(
        { error: 'Missing "userPublicAddress" query parameter.' },
        { status: 400 }
      );
    }

    const positions = await getPositionByUserPublicAddress(userPublicAddress);

    return NextResponse.json(positions, { status: 200 });
  } catch (error) {
    console.error("API GET /api/positions error:", error);
    return NextResponse.json(
      {
        error: "Failed to retrieve liquidity positions",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
