import { TrendingUp, TrendingDown, DollarSign, Calendar, Clock } from "lucide-react";
import { Position, HistoryMetrics } from "../../types";
import { useImpermanentLoss, useYield } from "@/hooks/usePositions";
import { formatCurrency, formatPercentage, formatNumber } from "@/lib/utils";

interface PositionCardProps {
  position?: Position;
  inchPosition?: HistoryMetrics;
  currentPrices?: { token0Price: number; token1Price: number };
}

export default function PositionCard({
  position,
  inchPosition,
  currentPrices,
}: PositionCardProps) {
  const { data: ilData, isLoading: ilLoading } = useImpermanentLoss(
    position,
    currentPrices || { token0Price: 3200, token1Price: 1 }
  );
  const { data: yieldData, isLoading: yieldLoading } = useYield(position);

  // If we have 1inch data, display it directly
  if (inchPosition) {
    const token0 = inchPosition.claimed_fees?.[0] || inchPosition.impermanent_loss?.[0];
    const token1 = inchPosition.claimed_fees?.[1] || inchPosition.impermanent_loss?.[1];
    
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {token0?.symbol || "ETH"}/{token1?.symbol || "USDC"} Position
            </h3>
            <p className="text-sm text-gray-500 font-mono">ID: {inchPosition.index.slice(0, 8)}...</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 font-medium">Holding Time</p>
            <p className="text-2xl font-bold text-blue-600">
              {inchPosition.holding_time_days || 0} days
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Profit/Loss */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              {inchPosition.profit_abs_usd && inchPosition.profit_abs_usd >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
              <h4 className="font-semibold text-gray-900 text-lg">Profit/Loss</h4>
            </div>

            <div>
              <p className={`text-3xl font-bold mb-2 ${
                inchPosition.profit_abs_usd && inchPosition.profit_abs_usd >= 0 
                  ? "text-green-600" 
                  : "text-red-600"
              }`}>
                {inchPosition.profit_abs_usd !== null 
                  ? formatCurrency(inchPosition.profit_abs_usd)
                  : "N/A"
                }
              </p>
              {inchPosition.roi !== null && (
                <p
                  className={`text-lg font-semibold ${
                    inchPosition.roi >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatPercentage(inchPosition.roi)}
                </p>
              )}
            </div>
          </div>

          {/* Fees Earned */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-gray-900 text-lg">Fees Earned</h4>
            </div>

            <div>
              <p className="text-3xl font-bold text-blue-600 mb-2">
                {inchPosition.claimed_fees_usd !== null 
                  ? formatCurrency(inchPosition.claimed_fees_usd)
                  : "N/A"
                }
              </p>
              {inchPosition.weighted_apr !== null && (
                <p className="text-lg font-semibold text-blue-600">
                  {formatNumber(inchPosition.weighted_apr * 100)}% APR
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Impermanent Loss */}
        {inchPosition.impermanent_loss_usd !== null && (
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 mb-6 border border-orange-200">
            <div className="flex items-center gap-3 mb-3">
              {inchPosition.impermanent_loss_usd >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
              <h4 className="font-semibold text-gray-900 text-lg">Impermanent Loss</h4>
            </div>

            <div>
              <p className={`text-3xl font-bold ${
                inchPosition.impermanent_loss_usd >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                {formatCurrency(inchPosition.impermanent_loss_usd)}
              </p>
            </div>
          </div>
        )}

        {/* Token Details */}
        {inchPosition.claimed_fees && inchPosition.claimed_fees.length > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-semibold text-gray-900 mb-4 text-lg">Claimed Fees</h4>
            <div className="space-y-3">
              {inchPosition.claimed_fees.map((token, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">{token.symbol || token.name}</span>
                    <span className="text-sm text-gray-600 font-mono">
                      {formatNumber(token.amount, 6)}
                    </span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {token.value_usd ? formatCurrency(token.value_usd) : "N/A"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Position Details */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-gray-500" />
            <h4 className="font-semibold text-gray-900 text-lg">Position Details</h4>
          </div>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 font-medium mb-1">Holding Time</p>
              <p className="font-bold text-gray-900 text-lg">
                {inchPosition.holding_time_days || 0} days
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 font-medium mb-1">APR</p>
              <p className="font-bold text-gray-900 text-lg">
                {inchPosition.weighted_apr !== null 
                  ? `${formatNumber(inchPosition.weighted_apr * 100)}%`
                  : "N/A"
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Original PositionCard logic for mock data
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            ETH/USDC Position
          </h3>
          <p className="text-sm text-gray-500 font-mono">ID: {position?.id}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 font-medium">Deposited</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(
              (parseFloat(position?.liquidity || "0") / 1e18) *
                (currentPrices?.token0Price || 3200)
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Impermanent Loss */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            {ilData?.impermanentLoss && ilData.impermanentLoss >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
            <h4 className="font-semibold text-gray-900 text-lg">Impermanent Loss</h4>
          </div>

          {ilLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : ilData ? (
            <div>
              <p className={`text-3xl font-bold mb-2 ${
                ilData.impermanentLoss >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                {formatCurrency(ilData.impermanentLoss)}
              </p>
              <p
                className={`text-lg font-semibold ${
                  ilData.impermanentLossPercentage >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatPercentage(ilData.impermanentLossPercentage)}
              </p>
            </div>
          ) : (
            <p className="text-gray-500">Unable to calculate</p>
          )}
        </div>

        {/* Yield Earned */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900 text-lg">Yield Earned</h4>
          </div>

          {yieldLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : yieldData ? (
            <div>
              <p className="text-3xl font-bold text-blue-600 mb-2">
                {formatCurrency(yieldData.totalFeesEarnedUSD)}
              </p>
              <p className="text-lg font-semibold text-blue-600">
                {formatNumber(yieldData.apr)}% APR
              </p>
            </div>
          ) : (
            <p className="text-gray-500">Unable to calculate</p>
          )}
        </div>
      </div>

      {/* Price Information */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-semibold text-gray-900 mb-4 text-lg">Price Information</h4>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 font-medium mb-1">Deposit Price (ETH)</p>
            <p className="font-bold text-gray-900 text-lg">
              {formatCurrency(position?.depositPrices.token0Price || 0)}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 font-medium mb-1">Current Price (ETH)</p>
            <p className="font-bold text-gray-900 text-lg">
              {formatCurrency(currentPrices?.token0Price || 3200)}
            </p>
          </div>
        </div>

        {ilData && (
          <div className="mt-4 grid grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 font-medium mb-1">ETH Price Change</p>
              <p
                className={`font-bold text-lg ${
                  ilData.token0Change >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatPercentage(ilData.token0Change)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 font-medium mb-1">USDC Price Change</p>
              <p
                className={`font-bold text-lg ${
                  ilData.token1Change >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatPercentage(ilData.token1Change)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Position Details */}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-gray-500" />
          <h4 className="font-semibold text-gray-900 text-lg">Position Details</h4>
        </div>
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 font-medium mb-1">Liquidity</p>
            <p className="font-bold text-gray-900 text-lg">
              {formatNumber(parseFloat(position?.liquidity || "0") / 1e18, 4)} ETH
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 font-medium mb-1">Deposited</p>
            <p className="font-bold text-gray-900 text-lg">
              {position?.depositedAt.toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
