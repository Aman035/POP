import { useState, useEffect } from 'react'
import { getAllMarkets, MarketCreated } from '@/lib/graphql-queries'
import { MarketInfo, Platform, MarketState, MarketStatus } from '@/lib/types'

export function useMarketsGraphQL() {
  const [markets, setMarkets] = useState<MarketInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🔍 GraphQL Hook: Fetching all markets from GraphQL...')
        
        // Get all markets from GraphQL
        const allMarkets = await getAllMarkets()
        
        console.log('🔍 GraphQL Hook: Raw markets:', allMarkets)
        
        // Transform GraphQL data to MarketInfo format
        const transformedMarkets: MarketInfo[] = allMarkets.map((market: MarketCreated) => {
          const endTime = parseInt(market.params_3) || 0 // params_3 is endTime
          const createdAt = parseInt(market.params_1) || 0 // params_1 is createdAt
          const creatorFeeBps = parseInt(market.params_2) || 0 // params_2 is creatorFeeBps
          const identifier = market.params_0 || '' // params_0 is identifier
          
          // Parse metadata
          const question = market.metadata_0 || ''
          const description = market.metadata_1 || ''
          const category = market.metadata_2 || 'General'
          const resolutionSource = market.metadata_3 || ''
          const platform = parseInt(market.metadata_4) || Platform.Other
          const options = market.metadata_5 || []
          
          // Calculate time remaining
          const now = Date.now() / 1000
          const timeRemaining = Math.max(0, endTime - now)
          const isExpired = endTime > 0 && now > endTime
          
          return {
            address: market.market,
            identifier: identifier,
            creator: market.creator,
            options: options,
            endTime: endTime,
            creatorFeeBps: creatorFeeBps,
            totalLiquidity: '0', // Not available in GraphQL data, will be fetched separately
            isResolved: false, // Not available in GraphQL data, will be determined by contract state
            winningOption: undefined, // Not available in GraphQL data
            question: question,
            description: description,
            category: category,
            resolutionSource: resolutionSource,
            platform: platform,
            createdAt: createdAt,
            optionLiquidity: new Array(options.length).fill('0'), // Not available in GraphQL data
            state: MarketState.Trading, // Default to trading, will be updated by contract calls
            status: isExpired ? MarketStatus.Resolved : MarketStatus.Active, // Basic status based on time
            activeParticipantsCount: 0, // Not available in GraphQL data
          }
        })
        
        // Sort by creation time (newest first)
        const sortedMarkets = transformedMarkets.sort((a, b) => b.createdAt - a.createdAt)
        
        setMarkets(sortedMarkets)
        console.log(`✅ GraphQL Hook: Loaded ${sortedMarkets.length} markets`)
        
      } catch (err) {
        console.error('❌ GraphQL Hook: Error fetching markets:', err)
        
        // Set empty markets and show error, but don't crash the app
        setMarkets([])
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch markets'
        setError(errorMessage)
        
        // Try fallback to API if GraphQL fails
        try {
          console.log('🔄 GraphQL Hook: Attempting fallback to API...')
          const response = await fetch('/api/markets')
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

    fetchMarkets()
  }, [])

  return { markets, loading, error }
}
