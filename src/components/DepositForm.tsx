import { useState } from 'react'
import { Plus, DollarSign, ArrowRight, Info } from 'lucide-react'
import { usePoolInfo } from '@/hooks/usePositions'
import { formatCurrency, formatNumber } from '@/lib/utils'

const ETH_USDC_POOL_ADDRESS = '0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8'

export function DepositForm() {
  const [depositAmount, setDepositAmount] = useState('')
  const { data: poolInfo, isLoading } = usePoolInfo(ETH_USDC_POOL_ADDRESS)

  const handleDepositAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setDepositAmount(value)
    }
  }

  const calculateTokenAmounts = () => {
    if (!depositAmount || !poolInfo) return null

    const totalUSD = parseFloat(depositAmount)
    const ethPrice = poolInfo.token0Price
    const usdcPrice = poolInfo.token1Price

    // Calculate 50/50 split based on current prices
    const ethAmount = (totalUSD / 2) / ethPrice
    const usdcAmount = (totalUSD / 2) / usdcPrice

    return {
      ethAmount: ethAmount.toFixed(6),
      usdcAmount: usdcAmount.toFixed(2),
      ethAmountUSD: totalUSD / 2,
      usdcAmountUSD: totalUSD / 2,
      totalUSD,
      priceImpact: 0.01, // Mock price impact
    }
  }

  const tokenAmounts = calculateTokenAmounts()

  return (
    <div className="card animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <Plus className="w-5 h-5 text-primary-600" />
        <h2 className="text-xl font-semibold text-gray-900">Add Liquidity</h2>
      </div>

      <div className="space-y-6">
        {/* Pool Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pool
          </label>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                ETH
              </div>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                USDC
              </div>
            </div>
            <div>
              <p className="font-medium text-gray-900">ETH/USDC</p>
              <p className="text-sm text-gray-500">0.3% fee tier</p>
            </div>
          </div>
        </div>

        {/* Deposit Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount to Deposit (USD)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={depositAmount}
              onChange={handleDepositAmountChange}
              placeholder="0.00"
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Token Split Preview */}
        {tokenAmounts && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Token Split</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    ETH
                  </div>
                  <span className="text-sm text-gray-700">Ethereum</span>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{tokenAmounts.ethAmount} ETH</p>
                  <p className="text-sm text-gray-500">{formatCurrency(tokenAmounts.ethAmountUSD)}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    USDC
                  </div>
                  <span className="text-sm text-gray-700">USD Coin</span>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{tokenAmounts.usdcAmount} USDC</p>
                  <p className="text-sm text-gray-500">{formatCurrency(tokenAmounts.usdcAmountUSD)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pool Information */}
        {poolInfo && (
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Current Pool Information</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-blue-600">ETH Price:</span> {formatCurrency(poolInfo.token0Price)}
                  </div>
                  <div>
                    <span className="text-blue-600">USDC Price:</span> {formatCurrency(poolInfo.token1Price)}
                  </div>
                  <div>
                    <span className="text-blue-600">Total Liquidity:</span> {formatNumber(parseFloat(poolInfo.liquidity) / 1e18, 0)} ETH
                  </div>
                  <div>
                    <span className="text-blue-600">Price Impact:</span> {formatNumber(tokenAmounts?.priceImpact || 0, 3)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            disabled={!depositAmount || parseFloat(depositAmount) <= 0 || isLoading}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Liquidity
              </>
            )}
          </button>
        </div>

        {/* Disclaimer */}
        <div className="text-xs text-gray-500 text-center">
          By adding liquidity, you agree to the terms of service and acknowledge the risks of impermanent loss.
        </div>
      </div>
    </div>
  )
} 