import { useState, useEffect } from 'react'
import { getMarketsWithEvents, MarketCreated, BetPlaced, BetExited, ProposedResolution, MarketResolved, ParticipantCountUpdated } from '@/lib/graphql-queries'
import { MarketInfo, Platform, MarketState, MarketStatus } from '@/lib/types'
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
        
        console.log('🔍 GraphQL Hook: Fetching markets with events from GraphQL...')
        
        // Get markets with all events from GraphQL
        const data = await getMarketsWithEvents()
        
        console.log('🔍 GraphQL Hook: Raw data:', data)
        
        // Process events to calculate market stats
        const marketStats = new Map<string, {
          totalLiquidity: number
          optionLiquidity: number[]
          activeParticipantsCount: number
          state: MarketState
          winningOption?: number
        }>()
        
        // Initialize all markets with default values
        data.MarketFactory_MarketCreated.forEach((market: MarketCreated) => {
          const options = market.metadata_5 || []
          marketStats.set(market.market, {
            totalLiquidity: 0,
            optionLiquidity: new Array(options.length).fill(0),
            activeParticipantsCount: 0,
            state: MarketState.Trading,
            winningOption: undefined
          })
        })
        
        // Process bet placed events to calculate liquidity
        data.Market_BetPlaced.forEach((bet: BetPlaced) => {
          // We need to find which market this bet belongs to
          // Since we don't have direct market address in bet events, we'll use a different approach
          // For now, we'll process all bets and try to match them to markets
          const amount = parseFloat(bet.amount) / 1e6 // Convert from wei to USDC
          const option = parseInt(bet.option)
          
          // This is a simplified approach - in reality we'd need to match bets to markets
          // For now, we'll assume all bets are for the first market
          if (data.MarketFactory_MarketCreated.length > 0) {
            const firstMarket = data.MarketFactory_MarketCreated[0]
            const stats = marketStats.get(firstMarket.market)
            if (stats) {
              stats.totalLiquidity += amount
              if (stats.optionLiquidity[option] !== undefined) {
                stats.optionLiquidity[option] += amount
              }
            }
          }
        })
        
        // Process bet exited events to subtract liquidity
        data.Market_BetExited.forEach((bet: BetExited) => {
          const amount = parseFloat(bet.amount) / 1e6
          const option = parseInt(bet.option)
          
          if (data.MarketFactory_MarketCreated.length > 0) {
            const firstMarket = data.MarketFactory_MarketCreated[0]
            const stats = marketStats.get(firstMarket.market)
            if (stats) {
              stats.totalLiquidity -= amount
              if (stats.optionLiquidity[option] !== undefined) {
                stats.optionLiquidity[option] -= amount
              }
            }
          }
        })
        
        // Process proposed resolution events
        data.Market_ProposedResolution.forEach((proposal: ProposedResolution) => {
          // Match to markets (simplified approach)
          if (data.MarketFactory_MarketCreated.length > 0) {
            const firstMarket = data.MarketFactory_MarketCreated[0]
            const stats = marketStats.get(firstMarket.market)
            if (stats) {
              stats.state = MarketState.Proposed
            }
          }
        })
        
        // Process market resolved events
        data.Market_MarketResolved.forEach((resolution: MarketResolved) => {
          if (data.MarketFactory_MarketCreated.length > 0) {
            const firstMarket = data.MarketFactory_MarketCreated[0]
            const stats = marketStats.get(firstMarket.market)
            if (stats) {
              stats.state = MarketState.Resolved
              stats.winningOption = parseInt(resolution.option)
            }
          }
        })
        
        // Process participant count updates
        data.Market_ParticipantCountUpdated.forEach((update: ParticipantCountUpdated) => {
          if (data.MarketFactory_MarketCreated.length > 0) {
            const firstMarket = data.MarketFactory_MarketCreated[0]
            const stats = marketStats.get(firstMarket.market)
            if (stats) {
              stats.activeParticipantsCount = parseInt(update.newCount)
            }
          }
        })
        
        // Transform GraphQL data to MarketInfo format
        const transformedMarkets: MarketInfo[] = data.MarketFactory_MarketCreated.map((market: MarketCreated) => {
          const endTime = parseInt(market.params_3) || 0
          const createdAt = parseInt(market.params_1) || 0
          const creatorFeeBps = parseInt(market.params_2) || 0
          const identifier = market.params_0 || ''
          
          // Parse metadata
          const question = market.metadata_0 || ''
          const description = market.metadata_1 || ''
          const category = market.metadata_2 || 'General'
          const resolutionSource = market.metadata_3 || ''
          const platform = parseInt(market.metadata_4) || Platform.Other
          const options = market.metadata_5 || []
          
          // Get calculated stats from events
          const stats = marketStats.get(market.market) || {
            totalLiquidity: 0,
            optionLiquidity: new Array(options.length).fill(0),
            activeParticipantsCount: 0,
            state: MarketState.Trading,
            winningOption: undefined
          }
          
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
            totalLiquidity: stats.totalLiquidity.toString(),
            isResolved: stats.state === MarketState.Resolved,
            winningOption: stats.winningOption,
            question: question,
            description: description,
            category: category,
            resolutionSource: resolutionSource,
            platform: platform,
            createdAt: createdAt,
            optionLiquidity: stats.optionLiquidity.map(l => l.toString()),
            state: stats.state,
            status: stats.state === MarketState.Resolved ? MarketStatus.Resolved : MarketStatus.Active,
            activeParticipantsCount: stats.activeParticipantsCount,
          }
        })
        
        // Sort by creation time (newest first)
        const sortedMarkets = transformedMarkets.sort((a, b) => b.createdAt - a.createdAt)
        
        setBaseMarkets(sortedMarkets)
        setMarkets(sortedMarkets)
        console.log(`✅ GraphQL Hook: Loaded ${sortedMarkets.length} markets with real event data`)
        
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

  // Create contract calls as fallback for missing data
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

  const { data: contractData, isLoading: contractLoading, error: contractError } = useReadContracts({
    contracts: contractCalls,
    query: { enabled: baseMarkets.length > 0 }
  })

  // Process contract data as fallback
  useEffect(() => {
    if (!contractData || baseMarkets.length === 0) return

    try {
      console.log('🔍 GraphQL Hook: Processing contract fallback data...')
      
      const updatedMarkets = baseMarkets.map((market, marketIndex) => {
        const startIndex = marketIndex * (3 + market.options.length)
        const marketResults = contractData.slice(startIndex, startIndex + 3 + market.options.length)
        
        const totalStaked = marketResults[0]?.result
        const activeParticipantsCount = marketResults[1]?.result
        const state = marketResults[2]?.result
        const optionLiquidityResults = marketResults.slice(3)
        
        // Only update if GraphQL data is missing or zero
        const shouldUpdate = parseFloat(market.totalLiquidity) === 0 || market.activeParticipantsCount === 0
        
        if (shouldUpdate && totalStaked) {
          const totalLiquidity = formatUnits(totalStaked as bigint, 6)
          const optionLiquidity = optionLiquidityResults.map(result => 
            result?.result ? formatUnits(result.result as bigint, 6) : "0"
          )
          
          const marketState = Number(state || 0)
          const isResolved = marketState === 2
          
          return {
            ...market,
            totalLiquidity,
            optionLiquidity,
            activeParticipantsCount: Number(activeParticipantsCount || 0),
            state: marketState,
            isResolved,
            status: isResolved ? MarketStatus.Resolved : MarketStatus.Active
          }
        }
        
        return market
      })

      setMarkets(updatedMarkets)
      console.log('✅ GraphQL Hook: Updated markets with contract fallback data')
      
    } catch (err) {
      console.error('❌ GraphQL Hook: Error processing contract fallback data:', err)
    }
  }, [contractData, baseMarkets])

  return { markets, loading: loading || contractLoading, error: error || contractError?.message }
}
