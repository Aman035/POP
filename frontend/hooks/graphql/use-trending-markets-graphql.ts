import { useState, useEffect } from 'react'
import { getAllMarkets, MarketCreated } from '@/lib/graphql-queries'
import { Platform } from '@/lib/types'
import { resolvePlatformMetadata } from '@/lib/platform'

interface TrendingMarket {
  address: string
  question: string
  description: string
  category: string
  platform: Platform
  creator: string
  createdAt: number
  endTime: number
  status: number
  totalLiquidity: string
  activeParticipantsCount: number
  options: string[]
  isResolved: boolean
  timeRemaining: number
}

export function useTrendingMarketsGraphQL() {
  const [markets, setMarkets] = useState<TrendingMarket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrendingMarkets = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🔍 GraphQL Hook: Fetching trending markets from GraphQL...')
        
        // Get all markets from GraphQL
        const allMarkets = await getAllMarkets(10) // Limit to 10 for trending
        
        console.log('🔍 GraphQL Hook: Raw markets:', allMarkets)
        
        // Transform GraphQL data to TrendingMarket format
        const transformedMarkets: TrendingMarket[] = allMarkets.map((market: MarketCreated) => {
          const endTime = parseInt(market.params_3) || 0
          const now = Date.now() / 1000
          const timeRemaining = Math.max(0, endTime - now)
          
          return {
            address: market.market,
            question: market.metadata_0 || '',
            description: market.metadata_1 || '',
            category: market.metadata_2 || 'General',
            platform: resolvePlatformMetadata(market.metadata_3),
            creator: market.creator,
            createdAt: parseInt(market.params_1) || 0, // params_1 is createdAt
            endTime: endTime,
            status: 0, // Default to active, GraphQL doesn't have real-time status
            totalLiquidity: '0', // Not available in GraphQL data
            activeParticipantsCount: 0, // Not available in GraphQL data
            options: market.metadata_5 || [],
            isResolved: false, // Not available in GraphQL data
            timeRemaining: timeRemaining,
          }
        })
        
        // Sort by creation time (newest first) and take top 5
        const sortedMarkets = transformedMarkets
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 5)
        
        setMarkets(sortedMarkets)
        console.log(`✅ GraphQL Hook: Loaded ${sortedMarkets.length} trending markets`)
        
      } catch (err) {
        console.error('❌ GraphQL Hook: Error fetching trending markets:', err)
        
        // Set empty markets and show error, but don't crash the app
        setMarkets([])
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch trending markets'
        setError(errorMessage)
        
        // Try fallback to API if GraphQL fails
        try {
          console.log('🔄 GraphQL Hook: Attempting fallback to API...')
          const response = await fetch('/api/trending')
          const data = await response.json()
          
          if (data.success && data.markets) {
            console.log('✅ GraphQL Hook: Fallback to API successful')
            setMarkets(data.markets)
            setError(null)
          }
        } catch (fallbackErr) {
          console.error('❌ GraphQL Hook: API fallback also failed:', fallbackErr)
          // Keep the original error message
        }
      } finally {
        setLoading(false)
      }
    }

    fetchTrendingMarkets()
  }, [])

  return { markets, loading, error }
}
