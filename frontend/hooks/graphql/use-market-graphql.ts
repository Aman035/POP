import { useState, useEffect } from 'react'
import { getMarketByAddress, MarketCreated } from '@/lib/graphql-queries'
import { MarketInfo, MarketState, MarketStatus } from '@/lib/types'
import { resolvePlatformMetadata } from '@/lib/platform'
import { useReadContracts } from 'wagmi'
import { MARKET_ABI } from '@/lib/contracts'
import { formatUnits } from 'viem'

export function useMarketGraphQL(marketAddress: string) {
  const [market, setMarket] = useState<MarketInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Contract-based fallback for when GraphQL fails
  const contractContracts = marketAddress ? [
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
  ] : []

  const { data: contractData, isLoading: contractLoading, error: contractError } = useReadContracts({
    contracts: contractContracts,
    query: { enabled: !!marketAddress }
  })

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
          console.log('⚠️ GraphQL Hook: No market data found, trying API fallback...')
          // Try API fallback immediately if GraphQL returns null
          try {
            const response = await fetch(`/api/markets/${marketAddress}`)
            if (!response.ok) {
              throw new Error(`API responded with status: ${response.status}`)
            }
            const data = await response.json()
            
            if (data.success && data.market) {
              console.log('✅ GraphQL Hook: API fallback successful')
              setMarket(data.market)
              setError(null)
              return
            }
          } catch (apiError) {
            console.error('❌ GraphQL Hook: API fallback failed:', apiError)
          }
          
          setError('Market not found')
          setLoading(false)
          return
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

  // Fetch liquidity data from contracts after market is loaded
  const liquidityContracts = market ? [
    { address: marketAddress as `0x${string}`, abi: MARKET_ABI, functionName: 'totalStaked' as const },
    { address: marketAddress as `0x${string}`, abi: MARKET_ABI, functionName: 'activeParticipantsCount' as const },
    { address: marketAddress as `0x${string}`, abi: MARKET_ABI, functionName: 'state' as const },
    ...market.options.map((_, index) => ({
      address: marketAddress as `0x${string}`,
      abi: MARKET_ABI,
      functionName: 'optionLiquidity' as const,
      args: [index] as const
    }))
  ] : []

  const { data: liquidityData, isLoading: liquidityLoading, refetch: refetchLiquidity } = useReadContracts({
    contracts: liquidityContracts,
    query: { enabled: !!market }
  })

  // Update market with liquidity data
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
      
      const updatedMarket: MarketInfo = {
        ...market,
        totalLiquidity,
        optionLiquidity,
        activeParticipantsCount: Number(activeParticipantsCount || 0),
        state: Number(state || 0)
      }

      setMarket(updatedMarket)
      console.log('✅ Market GraphQL Hook: Updated with liquidity data')
      
    } catch (err) {
      console.error('❌ Market GraphQL Hook: Error processing liquidity data:', err)
    }
  }, [market, liquidityData])

  // Contract-based fallback when GraphQL and API both fail
  useEffect(() => {
    if (contractData && contractData.length > 0 && !market && !loading) {
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

        setMarket(contractMarket)
        setError(null)
        console.log('✅ GraphQL Hook: Contract fallback successful')
      } catch (contractErr) {
        console.error('❌ GraphQL Hook: Contract fallback failed:', contractErr)
      }
    }
  }, [contractData, market, loading, marketAddress])

  const refetch = async () => {
    if (refetchLiquidity) {
      await refetchLiquidity()
    }
  }

  return { 
    market, 
    loading: loading || contractLoading || liquidityLoading, 
    error: error || (contractError ? contractError.message : null),
    refetch
  }
}
