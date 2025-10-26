import { useState, useEffect } from 'react'
import { getMarketByAddress, MarketCreated } from '@/lib/graphql-queries'
import { MarketInfo, Platform, MarketState, MarketStatus } from '@/lib/types'

export function useMarketGraphQL(marketAddress: string) {
  const [market, setMarket] = useState<MarketInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!marketAddress) {
      setError('Market address is required')
      setLoading(false)
      return
    }

    const fetchMarket = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🔍 GraphQL Hook: Fetching market by address:', marketAddress)
        
        // Get market from GraphQL
        const marketData = await getMarketByAddress(marketAddress)
        
        if (!marketData) {
          setError('Market not found')
          setLoading(false)
          return
        }
        
        console.log('🔍 GraphQL Hook: Raw market data:', marketData)
        
        // Transform GraphQL data to MarketInfo format
        const endTime = parseInt(marketData.params_3) || 0 // params_3 is endTime
        const createdAt = parseInt(marketData.params_1) || 0 // params_1 is createdAt
        const creatorFeeBps = parseInt(marketData.params_2) || 0 // params_2 is creatorFeeBps
        const identifier = marketData.params_0 || '' // params_0 is identifier
        
        // Parse metadata
        const question = marketData.metadata_0 || ''
        const description = marketData.metadata_1 || ''
        const category = marketData.metadata_2 || 'General'
        const resolutionSource = marketData.metadata_3 || ''
        const platform = parseInt(marketData.metadata_4) || Platform.Other
        const options = marketData.metadata_5 || []
        
        // Calculate time remaining
        const now = Date.now() / 1000
        const timeRemaining = Math.max(0, endTime - now)
        const isExpired = endTime > 0 && now > endTime
        
        const transformedMarket: MarketInfo = {
          address: marketData.market,
          identifier: identifier,
          creator: marketData.creator,
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
        
        setMarket(transformedMarket)
        console.log(`✅ GraphQL Hook: Loaded market data`)
        
      } catch (err) {
        console.error('❌ GraphQL Hook: Error fetching market:', err)
        
        // Set error and try fallback to API
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch market'
        setError(errorMessage)
        
        // Try fallback to API if GraphQL fails
        try {
          console.log('🔄 GraphQL Hook: Attempting fallback to API...')
          const response = await fetch(`/api/markets/${marketAddress}`)
          const data = await response.json()
          
          if (data.success && data.market) {
            console.log('✅ GraphQL Hook: Fallback to API successful')
            setMarket(data.market)
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

    fetchMarket()
  }, [marketAddress])

  return { market, loading, error }
}
