'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FolderOpen } from 'lucide-react'
import Link from 'next/link'
import { useWallet } from '@/hooks/use-wallet'
import { useMarketsByCreator } from '@/hooks/use-markets-by-creator'
import { MarketCard } from '@/components/markets/market-card'
import { MarketInfo, Platform } from '@/lib/types'

export default function MyMarketsPage() {
  const { address } = useWallet()
  const { markets, loading, error } = useMarketsByCreator(address)

  // Transform GraphQL data to MarketInfo format
  const transformToMarketInfo = (market: any): MarketInfo => {
    return {
      address: market.market,
      identifier: parseInt(market.params_0) || 0,
      creator: market.creator,
      options: market.metadata_5 || [],
      endTime: parseInt(market.params_1) || 0,
      creatorFeeBps: parseInt(market.params_3) || 0,
      totalLiquidity: '0', // Not available in GraphQL data
      isResolved: false, // Not available in GraphQL data
      winningOption: undefined,
      question: market.metadata_0 || '',
      description: market.metadata_1 || '',
      category: market.metadata_2 || 'General',
      resolutionSource: market.metadata_4 || '',
      platform: parseInt(market.metadata_3) || Platform.Other,
      postUrl: market.params_0 || '',
      createdAt: parseInt(market.params_1) || 0,
      minBet: 0, // Not available in GraphQL data
      maxBetPerUser: 0, // Not available in GraphQL data
      maxTotalStake: 0, // Not available in GraphQL data
      optionLiquidity: [], // Not available in GraphQL data
      state: 0, // Trading state
      status: 0, // Active status
      activeParticipantsCount: 0, // Not available in GraphQL data
    }
  }

  if (!address) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Markets</h1>
          <p className="text-muted-foreground">
            Markets created by your address
          </p>
        </div>

        <Card className="p-12 bg-card border-border text-center">
          <FolderOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Connect your wallet</h3>
          <p className="text-muted-foreground">
            Connect your wallet to view markets you've created
          </p>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Markets</h1>
          <p className="text-muted-foreground">
            Markets created by your address
          </p>
        </div>

        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-muted rounded w-16"></div>
                <div className="h-6 bg-muted rounded w-20"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Markets</h1>
          <p className="text-muted-foreground">
            Markets created by your address
          </p>
        </div>

        <Card className="p-12 bg-card border-border text-center">
          <FolderOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Error loading markets</h3>
          <p className="text-muted-foreground">{error}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {markets.length === 0 ? (
        <Card className="p-12 bg-card border-border text-center">
          <FolderOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No markets created yet</h3>
          <p className="text-muted-foreground mb-4">
            Markets you create will appear here
          </p>
          <Link href="/app/create">
            <Button>Create Your First Market</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {markets.map((market) => (
            <MarketCard
              key={market.id}
              market={transformToMarketInfo(market)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
