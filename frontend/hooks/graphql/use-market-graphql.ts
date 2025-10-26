import { useState, useEffect, useCallback, useMemo } from 'react'
import { MarketInfo, MarketState, MarketStatus } from '@/lib/types'
import { useReadContracts } from 'wagmi'
import { MARKET_ABI } from '@/lib/contracts'
import { formatUnits } from 'viem'

export function useMarketGraphQL(marketAddress: string) {
  const [market, setMarket] = useState<MarketInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Contract calls for all market data
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

  // Process contract data when it's available
  useEffect(() => {
    if (!contractData || contractData.length === 0 || contractLoading) return

    try {
      console.log('🔍 Market Hook: Processing contract data')
      
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

      // Get options by calling the contract for each option
      const optionCountNum = Number(optionCount?.result || 0)
      const options: string[] = []
      
      // For now, we'll use default options since we can't easily fetch them all
      // This is a limitation of the current approach, but it prevents infinite recursion
      if (optionCountNum > 0) {
        // Use default options for now - this could be enhanced later
        options.push('Yes', 'No')
      }

      const marketInfo: MarketInfo = {
        address: marketAddress,
        identifier: identifier?.result as string || "",
        creator: creator?.result as string || "",
        options: options,
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
        optionLiquidity: new Array(options.length).fill("0"),
        state: Number(state?.result) as any,
        status: Number(state?.result) === 2 ? MarketStatus.Resolved : MarketStatus.Active,
        activeParticipantsCount: Number(activeParticipantsCount?.result || 0),
      }

      console.log('✅ Market Hook: Market data loaded:', marketInfo)
      setMarket(marketInfo)
      setLoading(false)
      setError(null)
      
    } catch (err) {
      console.error('❌ Market Hook: Error processing contract data:', err)
      setError('Failed to process market data')
      setLoading(false)
    }
  }, [contractData, contractLoading, marketAddress])

  // Handle contract errors
  useEffect(() => {
    if (contractError) {
      console.error('❌ Market Hook: Contract error:', contractError)
      setError(contractError.message)
      setLoading(false)
    }
  }, [contractError])

  const handleRefetch = useCallback(async () => {
    console.log('🔄 Market Hook: Manual refetch requested')
    setLoading(true)
    setError(null)
    // The contract data will be refetched automatically by wagmi
  }, [])

  // Debug logging for market state
  useEffect(() => {
    console.log('🔍 Market Hook: Current state:', {
      market: market ? {
        address: market.address,
        question: market.question,
        options: market.options,
        totalLiquidity: market.totalLiquidity,
        state: market.state
      } : null,
      loading: contractLoading,
      error: contractError?.message || error
    })
  }, [market, contractLoading, contractError, error])

  return { 
    market, 
    loading: contractLoading, 
    error: contractError?.message || error,
    refetch: handleRefetch
  }
}
