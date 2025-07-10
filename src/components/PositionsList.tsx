import { usePrivy } from '@privy-io/react-auth'
import { Wallet, AlertCircle } from 'lucide-react'
import { usePositions, usePoolInfo } from '@/hooks/usePositions'
import { PositionCard } from './PositionCard'

export function PositionsList() {
  const { authenticated, ready } = usePrivy()
  const { data: positions, isLoading, error } = usePositions()
  const { data: poolInfo } = usePoolInfo('0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8')

  if (!ready) {
    return (
      <div className="card text-center py-12">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="card text-center py-12">
        <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
        <p className="text-gray-500 mb-6">
          Connect your wallet to view your liquidity pool positions and track impermanent loss.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="w-12 h-12 text-danger-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Positions</h3>
        <p className="text-gray-500">
          There was an error loading your positions. Please try again.
        </p>
      </div>
    )
  }

  if (!positions || positions.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Positions Found</h3>
        <p className="text-gray-500 mb-6">
          You don't have any liquidity pool positions yet. Add liquidity to get started.
        </p>
        <a
          href="#deposit"
          className="btn-primary inline-flex items-center gap-2"
        >
          Add Liquidity
        </a>
      </div>
    )
  }

  const currentPrices = poolInfo ? {
    token0Price: poolInfo.token0Price,
    token1Price: poolInfo.token1Price,
  } : { token0Price: 3200, token1Price: 1 }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Positions</h2>
          <p className="text-gray-500">Manage your liquidity pool positions and track performance</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total Positions</p>
          <p className="text-2xl font-bold text-gray-900">{positions.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {positions.map((position) => (
          <PositionCard
            key={position.id}
            position={position}
            currentPrices={currentPrices}
          />
        ))}
      </div>
    </div>
  )
} 