import { useState, useEffect } from 'react'
import { getAllMarkets, MarketCreated } from '@/lib/graphql-queries'
import { MarketInfo, MarketState, MarketStatus } from '@/lib/types'
import { resolvePlatformMetadata } from '@/lib/platform'
import { useReadContracts } from 'wagmi'
import { MARKET_ABI } from '@/lib/contracts'
import { formatUnits } from 'viem'

export function useMarketsGraphQL() {
  const [markets, setMarkets] = useState<MarketInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [baseMarkets, setBaseMarkets] = useState<MarketInfo[]>([])

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
          const endTime = parseInt(market.params_3) || 0
          const createdAt = parseInt(market.params_1) || 0
          const creatorFeeBps = parseInt(market.params_2) || 0 // params_2 is creatorFeeBps
          const identifier = market.params_0 || '' // params_0 is identifier
          
          // Parse metadata
          const question = market.metadata_0 || ''
          const description = market.metadata_1 || ''
          const category = market.metadata_2 || 'General'
          const platform = resolvePlatformMetadata(market.metadata_3)
          const resolutionSource = market.metadata_4 || ''
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
        
        setBaseMarkets(sortedMarkets)
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

  // Create contract calls for liquidity data
  const contractCalls = baseMarkets.flatMap(market => {
    const calls: any[] = [
      { address: market.address as `0x${string}`, abi: MARKET_ABI, functionName: 'totalStaked' },
      { address: market.address as `0x${string}`, abi: MARKET_ABI, functionName: 'activeParticipantsCount' },
      { address: market.address as `0x${string}`, abi: MARKET_ABI, functionName: 'state' },
    ]
    
    // Add option liquidity calls for each option
    for (let i = 0; i < market.options.length; i++) {
      calls.push({
        address: market.address as `0x${string}`,
        abi: MARKET_ABI,
        functionName: 'optionLiquidity',
        args: [i]
      })
    }
    
    return calls
  })

  const { data: contractData, isLoading: contractLoading } = useReadContracts({
    contracts: contractCalls,
    query: { enabled: baseMarkets.length > 0 }
  })

  // Process contract data and update markets
  useEffect(() => {
    if (!contractData || baseMarkets.length === 0) return

    try {
      console.log('🔍 GraphQL Hook: Processing liquidity data for', baseMarkets.length, 'markets')
      
      const updatedMarkets = baseMarkets.map((market, marketIndex) => {
        const startIndex = marketIndex * (3 + market.options.length) // 3 base calls + option calls
        const marketResults = contractData.slice(startIndex, startIndex + 3 + market.options.length)
        
        const totalStaked = marketResults[0]?.result
        const activeParticipantsCount = marketResults[1]?.result
        const state = marketResults[2]?.result
        const optionLiquidityResults = marketResults.slice(3)
        
        const totalLiquidity = totalStaked ? formatUnits(totalStaked as bigint, 6) : "0"
        const optionLiquidity = optionLiquidityResults.map(result => 
          result?.result ? formatUnits(result.result as bigint, 6) : "0"
        )
        
        // Update market state and status based on contract data
        const marketState = Number(state || 0)
        const isResolved = marketState === 2 // Resolved state
        const isProposed = marketState === 1 // Proposed state
        const isTrading = marketState === 0 // Trading state
        
        return {
          ...market,
          totalLiquidity,
          optionLiquidity,
          activeParticipantsCount: Number(activeParticipantsCount || 0),
          state: marketState,
          isResolved,
          status: isResolved ? MarketStatus.Resolved : MarketStatus.Active
        }
      })

      setMarkets(updatedMarkets)
      console.log('✅ GraphQL Hook: Updated markets with real contract data:', updatedMarkets.map(m => ({
        address: m.address,
        question: m.question,
        totalLiquidity: m.totalLiquidity,
        state: m.state,
        activeParticipantsCount: m.activeParticipantsCount
      })))
      
    } catch (err) {
      console.error('❌ GraphQL Hook: Error processing liquidity data:', err)
    }
  }, [contractData, baseMarkets])

  return { markets, loading: loading || contractLoading, error }
}
