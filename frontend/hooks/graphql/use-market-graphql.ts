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
  const contractContracts = useMemo(() => {
    if (!marketAddress) return []
    
    const baseContracts = [
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
    ]
    
    return baseContracts
  }, [marketAddress])

  const { data: contractData, isLoading: contractLoading, error: contractError } = useReadContracts({
    contracts: contractContracts,
    query: { enabled: !!marketAddress }
  })

  // Get option count from contract data
  const optionCount = useMemo(() => {
    if (!contractData || contractLoading) return 0
    const optionCountResult = contractData[10] // getOptionCount is at index 10
    return Number(optionCountResult?.result || 0)
  }, [contractData, contractLoading])

  // Create dynamic contracts for options and liquidity
  const optionContracts = useMemo(() => {
    if (!marketAddress || optionCount === 0) return []
    
    const contracts = []
    for (let i = 0; i < optionCount; i++) {
      contracts.push({
        address: marketAddress as `0x${string}`,
        abi: MARKET_ABI,
        functionName: 'options' as const,
        args: [i]
      })
    }
    return contracts
  }, [marketAddress, optionCount])

  const liquidityContracts = useMemo(() => {
    if (!marketAddress || optionCount === 0) return []
    
    const contracts = []
    for (let i = 0; i < optionCount; i++) {
      contracts.push({
        address: marketAddress as `0x${string}`,
        abi: MARKET_ABI,
        functionName: 'optionLiquidity' as const,
        args: [i]
      })
    }
    return contracts
  }, [marketAddress, optionCount])

  // Fetch options data
  const { data: optionsData, isLoading: optionsLoading, error: optionsError } = useReadContracts({
    contracts: optionContracts,
    query: { enabled: optionCount > 0 }
  })

  // Fetch liquidity data
  const { data: liquidityData, isLoading: liquidityLoading, error: liquidityError } = useReadContracts({
    contracts: liquidityContracts,
    query: { enabled: optionCount > 0 }
  })

  // Process options and liquidity data
  const options = useMemo(() => {
    if (!optionsData || optionsData.length === 0) return []
    
    const fetchedOptions = optionsData.map(result => result.result as string || '')
    console.log('✅ Market Hook: Fetched options from contract:', fetchedOptions)
    return fetchedOptions
  }, [optionsData])

  const optionLiquidity = useMemo(() => {
    if (!liquidityData || liquidityData.length === 0) return []
    
    const fetchedLiquidity = liquidityData.map(result => 
      result.result ? formatUnits(result.result as bigint, 6) : '0'
    )
    console.log('✅ Market Hook: Fetched option liquidity from contract:', fetchedLiquidity)
    return fetchedLiquidity
  }, [liquidityData])

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

      const marketState = Number(state?.result || 0)
      const isResolved = marketState === 2
      const isProposed = marketState === 1
      const isTrading = marketState === 0

      const marketInfo: MarketInfo = {
        address: marketAddress,
        identifier: identifier?.result as string || "",
        creator: creator?.result as string || "",
        options: options, // Use the fetched options
        endTime: Number(endTime?.result || 0),
        creatorFeeBps: Number(creatorFeeBps?.result || 0),
        totalLiquidity: totalStaked?.result ? formatUnits(totalStaked.result as bigint, 6) : "0",
        isResolved,
        winningOption: undefined,
        question: question?.result as string || "",
        description: description?.result as string || "",
        category: category?.result as string || "General",
        resolutionSource: "",
        platform: Number(platform?.result || 0),
        createdAt: Number(createdAt?.result || 0),
        optionLiquidity: optionLiquidity, // Use the fetched option liquidity
        state: marketState as any,
        status: isResolved ? MarketStatus.Resolved : MarketStatus.Active,
        activeParticipantsCount: Number(activeParticipantsCount?.result || 0),
      }

      console.log('✅ Market Hook: Market data loaded with real contract data:', {
        address: marketInfo.address,
        question: marketInfo.question,
        options: marketInfo.options,
        totalLiquidity: marketInfo.totalLiquidity,
        state: marketInfo.state,
        activeParticipantsCount: marketInfo.activeParticipantsCount,
        isResolved: marketInfo.isResolved
      })
      setMarket(marketInfo)
      setLoading(false)
      setError(null)
      
    } catch (err) {
      console.error('❌ Market Hook: Error processing contract data:', err)
      setError('Failed to process market data')
      setLoading(false)
    }
  }, [contractData, contractLoading, marketAddress, options, optionLiquidity])

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
    loading: contractLoading || optionsLoading || liquidityLoading, 
    error: contractError?.message || error || optionsError?.message || liquidityError?.message,
    refetch: handleRefetch
  }
}
