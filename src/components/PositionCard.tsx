import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react'
import { Position } from '@/types'
import { useImpermanentLoss, useYield } from '@/hooks/usePositions'
import { formatCurrency, formatPercentage, formatNumber } from '@/lib/utils'

interface PositionCardProps {
  position: Position
  currentPrices: { token0Price: number; token1Price: number }
}

export function PositionCard({ position, currentPrices }: PositionCardProps) {
  const { data: ilData, isLoading: ilLoading } = useImpermanentLoss(position, currentPrices)
  const { data: yieldData, isLoading: yieldLoading } = useYield(position)

  return (
    <div className="card animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">ETH/USDC Position</h3>
          <p className="text-sm text-gray-500">Position ID: {position.id}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Deposited</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(parseFloat(position.liquidity) / 1e18 * currentPrices.token0Price)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Impermanent Loss */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            {ilData?.impermanentLoss && ilData.impermanentLoss >= 0 ? (
              <TrendingUp className="w-4 h-4 text-success-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-danger-600" />
            )}
            <h4 className="font-medium text-gray-900">Impermanent Loss</h4>
          </div>
          
          {ilLoading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : ilData ? (
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(ilData.impermanentLoss)}
              </p>
              <p className={`text-sm ${ilData.impermanentLossPercentage >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                {formatPercentage(ilData.impermanentLossPercentage)}
              </p>
            </div>
          ) : (
            <p className="text-gray-500">Unable to calculate</p>
          )}
        </div>

        {/* Yield Earned */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-primary-600" />
            <h4 className="font-medium text-gray-900">Yield Earned</h4>
          </div>
          
          {yieldLoading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : yieldData ? (
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(yieldData.totalFeesEarnedUSD)}
              </p>
              <p className="text-sm text-success-600">
                {formatNumber(yieldData.apr)}% APR
              </p>
            </div>
          ) : (
            <p className="text-gray-500">Unable to calculate</p>
          )}
        </div>
      </div>

      {/* Price Information */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="font-medium text-gray-900 mb-3">Price Information</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Deposit Price (ETH)</p>
            <p className="font-medium text-gray-900">
              {formatCurrency(position.depositPrices.token0Price)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Current Price (ETH)</p>
            <p className="font-medium text-gray-900">
              {formatCurrency(currentPrices.token0Price)}
            </p>
          </div>
        </div>
        
        {ilData && (
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">ETH Price Change</p>
              <p className={`font-medium ${ilData.token0Change >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                {formatPercentage(ilData.token0Change)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">USDC Price Change</p>
              <p className={`font-medium ${ilData.token1Change >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                {formatPercentage(ilData.token1Change)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Position Details */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-gray-500" />
          <h4 className="font-medium text-gray-900">Position Details</h4>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Liquidity</p>
            <p className="font-medium text-gray-900">
              {formatNumber(parseFloat(position.liquidity) / 1e18, 4)} ETH
            </p>
          </div>
          <div>
            <p className="text-gray-500">Deposited</p>
            <p className="font-medium text-gray-900">
              {position.depositedAt.toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 