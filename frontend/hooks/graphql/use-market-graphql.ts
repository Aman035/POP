import { useState, useEffect, useCallback, useMemo } from 'react'
import { getMarketByAddress, MarketCreated } from '@/lib/graphql-queries'
import { MarketInfo, MarketState, MarketStatus } from '@/lib/types'
import { resolvePlatformMetadata } from '@/lib/platform'
import { useReadContracts } from 'wagmi'
import { MARKET_ABI } from '@/lib/contracts'
import { formatUnits } from 'viem'
import { useGraphQLWithFallback } from './use-stable-graphql'

export function useMarketGraphQL(marketAddress: string) {
  const [market, setMarket] = useState<MarketInfo | null>(null)
  
  // Contract-based fallback for when GraphQL fails
  const contractContracts = useMemo(() => marketAddress ? [
    { address: marketAddress as `0x${string}`, abi: MARKET_ABI, functionName: 'question' as const },
    { address: marketAddress as `0x${string}`, abi: MARKET_ABI, functionName: 'description' as const },
    { address: marketAddress as `0x${string}`, abi: MARKET_ABI, functionName: 'category' as const },
    { address: marketAddress as `0x${string}`, abi: MARKET_ABI, functionName: 'platform' as const },
    { address: marketAddress as `0x${string}`, abi: MARKET_ABI, functionName: 'identifier' as const },
    { address: marketAddress as `0x${string}`, abi: MARKET_ABI, functionName: 'createdAt' as const },
    { address: marketAddress as `0x${string}`, abi: MARKET_ABI, functionName: 'endTime' as const },
    { address: marketAddress as `0x${string}`, abi: MARKET_ABI, functionName: 'creator' as const },
    { address: marketAddress as `0x${string}`, abi: MARKET_ABI, functionName: 'creatorFeeBps' as const },
    { address: marketAddress as `0x${string}`, abi: MARKET_ABI, functionName: 'state' as const },
    { address: marketAddress as `0x${string}`, abi: MARKET_ABI, functionName: 'getOptionCount' as const },
    { address: marketAddress as `0x${string}`, abi: MARKET_ABI, functionName: 'totalStaked' as const },
    { address: marketAddress as `0x${string}`, abi: MARKET_ABI, functionName: 'activeParticipantsCount' as const },
  ] : [], [marketAddress])

  const { data: contractData, isLoading: contractLoading, error: contractError } = useReadContracts({
    contracts: contractContracts,
    query: { enabled: !!marketAddress }
  })

  // Stable query function for GraphQL
  const queryFn = useCallback(async () => {
    if (!marketAddress) {
      throw new Error('Market address is required')
    }
    
    console.log('🔍 GraphQL Hook: Fetching market by address:', marketAddress)
    const marketData = await getMarketByAddress(marketAddress)
    
    if (!marketData) {
      throw new Error('Market not found')
    }
    
    console.log('🔍 GraphQL Hook: Raw market data:', marketData)
    
    // Transform GraphQL data to MarketInfo format
    const endTime = parseInt(marketData.params_3) || 0
    const createdAt = parseInt(marketData.params_1) || 0
    const creatorFeeBps = parseInt(marketData.params_2) || 0 // params_2 is creatorFeeBps
    const identifier = marketData.params_0 || '' // params_0 is identifier
    
    // Parse metadata
    const question = marketData.metadata_0 || ''
    const description = marketData.metadata_1 || ''
    const category = marketData.metadata_2 || 'General'
    const platform = resolvePlatformMetadata(marketData.metadata_3)
    const resolutionSource = marketData.metadata_4 || ''
    const options = marketData.metadata_5 || []
    
    console.log('🔍 GraphQL Hook: Parsed data:', {
      question,
      description,
      category,
      options,
      endTime,
      createdAt,
      creatorFeeBps
    })
    
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
    
    console.log('🔍 GraphQL Hook: Transformed market:', transformedMarket)
    return transformedMarket
  }, [marketAddress])

  // Fallback function for API
  const fallbackFn = useCallback(async () => {
    if (!marketAddress) {
      throw new Error('Market address is required')
    }
    
    console.log('🔄 GraphQL Hook: Attempting API fallback...')
    const response = await fetch(`/api/markets/${marketAddress}`)
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.success || !data.market) {
      throw new Error('API fallback failed')
    }
    
    console.log('✅ GraphQL Hook: API fallback successful')
    return data.market
  }, [marketAddress])

  // Use stable GraphQL hook with max depth protection and auto-refresh
  const { data: graphqlData, loading: graphqlLoading, error: graphqlError, refetch } = useGraphQLWithFallback(
    queryFn,
    fallbackFn,
    {
      dependencies: [marketAddress],
      enabled: !!marketAddress,
      retryCount: 3,
      retryDelay: 1000,
      maxDepth: 5, // Prevent infinite loops
      autoRefresh: true, // Enable auto-refresh for market data
      refreshInterval: 120000, // Refresh every 2 minutes
      onSuccess: (data: MarketInfo) => {
        console.log('✅ GraphQL Hook: Loaded market data')
        setMarket(data)
      },
      onError: (error: Error) => {
        console.error('❌ GraphQL Hook: Error fetching market:', error)
      },
      onRetry: (attempt: number, error: Error) => {
        console.log(`🔄 GraphQL Hook: Retry attempt ${attempt}, error: ${error.message}`)
      }
    }
  )

  // Update market when graphqlData changes
  useEffect(() => {
    if (graphqlData) {
      console.log('🔄 Market GraphQL Hook: Updating market with GraphQL data:', graphqlData)
      setMarket(graphqlData)
    } else {
      console.log('🔄 Market GraphQL Hook: No GraphQL data available')
    }
  }, [graphqlData])

  // Fetch liquidity data from contracts after market is loaded
  const liquidityContracts = useMemo(() => market ? [
    { address: marketAddress as `0x${string}`, abi: MARKET_ABI, functionName: 'totalStaked' as const },
    { address: marketAddress as `0x${string}`, abi: MARKET_ABI, functionName: 'activeParticipantsCount' as const },
    { address: marketAddress as `0x${string}`, abi: MARKET_ABI, functionName: 'state' as const },
    ...market.options.map((_, index) => ({
      address: marketAddress as `0x${string}`,
      abi: MARKET_ABI,
      functionName: 'optionLiquidity',
      args: [index]
    }))
  ] : [], [market, marketAddress])

  const { data: liquidityData, isLoading: liquidityLoading, refetch: refetchLiquidity } = useReadContracts({
    contracts: liquidityContracts,
    query: { enabled: !!market }
  })

  // Update market with liquidity data - with change detection to prevent infinite loops
  useEffect(() => {
    if (!market || !liquidityData || liquidityData.length === 0) return

    try {
      console.log('🔍 Market GraphQL Hook: Processing liquidity data')
      
      const totalStaked = liquidityData[0]?.result
      const activeParticipantsCount = liquidityData[1]?.result
      const state = liquidityData[2]?.result
      const optionLiquidityResults = liquidityData.slice(3)
      
      const totalLiquidity = totalStaked ? formatUnits(totalStaked as bigint, 6) : "0"
      const optionLiquidity = optionLiquidityResults.map(result => 
        result?.result ? formatUnits(result.result as bigint, 6) : "0"
      )
      
      // Check if data has actually changed to prevent infinite loops
      const newActiveParticipantsCount = Number(activeParticipantsCount || 0)
      const newState = Number(state || 0)
      
      if (
        market.totalLiquidity === totalLiquidity &&
        market.activeParticipantsCount === newActiveParticipantsCount &&
        market.state === newState &&
        JSON.stringify(market.optionLiquidity) === JSON.stringify(optionLiquidity)
      ) {
        console.log('🔄 Market GraphQL Hook: Liquidity data unchanged, skipping update')
        return
      }
      
      const updatedMarket: MarketInfo = {
        ...market,
        totalLiquidity,
        optionLiquidity,
        activeParticipantsCount: newActiveParticipantsCount,
        state: newState
      }

      setMarket(updatedMarket)
      console.log('✅ Market GraphQL Hook: Updated with liquidity data')
      
    } catch (err) {
      console.error('❌ Market GraphQL Hook: Error processing liquidity data:', err)
    }
  }, [market, liquidityData])

  // Contract-based fallback when GraphQL and API both fail - with change detection
  useEffect(() => {
    if (contractData && contractData.length > 0 && !market && !graphqlLoading) {
      console.log('🔄 GraphQL Hook: Using contract fallback data')
      
      try {
        const [
          question,
          description,
          category,
          platform,
          identifier,
          createdAt,
          endTime,
          creator,
          creatorFeeBps,
          state,
          optionCount,
          totalStaked,
          activeParticipantsCount
        ] = contractData

        // Create a basic market info from contract data
        const contractMarket: MarketInfo = {
          address: marketAddress,
          identifier: identifier?.result as string || "",
          creator: creator?.result as string || "",
          options: [], // Will need to be fetched separately
          endTime: Number(endTime?.result || 0),
          creatorFeeBps: Number(creatorFeeBps?.result || 0),
          totalLiquidity: totalStaked?.result ? formatUnits(totalStaked.result as bigint, 6) : "0",
          isResolved: Number(state?.result) === 2,
          winningOption: undefined,
          question: question?.result as string || "",
          description: description?.result as string || "",
          category: category?.result as string || "General",
          resolutionSource: "",
          platform: Number(platform?.result || 0),
          createdAt: Number(createdAt?.result || 0),
          optionLiquidity: [],
          state: Number(state?.result) as any,
          status: Number(state?.result) === 2 ? 1 : 0,
          activeParticipantsCount: Number(activeParticipantsCount?.result || 0),
        }

        // Only update if we don't already have market data or if data has changed
        if (!market || (market as MarketInfo).address !== contractMarket.address) {
          setMarket(contractMarket)
          console.log('✅ GraphQL Hook: Contract fallback successful')
        } else {
          console.log('🔄 GraphQL Hook: Contract data unchanged, skipping update')
        }
      } catch (contractErr) {
        console.error('❌ GraphQL Hook: Contract fallback failed:', contractErr)
      }
    }
  }, [contractData, market, graphqlLoading, marketAddress])

  const handleRefetch = useCallback(async () => {
    await refetch()
    if (refetchLiquidity) {
      await refetchLiquidity()
    }
  }, [refetch, refetchLiquidity])

  // Debug logging for market state
  useEffect(() => {
    console.log('🔍 Market GraphQL Hook: Current market state:', {
      market: market ? {
        address: market.address,
        question: market.question,
        options: market.options,
        totalLiquidity: market.totalLiquidity,
        state: market.state
      } : null,
      loading: graphqlLoading || contractLoading || liquidityLoading,
      error: graphqlError || (contractError ? contractError.message : null)
    })
  }, [market, graphqlLoading, contractLoading, liquidityLoading, graphqlError, contractError])

  return { 
    market, 
    loading: graphqlLoading || contractLoading || liquidityLoading, 
    error: graphqlError || (contractError ? contractError.message : null),
    refetch: handleRefetch
  }
}
