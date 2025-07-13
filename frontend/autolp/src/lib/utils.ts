import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number, decimals = 2): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatPercentage(value: number, decimals = 2): string {
  return `${value >= 0 ? "+" : ""}${formatNumber(value, decimals)}%`;
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function calculateImpermanentLoss(
  depositPrices: { token0Price: number; token1Price: number },
  currentPrices: { token0Price: number; token1Price: number },
  token0Amount: number,
  token1Amount: number
) {
  const depositValue =
    token0Amount * depositPrices.token0Price +
    token1Amount * depositPrices.token1Price;
  const currentValue =
    token0Amount * currentPrices.token0Price +
    token1Amount * currentPrices.token1Price;
  const impermanentLoss = currentValue - depositValue;
  const impermanentLossPercentage = (impermanentLoss / depositValue) * 100;

  return {
    depositValue,
    currentValue,
    impermanentLoss,
    impermanentLossPercentage,
    token0Change:
      ((currentPrices.token0Price - depositPrices.token0Price) /
        depositPrices.token0Price) *
      100,
    token1Change:
      ((currentPrices.token1Price - depositPrices.token1Price) /
        depositPrices.token1Price) *
      100,
  };
}

export function calculateYield(
  feesEarned: number,
  positionValue: number,
  daysSinceDeposit: number
) {
  const dailyYield = feesEarned / daysSinceDeposit;
  const apr = ((dailyYield * 365) / positionValue) * 100;

  return {
    totalFeesEarned: feesEarned,
    totalFeesEarnedUSD: feesEarned,
    apr,
    dailyYield,
  };
}
