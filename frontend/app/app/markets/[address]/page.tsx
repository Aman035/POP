"use client"

import { useState, use, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Clock, DollarSign, Users, Twitter, MessageSquare, TrendingUp, AlertCircle, Activity, ExternalLink, Wallet, Coins, CheckCircle, XCircle, Copy, RefreshCw, Zap, Gavel, Award, Shield } from "lucide-react"
import Link from "next/link"
import { useMarketGraphQL } from "@/hooks/graphql/use-market-graphql"
import { useWallet } from "@/hooks/wallet/use-wallet"
import { usePlaceBet, useExitBet, useProposeResolution, useOverrideResolution, useFinalizeResolution, useClaimPayout } from "@/hooks/contracts/use-contracts"
import { useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { formatUnits, parseUnits } from "viem"
import { COLLATERAL_TOKEN_ADDRESS, IERC20_ABI, MARKET_ABI } from "@/lib/contracts"
import { useUsdcBalance } from "@/hooks/wallet/use-usdc-balance"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LiquidityChart } from "@/components/markets/liquidity-chart"

interface MarketDetailsPageProps {
  params: Promise<{
    address: string
  }>
}

export default function MarketDetailsPage({ params }: MarketDetailsPageProps) {
  const resolvedParams = use(params)
  const { market: marketInfo, loading, error, refetch } = useMarketGraphQL(resolvedParams.address)
  
  // Debug logging for market data
  useEffect(() => {
    console.log('🔍 Market Page: Market data state:', {
      marketInfo: marketInfo ? {
        address: marketInfo.address,
        question: marketInfo.question,
        options: marketInfo.options,
        totalLiquidity: marketInfo.totalLiquidity,
        state: marketInfo.state,
        description: marketInfo.description,
        category: marketInfo.category,
        platform: marketInfo.platform,
        createdAt: marketInfo.createdAt,
        endTime: marketInfo.endTime
      } : null,
      loading,
      error,
      hasQuestion: !!marketInfo?.question,
      hasOptions: !!marketInfo?.options?.length,
      hasDescription: !!marketInfo?.description
    })
    
    // Force a re-render test
    if (marketInfo) {
      console.log('🔍 Market Page: Market data is available, forcing re-render test')
      console.log('🔍 Market Page: Full market object:', JSON.stringify(marketInfo, null, 2))
      // This will help us see if the data is actually being passed to the UI
    }
  }, [marketInfo, loading, error])

  // Force refetch if stuck in loading state
  useEffect(() => {
    if (loading && !error) {
      const timeoutId = setTimeout(() => {
        console.log('🔄 Market Page: Loading timeout, forcing refetch')
        refetch()
      }, 5000) // Wait 5 seconds before forcing refetch

      return () => clearTimeout(timeoutId)
    }
  }, [loading, error, refetch])

  // Track refresh times
  useEffect(() => {
    if (marketInfo && !loading) {
      setLastRefreshTime(new Date())
      setIsRefreshing(false)
    }
  }, [marketInfo, loading])

  // Enhanced refetch with loading state
  const handleRefetch = async () => {
    setIsRefreshing(true)
    console.log('🔄 Market Page: Manual refetch triggered')
    await refetch()
  }
  
  // Wallet and betting state
  const { isConnected, address, connect, isCorrectChain, switchToBSCTestnet } = useWallet()
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [betAmount, setBetAmount] = useState("")
  const [isApproving, setIsApproving] = useState(false)
  const [isPlacingBet, setIsPlacingBet] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState<string>("")
  const [transactionHash, setTransactionHash] = useState<string>("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [copiedHash, setCopiedHash] = useState(false)
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // USDC balance checking with real-time validation
  const { 
    balanceFormatted: usdcBalanceFormatted, 
    hasInsufficientBalance: hasInsufficientUSDC, 
    isLoading: usdcBalanceLoading, 
    error: usdcBalanceError,
    refreshBalance: refreshUsdcBalance 
  } = useUsdcBalance(betAmount)
  
  // Contract hooks
  const { placeBet, loading: placeBetLoading, error: placeBetError, hash: betHash, isConfirmed: betConfirmed } = usePlaceBet(resolvedParams.address)
  const { exitBet, loading: exitBetLoading, error: exitBetError } = useExitBet(resolvedParams.address)
  const { proposeResolution, loading: proposeLoading, error: proposeError, hash: proposeHash, isConfirmed: proposeConfirmed } = useProposeResolution(resolvedParams.address)
  const { overrideResolution, loading: overrideLoading, error: overrideError, hash: overrideHash, isConfirmed: overrideConfirmed } = useOverrideResolution(resolvedParams.address)
  const { finalizeResolution, loading: finalizeLoading, error: finalizeError, hash: finalizeHash, isConfirmed: finalizeConfirmed } = useFinalizeResolution(resolvedParams.address)
  const { claimPayout, loading: claimLoading, error: claimError, hash: claimHash, isConfirmed: claimConfirmed } = useClaimPayout(resolvedParams.address)
  const { writeContract: writeContractUSDC, isPending: isApprovingUSDC, data: approvalHash } = useWriteContract()
  const { isLoading: isApprovalConfirming, isSuccess: isApprovalConfirmed } = useWaitForTransactionReceipt({
    hash: approvalHash,
  })
  
  // Track bet transaction status
  const { isLoading: isBetConfirming, isSuccess: isBetConfirmed, isError: isBetError } = useWaitForTransactionReceipt({
    hash: betHash,
  })
  
  // USDC balance and allowance
  const { data: usdcBalance } = useReadContract({
    address: COLLATERAL_TOKEN_ADDRESS as `0x${string}`,
    abi: IERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })
  
  const { data: usdcAllowance, refetch: refetchAllowance } = useReadContract({
    address: COLLATERAL_TOKEN_ADDRESS as `0x${string}`,
    abi: IERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, resolvedParams.address] : undefined,
    query: { enabled: !!address }
  })
  
  // User positions for each option
  const userPositionContracts = marketInfo?.options.map((_, index) => ({
    address: resolvedParams.address as `0x${string}`,
    abi: MARKET_ABI,
    functionName: 'userPositions' as const,
    args: address ? [address, index] : undefined
  })) || []
  
  const { data: userPositions } = useReadContracts({
    contracts: userPositionContracts,
    query: { enabled: !!address && userPositionContracts.length > 0 }
  })

  // Resolution state reads
  const { data: marketCreator } = useReadContract({
    address: resolvedParams.address as `0x${string}`,
    abi: MARKET_ABI,
    functionName: 'creator',
    query: { enabled: !!resolvedParams.address }
  })

  const { data: proposer } = useReadContract({
    address: resolvedParams.address as `0x${string}`,
    abi: MARKET_ABI,
    functionName: 'proposer',
    query: { enabled: !!resolvedParams.address }
  })

  const { data: proposalTimestamp } = useReadContract({
    address: resolvedParams.address as `0x${string}`,
    abi: MARKET_ABI,
    functionName: 'proposalTimestamp',
    query: { enabled: !!resolvedParams.address }
  })

  const { data: resolvedOutcome } = useReadContract({
    address: resolvedParams.address as `0x${string}`,
    abi: MARKET_ABI,
    functionName: 'outcome',
    query: { enabled: !!resolvedParams.address }
  })

  const { data: creatorOverrideWindow } = useReadContract({
    address: resolvedParams.address as `0x${string}`,
    abi: MARKET_ABI,
    functionName: 'creatorOverrideWindow',
    query: { enabled: !!resolvedParams.address }
  })

  const { data: hasClaimed } = useReadContract({
    address: resolvedParams.address as `0x${string}`,
    abi: MARKET_ABI,
    functionName: 'hasClaimed',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!resolvedParams.address }
  })

  // Check market state early for use in queries
  const marketState = marketInfo?.state ?? 0
  const isResolvedState = marketState === 2

  const { data: finalWinningPool } = useReadContract({
    address: resolvedParams.address as `0x${string}`,
    abi: MARKET_ABI,
    functionName: 'finalWinningPool',
    query: { enabled: !!resolvedParams.address && isResolvedState }
  })

  const { data: resolvedPayoutPool } = useReadContract({
    address: resolvedParams.address as `0x${string}`,
    abi: MARKET_ABI,
    functionName: 'resolvedPayoutPool',
    query: { enabled: !!resolvedParams.address && isResolvedState }
  })

  // Check if user is creator
  const isCreator = address && marketCreator && address.toLowerCase() === (marketCreator as string).toLowerCase()
  
  // Check if market has ended
  const marketEnded = marketInfo ? Date.now() / 1000 >= marketInfo.endTime : false
  
  // Check if override window is active
  const overrideWindowActive = proposalTimestamp && creatorOverrideWindow
    ? Date.now() / 1000 < Number(proposalTimestamp) + Number(creatorOverrideWindow)
    : false
  
  // Check if override window has expired
  const overrideWindowExpired = proposalTimestamp && creatorOverrideWindow
    ? Date.now() / 1000 >= Number(proposalTimestamp) + Number(creatorOverrideWindow)
    : false

  // Calculate user's claimable amount
  const userWinningPosition = isResolvedState && resolvedOutcome !== undefined && userPositions
    ? userPositions[Number(resolvedOutcome)]?.result
    : null
  
  // Calculate claimable amount properly (all values are in wei)
  const claimableAmountFormatted = userWinningPosition && finalWinningPool && resolvedPayoutPool && Number(finalWinningPool) > 0
    ? Number(formatUnits(
        (BigInt(userWinningPosition as bigint) * BigInt(resolvedPayoutPool as bigint)) / BigInt(finalWinningPool as bigint),
        18
      ))
    : 0
  
  // Calculate user's total position
  // Handle both old bets (6 decimals) and new bets (18 decimals)
  const userTotalPosition = userPositions?.reduce((total, position) => {
    if (!position.result) return total
    const amount18 = Number(formatUnits(position.result as bigint, 18))
    const amount6 = Number(formatUnits(position.result as bigint, 6))
    // Use whichever gives a reasonable value (> 0.01)
    return total + (amount6 > 0.01 ? amount6 : amount18)
  }, 0) || 0
  
  // Calculate potential winnings
  const calculatePotentialWinnings = (option: number, amount: string) => {
    if (!marketInfo || !amount || parseFloat(amount) <= 0) return "0"
    
    const optionLiquidity = marketInfo.optionLiquidity?.[option] ? parseFloat(marketInfo.optionLiquidity[option]) : 0
    const totalLiquidity = parseFloat(marketInfo.totalLiquidity)
    const betAmountNum = parseFloat(amount)
    
    if (optionLiquidity === 0) return amount // If no liquidity, 1:1 payout
    
    const newTotalLiquidity = totalLiquidity + betAmountNum
    const newOptionLiquidity = optionLiquidity + betAmountNum
    const losingPool = newTotalLiquidity - newOptionLiquidity
    const creatorFee = (losingPool * (marketInfo.creatorFeeBps || 0)) / 10000
    const payoutPool = newTotalLiquidity - creatorFee
    
    const potentialWinnings = (betAmountNum * payoutPool) / newOptionLiquidity
    return potentialWinnings.toFixed(2)
  }
  
  // Handle bet placement
  const handlePlaceBet = async () => {
    if (!isConnected) {
      await connect()
      return
    }
    
    if (!isCorrectChain) {
      await switchToBSCTestnet()
      return
    }
    
    if (!selectedOption && selectedOption !== 0) {
      setTransactionStatus("Please select an option to bet on")
      return
    }
    
    if (!betAmount || parseFloat(betAmount) <= 0) {
      setTransactionStatus("Please enter a valid bet amount")
      return
    }
    
    const usdcBalanceNum = usdcBalance ? Number(formatUnits(usdcBalance as bigint, 18)) : 0
    if (parseFloat(betAmount) > usdcBalanceNum) {
      setTransactionStatus("Insufficient USDC balance")
      return
    }
    
    // Check if we need approval first
    if (!hasSufficientAllowance()) {
      setTransactionStatus("Please approve USDC first before placing your bet")
      return
    }
    
    try {
      setIsPlacingBet(true)
      setTransactionStatus("Placing bet...")
      console.log("🚀 Attempting to place bet:", { selectedOption, betAmount, marketAddress: resolvedParams.address })
      
      const result = await placeBet(selectedOption, betAmount)
      console.log("📊 Place bet result:", result)
      
      if (result && result.hash) {
        setTransactionStatus("Bet transaction submitted. Waiting for confirmation...")
        setTransactionHash(result.hash)
        console.log("✅ Bet transaction hash:", result.hash)
      } else {
        console.log("❌ No hash returned from placeBet")
        setTransactionStatus("Failed to get transaction hash")
      }
    } catch (error) {
      console.error("❌ Error placing bet:", error)
      setTransactionStatus(`Failed to place bet: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsPlacingBet(false)
    }
  }
  
  // Handle exit bet
  const handleExitBet = async (option: number, amount: string) => {
    if (!isConnected) {
      alert("Please connect your wallet")
      return
    }
    
    try {
      const result = await exitBet(option, amount)
      if (result) {
        alert("Bet exited successfully!")
      }
    } catch (error) {
      console.error("Error exiting bet:", error)
      alert("Failed to exit bet")
    }
  }
  
  // Format USDC balance (token has 18 decimals)
  const formatUSDCBalance = (balance: bigint | undefined) => {
    if (!balance) return "0.00"
    const balanceNum = Number(formatUnits(balance, 18))
    if (isNaN(balanceNum) || !isFinite(balanceNum)) return "0.00"
    // Always show 2 decimal places for consistency
    if (balanceNum >= 1000000) {
      return balanceNum.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })
    } else {
      return balanceNum.toFixed(2)
    }
  }
  
  // Check if user has sufficient allowance (token has 18 decimals)
  const hasSufficientAllowance = () => {
    if (usdcAllowance === undefined || !betAmount) {
      console.log("🔍 Allowance check - missing data:", { usdcAllowance, betAmount })
      return false
    }
    const allowanceNum = Number(formatUnits(usdcAllowance as bigint, 18))
    const betAmountNum = parseFloat(betAmount)
    const hasEnough = allowanceNum >= betAmountNum
    console.log("🔍 Allowance check:", { allowanceNum, betAmountNum, hasEnough })
    return hasEnough
  }
  
  // Handle USDC approval
  const handleApproveUSDC = async () => {
    if (!betAmount || parseFloat(betAmount) <= 0) {
      setTransactionStatus("Please enter a valid bet amount first")
      return
    }
    
    try {
      setIsApproving(true)
      setTransactionStatus("Approving USDC...")
      const amountWei = parseUnits(betAmount, 6)
      console.log("🔐 Approving USDC:", { betAmount, amountWei, marketAddress: resolvedParams.address })
      
      await writeContractUSDC({
        address: COLLATERAL_TOKEN_ADDRESS as `0x${string}`,
        abi: IERC20_ABI,
        functionName: 'approve',
        args: [resolvedParams.address as `0x${string}`, amountWei]
      })
      
      setTransactionStatus("USDC approval transaction submitted. Waiting for confirmation...")
      console.log("📝 Approval hash:", approvalHash)
      if (approvalHash) {
        setTransactionHash(approvalHash)
      }
    } catch (error) {
      console.error("Error approving USDC:", error)
      setTransactionStatus(`Failed to approve USDC: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsApproving(false)
    }
  }
  
  // Show transaction status and update UI when bet transaction is confirmed
  useEffect(() => {
    if (betHash) {
      if (isBetConfirming) {
        setTransactionStatus("Transaction submitted! Waiting for confirmation...")
        setTransactionHash(betHash)
      } else if (isBetConfirmed) {
        setTransactionStatus("✅ Bet placed successfully! Your position has been updated.")
        setShowSuccess(true)
        setTransactionHash(betHash)
        
        // Refresh all data after successful bet
        const refreshData = async () => {
          console.log('🔄 Refreshing data after bet confirmation...')
          // Refresh market data
          if (refetch) {
            await refetch()
          }
          // Refresh balance
          if (refreshUsdcBalance) {
            await refreshUsdcBalance()
          }
          // Refresh allowance
          if (refetchAllowance) {
            await refetchAllowance()
          }
          // Refetch user positions (will happen automatically via useReadContracts)
          console.log('✅ Data refresh completed')
        }
        
        // Wait a bit for blockchain state to update, then refresh
        setTimeout(() => {
          refreshData()
        }, 2000)
        
        // Clear form
        setSelectedOption(null)
        setBetAmount("")
        
        // Clear success message after 8 seconds
        setTimeout(() => {
          setShowSuccess(false)
          setTransactionStatus("")
        }, 8000)
      } else if (isBetError) {
        setTransactionStatus("❌ Transaction failed. Please try again.")
        setTransactionHash(betHash)
      }
    }
  }, [betHash, isBetConfirming, isBetConfirmed, isBetError, refetch, refreshUsdcBalance, refetchAllowance])

  // Auto-refresh after successful resolution transactions
  useEffect(() => {
    if (proposeConfirmed || overrideConfirmed || finalizeConfirmed) {
      const refreshData = async () => {
        console.log('🔄 Refreshing data after resolution...')
        if (refetch) {
          await refetch()
        }
        console.log('✅ Data refresh completed')
      }
      setTimeout(() => {
        refreshData()
      }, 2000)
    }
  }, [proposeConfirmed, overrideConfirmed, finalizeConfirmed, refetch])

  // Auto-refresh after successful claim
  useEffect(() => {
    if (claimConfirmed) {
      const refreshData = async () => {
        console.log('🔄 Refreshing data after claim...')
        if (refetch) {
          await refetch()
        }
        if (refreshUsdcBalance) {
          await refreshUsdcBalance()
        }
        console.log('✅ Data refresh completed')
      }
      setTimeout(() => {
        refreshData()
      }, 2000)
    }
  }, [claimConfirmed, refetch, refreshUsdcBalance])
  
  // Handle approval success
  useEffect(() => {
    if (isApprovalConfirmed) {
      console.log("✅ Approval transaction confirmed!")
      setTransactionStatus("USDC approved successfully! You can now place your bet.")
      // Refresh allowance after approval
      setTimeout(() => {
        console.log("🔄 Refreshing allowance...")
        refetchAllowance()
        setTransactionStatus("")
      }, 2000)
    }
  }, [isApprovalConfirmed, refetchAllowance])
  
  // Debug allowance changes
  useEffect(() => {
    console.log("🔍 Allowance updated:", { usdcAllowance, hasEnough: hasSufficientAllowance() })
  }, [usdcAllowance, betAmount])
  
  // Copy transaction hash to clipboard
  const copyTransactionHash = async () => {
    if (transactionHash) {
      try {
        await navigator.clipboard.writeText(transactionHash)
        setCopiedHash(true)
        setTimeout(() => setCopiedHash(false), 2000)
      } catch (err) {
        console.error('Failed to copy hash:', err)
      }
    }
  }

  if (loading) {
    console.log('🔍 Market Page: Loading state - showing loading UI')
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" asChild>
            <Link href="/app/markets">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Markets
            </Link>
          </Button>
          <div className="flex items-center gap-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">Loading market details...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !marketInfo) {
    console.log('🔍 Market Page: Error or no market data - showing error UI', { error, marketInfo })
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" asChild>
            <Link href="/app/markets">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Markets
            </Link>
          </Button>
        </div>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Market Not Found</h3>
          <p className="text-muted-foreground mb-4">
            {typeof error === 'string' ? error : "The market you're looking for doesn't exist or has been removed."}
          </p>
          {error && typeof error === 'string' && error.includes('Failed to fetch') && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 max-w-md mx-auto">
              <p className="text-yellow-800 text-sm">
                <strong>Network Issue:</strong> Unable to connect to the data source. 
                This might be a temporary issue. Please try refreshing the page.
              </p>
            </div>
          )}
          <div className="flex gap-2 justify-center">
            <Button asChild>
              <Link href="/app/markets">Back to Markets</Link>
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    )
  }

  console.log('🔍 Market Page: Rendering market content with real contract data:', {
    question: marketInfo.question,
    options: marketInfo.options,
    totalLiquidity: marketInfo.totalLiquidity,
    state: marketInfo.state,
    activeParticipantsCount: marketInfo.activeParticipantsCount,
    isResolved: marketInfo.isResolved
  })
  
  // Safely parse liquidity values
  const parseLiquidity = (value: string | number): number => {
    const parsed = typeof value === 'string' ? parseFloat(value) : value
    return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed
  }
  
  const timeRemaining = getTimeRemaining(new Date(marketInfo.endTime * 1000))
  const totalLiquidity = parseLiquidity(marketInfo.totalLiquidity)
  
  // Use actual contract states
  const isTrading = marketInfo.state === 0 // Trading state
  const isProposed = marketInfo.state === 1 // Proposed state  
  const isResolved = marketInfo.state === 2 // Resolved state
  
  const getStatusInfo = () => {
    if (isResolved) return { label: "Resolved", color: "bg-green-500", textColor: "text-green-700" }
    if (isProposed) return { label: "Proposed", color: "bg-yellow-500", textColor: "text-yellow-700" }
    return { label: "Trading", color: "bg-blue-500", textColor: "text-blue-700" }
  }
  
  const statusInfo = getStatusInfo()

  // Calculate odds for each option using real contract data
  const optionsWithOdds = marketInfo.options.map((option, index) => {
    const optionLiquidity = marketInfo.optionLiquidity && marketInfo.optionLiquidity[index] 
      ? parseLiquidity(marketInfo.optionLiquidity[index])
      : 0
    // Calculate real odds based on actual liquidity data from contracts
    const odds = totalLiquidity > 0 ? (optionLiquidity / totalLiquidity) * 100 : 50
    return {
      label: option,
      odds: Math.round(odds * 100) / 100,
      pool: optionLiquidity,
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" asChild>
          <Link href="/app/markets">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Markets
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{marketInfo.question}</h1>
            {isRefreshing && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Refreshing...</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-sm">
              {marketInfo.category}
            </Badge>
            <Badge className={`text-sm text-white ${statusInfo.color}`}>
              {statusInfo.label}
            </Badge>
            {isResolved && marketInfo.winningOption !== undefined && (
              <Badge className="text-sm bg-green-600 text-white">
                Winner: {marketInfo.options[marketInfo.winningOption]}
              </Badge>
            )}
            {lastRefreshTime && (
              <Badge variant="outline" className="text-xs">
                Updated: {lastRefreshTime.toLocaleTimeString()}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {marketInfo.description && (
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Description</h3>
              <p className="text-muted-foreground">{marketInfo.description}</p>
            </Card>
          )}

          {/* Liquidity Chart */}
          {marketInfo.options && marketInfo.optionLiquidity && (
            <LiquidityChart
              options={marketInfo.options}
              optionLiquidity={marketInfo.optionLiquidity || []}
              totalLiquidity={marketInfo.totalLiquidity}
              winningOption={marketInfo.winningOption as number | undefined}
            />
          )}

          {/* Options */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Prediction Options</h3>
            <div className="space-y-3">
              {optionsWithOdds.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg bg-background border border-border transition-all ${
                    isResolved && marketInfo.winningOption === index 
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20" 
                      : "hover:border-gold-2/50 hover:shadow-sm"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-lg">{option.label}</span>
                      {isResolved && marketInfo.winningOption === index && (
                        <Badge className="bg-green-600 text-white">Winner</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Pool Size</div>
                      <div className="font-semibold">${option.pool.toFixed(2)}</div>
                    </div>
                    <Badge className="gold-gradient text-background font-semibold px-3 py-1">
                      {option.odds}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Betting Interface */}
          {isTrading && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Place Your Bet</h3>
                {isConnected && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 border-2 border-green-600 dark:border-green-500 rounded-lg shadow-md">
                      <Coins className="w-5 h-5 text-green-700 dark:text-green-300" />
                      <span className="text-sm font-extrabold text-green-800 dark:text-green-200">
                        Balance: {usdcBalanceLoading ? "..." : `$${usdcBalanceFormatted}`} USDC
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={refreshUsdcBalance}
                      disabled={usdcBalanceLoading}
                      className="h-8 w-8 p-0 border-2 border-gray-300 hover:border-green-500 hover:bg-green-50"
                      title="Refresh Balance"
                    >
                      <RefreshCw className={`w-4 h-4 ${usdcBalanceLoading ? 'animate-spin text-green-600' : 'text-gray-600'}`} />
                    </Button>
                    {/* Subtle low balance indicator */}
                    {!usdcBalanceLoading && parseFloat(usdcBalanceFormatted) < 1 && (
                      <a
                        href="https://www.bnbchain.org/en/testnet-faucet"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors flex items-center gap-1 underline decoration-dotted opacity-75 hover:opacity-100"
                        title="Get test tokens from BNB Chain Faucet"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="hidden sm:inline">Low balance</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
              
              {!isConnected ? (
                <div className="text-center py-8">
                  <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-semibold mb-2">Connect Your Wallet</h4>
                  <p className="text-muted-foreground mb-4">
                    Connect your wallet to start placing bets on this market
                  </p>
                  <Button 
                    onClick={connect}
                    className="gold-gradient text-background font-semibold px-6 py-2"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                </div>
              ) : !isCorrectChain ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h4 className="font-semibold mb-2">Wrong Network</h4>
                  <p className="text-muted-foreground mb-4">
                    Please switch to BSC Testnet to place bets
                  </p>
                  <Button 
                    onClick={switchToBSCTestnet}
                    className="gold-gradient text-background font-semibold px-6 py-2"
                  >
                    Switch Network
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Option Selection */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Select Your Prediction</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {marketInfo.options.map((option, index) => (
                        <Button
                          key={index}
                          variant={selectedOption === index ? "default" : "outline"}
                          className={`p-4 h-auto flex flex-col items-center gap-2 transition-all ${
                            selectedOption === index 
                              ? "gold-gradient text-background shadow-lg" 
                              : "hover:border-gold-2 hover:bg-gold-2/5"
                          }`}
                          onClick={() => setSelectedOption(index)}
                        >
                          <span className="font-medium text-center">{option}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm opacity-80">
                              {optionsWithOdds[index]?.odds}% odds
                            </span>
                            {(() => {
                              const position = userPositions?.[index]?.result
                              if (position) {
                                // Handle both old bets (6 decimals) and new bets (18 decimals)
                                const amount18 = Number(formatUnits(position as bigint, 18))
                                const amount6 = Number(formatUnits(position as bigint, 6))
                                const positionAmount = amount6 > 0.01 ? amount6 : amount18
                                if (positionAmount > 0) {
                                  return (
                                    <Badge variant="secondary" className="text-xs">
                                      {positionAmount.toFixed(2)} USDC
                                    </Badge>
                                  )
                                }
                              }
                              return null
                            })()}
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Bet Amount Input */}
                  {selectedOption !== null && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="betAmount" className="text-sm font-medium mb-2 block">
                          Bet Amount (USDC)
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="betAmount"
                            type="number"
                            placeholder="0.00"
                            value={betAmount}
                            onChange={(e) => setBetAmount(e.target.value)}
                            className="flex-1"
                            min="0"
                            step="0.01"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setBetAmount(formatUSDCBalance(usdcBalance as bigint | undefined))}
                            className="px-3"
                          >
                            Max
                          </Button>
                        </div>
                        {betAmount && parseFloat(betAmount) > 0 && (
                          <div className="mt-2 space-y-2">
                            <div className="text-sm text-muted-foreground">
                              Potential winnings: {calculatePotentialWinnings(selectedOption, betAmount)} USDC
                            </div>
                            
                            {/* USDC Balance Status */}
                            {hasInsufficientUSDC ? (
                              <Alert className="border-2 border-red-600 bg-red-100 dark:bg-red-900/40 py-3 shadow-lg">
                                <AlertCircle className="h-5 w-5 text-red-700 dark:text-red-400" />
                                <AlertDescription className="text-sm font-bold text-red-900 dark:text-red-100">
                                  ⚠️ Insufficient USDC! You need ${Number(betAmount).toFixed(2)} but only have ${Number(usdcBalanceFormatted).toFixed(2)}.
                                </AlertDescription>
                                <div className="mt-2 pt-2 border-t border-red-300 dark:border-red-700">
                                  <a
                                    href="https://www.bnbchain.org/en/testnet-faucet"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 transition-colors flex items-center gap-1 underline decoration-dotted"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    Get test tokens from BNB Chain Faucet
                                  </a>
                                </div>
                              </Alert>
                            ) : (
                              <Alert className="border-2 border-green-600 bg-green-100 dark:bg-green-900/40 py-3 shadow-lg">
                                <CheckCircle className="h-5 w-5 text-green-700 dark:text-green-400" />
                                <AlertDescription className="text-sm font-bold text-green-900 dark:text-green-100">
                                  ✅ Sufficient USDC balance available!
                                </AlertDescription>
                              </Alert>
                            )}
                            
                            {usdcAllowance ? (
                              <div className="text-xs text-muted-foreground">
                                USDC Allowance: {Number(formatUnits(usdcAllowance as bigint, 18)).toFixed(2)} USDC
                                {hasSufficientAllowance() ? (
                                  <span className="text-green-600 ml-2">✓ Approved</span>
                                ) : (
                                  <span className="text-yellow-600 ml-2">⚠ Needs Approval</span>
                                )}
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>

                      {/* Smart Betting Flow - Automatically handles the entire process */}
                      {hasInsufficientUSDC ? (
                        /* Insufficient balance message */
                        <Alert className="border-2 border-orange-600 bg-orange-100 dark:bg-orange-900/40 py-3 shadow-lg">
                          <AlertCircle className="h-5 w-5 text-orange-700 dark:text-orange-400" />
                          <AlertDescription className="text-sm font-bold text-orange-900 dark:text-orange-100">
                            ⚠️ Insufficient USDC! You need ${Number(betAmount).toFixed(2)} but only have ${Number(usdcBalanceFormatted).toFixed(2)}. 
                            Please add USDC to your wallet on BSC Testnet to place this bet.
                          </AlertDescription>
                          <div className="mt-2 pt-2 border-t border-orange-300 dark:border-orange-700">
                            <a
                              href="https://www.bnbchain.org/en/testnet-faucet"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-orange-700 dark:text-orange-300 hover:text-orange-900 dark:hover:text-orange-100 transition-colors flex items-center gap-1 underline decoration-dotted"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Get test tokens from BNB Chain Faucet
                            </a>
                          </div>
                        </Alert>
                      ) : (
                        /* Smart Betting Button - Automatically handles approval + bet */
                        <Button
                          onClick={async () => {
                            if (!hasSufficientAllowance()) {
                              // Auto-approve first, then place bet
                              try {
                                setIsApproving(true)
                                setTransactionStatus("Auto-approving USDC...")
                                const amountWei = parseUnits(betAmount, 18)
                                
                                await writeContractUSDC({
                                  address: COLLATERAL_TOKEN_ADDRESS as `0x${string}`,
                                  abi: IERC20_ABI,
                                  functionName: 'approve',
                                  args: [resolvedParams.address as `0x${string}`, amountWei]
                                })
                                
                                setTransactionStatus("USDC approved! Now placing bet...")
                                // Wait for approval confirmation, then auto-place bet
                                setTimeout(async () => {
                                  try {
                                    setIsPlacingBet(true)
                                    setTransactionStatus("Placing your bet...")
                                    const result = await placeBet(selectedOption, betAmount)
                                    
                                    if (result && result.hash) {
                                      setTransactionStatus("Transaction submitted! Waiting for confirmation...")
                                      setTransactionHash(result.hash)
                                      // Don't clear form yet - wait for confirmation
                                    }
                                  } catch (error) {
                                    console.error("Bet placement failed:", error)
                                    setTransactionStatus(`Bet failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
                                  } finally {
                                    setIsPlacingBet(false)
                                  }
                                }, 3000) // Wait 3 seconds for approval to confirm
                                
                              } catch (error) {
                                console.error("Approval failed:", error)
                                setTransactionStatus(`Approval failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
                              } finally {
                                setIsApproving(false)
                              }
                            } else {
                              // Direct bet placement
                              try {
                                setIsPlacingBet(true)
                                setTransactionStatus("Placing your bet...")
                                const result = await placeBet(selectedOption, betAmount)
                                
                                if (result && result.hash) {
                                  setTransactionStatus("Transaction submitted! Waiting for confirmation...")
                                  setTransactionHash(result.hash)
                                  // Don't clear form yet - wait for confirmation
                                }
                              } catch (error) {
                                console.error("Bet placement failed:", error)
                                setTransactionStatus(`Bet failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
                              } finally {
                                setIsPlacingBet(false)
                              }
                            }
                          }}
                          disabled={!betAmount || parseFloat(betAmount) <= 0 || isPlacingBet || isApproving || placeBetLoading || isBetConfirming}
                          className="w-full gold-gradient text-background font-semibold py-3 text-lg hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-gold-2/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isPlacingBet || isApproving || placeBetLoading || isBetConfirming ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2"></div>
                              {isApproving || isApprovalConfirming 
                                ? "Approving..." 
                                : isBetConfirming 
                                ? "Confirming..." 
                                : "Placing Bet..."}
                            </>
                          ) : (
                            <>
                              <TrendingUp className="w-5 h-5 mr-2" />
                              Place Bet
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}

                  {/* User Positions */}
                  {userTotalPosition > 0 && (
                    <div className="border-t pt-6">
                      <h4 className="font-semibold mb-4">Your Positions</h4>
                      <div className="space-y-3">
                        {userPositions?.map((position, index) => {
                          if (!position.result) return null
                          // Handle both old bets (6 decimals) and new bets (18 decimals)
                          const amount18 = Number(formatUnits(position.result as bigint, 18))
                          const amount6 = Number(formatUnits(position.result as bigint, 6))
                          const positionAmount = amount6 > 0.01 ? amount6 : amount18
                          if (positionAmount === 0) return null
                          
                          return (
                            <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div>
                                <span className="font-medium">{marketInfo.options[index]}</span>
                                <div className="text-sm text-muted-foreground">
                                  {positionAmount.toFixed(2)} USDC
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleExitBet(index, positionAmount.toString())}
                                disabled={exitBetLoading}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                {exitBetLoading ? "Exiting..." : "Exit"}
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Error Display */}
                  {(placeBetError || exitBetError) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-red-700">
                        <XCircle className="w-4 h-4" />
                        <span className="font-medium">Error</span>
                      </div>
                      <p className="text-red-600 text-sm mt-1">
                        {placeBetError || exitBetError}
                      </p>
                    </div>
                  )}

                  {/* Transaction Status */}
                  {transactionStatus && (
                    <div className={`border-2 rounded-lg p-4 shadow-sm ${
                      transactionStatus.includes("✅") || showSuccess
                        ? "bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-400"
                        : transactionStatus.includes("❌") || transactionStatus.includes("Failed") || transactionStatus.includes("Error")
                        ? "bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-400"
                        : "bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400"
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {transactionStatus.includes("✅") || showSuccess ? (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : transactionStatus.includes("❌") || transactionStatus.includes("Failed") || transactionStatus.includes("Error") ? (
                          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        ) : (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400"></div>
                        )}
                        <span className={`font-semibold text-sm ${
                          transactionStatus.includes("✅") || showSuccess
                            ? "text-green-700 dark:text-green-300"
                            : transactionStatus.includes("❌") || transactionStatus.includes("Failed") || transactionStatus.includes("Error")
                            ? "text-red-700 dark:text-red-300"
                            : "text-blue-700 dark:text-blue-300"
                        }`}>
                          {transactionStatus.includes("✅") || showSuccess 
                            ? "Transaction Confirmed" 
                            : transactionStatus.includes("❌") || transactionStatus.includes("Failed")
                            ? "Transaction Failed"
                            : isBetConfirming
                            ? "Confirming Transaction"
                            : "Transaction Status"}
                        </span>
                      </div>
                      <p className={`text-sm mt-1 ${
                        transactionStatus.includes("✅") || showSuccess
                          ? "text-green-700 dark:text-green-300"
                          : transactionStatus.includes("❌") || transactionStatus.includes("Failed") || transactionStatus.includes("Error")
                          ? "text-red-700 dark:text-red-300"
                          : "text-blue-700 dark:text-blue-300"
                      }`}>
                        {transactionStatus}
                      </p>
                      {transactionHash && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Transaction Hash:</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-xs bg-muted px-2 py-1 rounded break-all">
                                {transactionHash}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={copyTransactionHash}
                                className="h-6 w-6 p-0 hover:bg-muted"
                              >
                                {copiedHash ? (
                                  <CheckCircle className="w-3 h-3 text-green-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">View on Arbiscan:</span>
                            <a
                              href={`https://sepolia.arbiscan.io/tx/${transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Open in Arbiscan
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Success Message */}
                  {betConfirmed && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">Success!</span>
                      </div>
                      <p className="text-green-600 text-sm mt-1">
                        Your bet has been placed successfully and is now active.
                      </p>
                      {transactionHash && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Transaction Hash:</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-xs bg-muted px-2 py-1 rounded break-all">
                                {transactionHash}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={copyTransactionHash}
                                className="h-6 w-6 p-0 hover:bg-muted"
                              >
                                {copiedHash ? (
                                  <CheckCircle className="w-3 h-3 text-green-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">View on Arbiscan:</span>
                            <a
                              href={`https://sepolia.arbiscan.io/tx/${transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Open in Arbiscan
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* Creator Resolution Panel */}
          {isCreator && marketEnded && !isResolved && (
            <Card className="p-6 border-2 border-purple-500/20 bg-purple-50/50 dark:bg-purple-900/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Gavel className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-lg">Market Resolution</h3>
                <Badge className="bg-purple-600 text-white">Creator Only</Badge>
              </div>

              {isTrading && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    The market has ended. You can propose a resolution or wait for someone else to propose.
                  </p>
                  <div className="space-y-3">
                    <Label>Propose Resolution</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {marketInfo.options.map((option, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          onClick={async () => {
                            try {
                              const evidenceURI = prompt("Enter evidence URI (e.g., IPFS link, URL):")
                              if (!evidenceURI || evidenceURI.trim() === '') {
                                alert("Evidence URI is required")
                                return
                              }
                              await proposeResolution(index, evidenceURI)
                            } catch (error) {
                              console.error("Error proposing resolution:", error)
                            }
                          }}
                          disabled={proposeLoading}
                          className="text-left"
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                    {proposeError && (
                      <Alert className="border-red-500 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800 text-sm">
                          {proposeError}
                        </AlertDescription>
                      </Alert>
                    )}
                    {proposeConfirmed && (
                      <Alert className="border-green-500 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800 text-sm">
                          Resolution proposed successfully!
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              )}

              {isProposed && overrideWindowActive && (
                <div className="space-y-4">
                  <Alert className="border-yellow-500 bg-yellow-50">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800 text-sm">
                      A resolution has been proposed. You can override it within the creator override window.
                    </AlertDescription>
                  </Alert>
                  <div className="space-y-3">
                    <Label>Override Resolution</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {marketInfo.options.map((option, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          onClick={async () => {
                            try {
                              if (!confirm(`Are you sure you want to override the resolution to "${option}"?`)) {
                                return
                              }
                              await overrideResolution(index)
                            } catch (error) {
                              console.error("Error overriding resolution:", error)
                            }
                          }}
                          disabled={overrideLoading}
                          className="text-left"
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                    {overrideError && (
                      <Alert className="border-red-500 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800 text-sm">
                          {overrideError}
                        </AlertDescription>
                      </Alert>
                    )}
                    {overrideConfirmed && (
                      <Alert className="border-green-500 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800 text-sm">
                          Resolution overridden successfully!
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              )}

              {isProposed && overrideWindowExpired && (
                <div className="space-y-4">
                  <Alert className="border-blue-500 bg-blue-50">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                      The override window has expired. You can now finalize the proposed resolution.
                    </AlertDescription>
                  </Alert>
                  <Button
                    onClick={async () => {
                      try {
                        await finalizeResolution()
                      } catch (error) {
                        console.error("Error finalizing resolution:", error)
                      }
                    }}
                    disabled={finalizeLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {finalizeLoading ? "Finalizing..." : "Finalize Resolution"}
                  </Button>
                  {finalizeError && (
                    <Alert className="border-red-500 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800 text-sm">
                        {finalizeError}
                      </AlertDescription>
                    </Alert>
                  )}
                  {finalizeConfirmed && (
                    <Alert className="border-green-500 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800 text-sm">
                        Market resolved successfully!
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* Participant Claim Payout Panel */}
          {isResolvedState && isConnected && (
            <Card className="p-6 border-2 border-green-500/20 bg-green-50/50 dark:bg-green-900/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-lg">Claim Your Winnings</h3>
              </div>

              {(hasClaimed as boolean) ? (
                <Alert className="border-blue-500 bg-blue-50">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-sm">
                    You have already claimed your payout for this market.
                  </AlertDescription>
                </Alert>
              ) : claimableAmountFormatted > 0 ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-background border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Your Winning Position:</span>
                      <span className="font-semibold">
                        {userWinningPosition ? formatUnits(userWinningPosition as bigint, 18) : "0"} USDC
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Claimable Amount:</span>
                      <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                        ${claimableAmountFormatted.toFixed(2)} USDC
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Winner: {marketInfo.options[Number(resolvedOutcome)]}
                    </div>
                  </div>
                  <Button
                    onClick={async () => {
                      try {
                        await claimPayout()
                      } catch (error) {
                        console.error("Error claiming payout:", error)
                      }
                    }}
                    disabled={claimLoading || (hasClaimed as boolean)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                  >
                    {claimLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Claiming...
                      </>
                    ) : (
                      <>
                        <Award className="w-4 h-4 mr-2" />
                        Claim Payout
                      </>
                    )}
                  </Button>
                  {claimError && (
                    <Alert className="border-red-500 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800 text-sm">
                        {claimError}
                      </AlertDescription>
                    </Alert>
                  )}
                  {claimConfirmed && (
                    <Alert className="border-green-500 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800 text-sm">
                        Payout claimed successfully! Check your wallet.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <Alert className="border-gray-500 bg-gray-50">
                  <AlertCircle className="h-4 w-4 text-gray-600" />
                  <AlertDescription className="text-gray-800 text-sm">
                    You don't have any winning positions to claim. You either didn't bet on the winning option or have already claimed.
                  </AlertDescription>
                </Alert>
              )}
            </Card>
          )}

          {/* Proposed State Info */}
          {isProposed && !isCreator && (
            <Card className="p-6 border-yellow-200 bg-yellow-50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-yellow-800">Resolution Proposed</h3>
              </div>
              <p className="text-yellow-700 text-sm">
                This market has ended and a resolution has been proposed. The creator has a window to override the resolution if needed.
              </p>
              {proposer && typeof proposer === 'string' && (
                <p className="text-yellow-700 text-xs mt-2">
                  Proposed by: {proposer}
                </p>
              )}
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Market Stats */}
          <Card className="p-6 border-border/50">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold text-lg">Market Statistics</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-card border-2 border-blue-500/20 dark:border-blue-400/30 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-400/20">
                      <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Total Liquidity</span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground mt-2">${totalLiquidity.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {marketInfo.options.length} options
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-card border-2 border-green-500/20 dark:border-green-400/30 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-green-500/10 dark:bg-green-400/20">
                      <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Participants</span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground mt-2">{marketInfo.activeParticipantsCount}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Active traders
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-card border-2 border-amber-500/20 dark:border-amber-400/30 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-amber-500/10 dark:bg-amber-400/20">
                      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Time Remaining</span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground mt-2">{timeRemaining}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isResolved ? 'Market ended' : isProposed ? 'Awaiting resolution' : 'Active trading'}
                </p>
              </div>
            </div>
          </Card>

          {/* Market Info */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Market Information</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Creator:</span>
                <div className="font-mono text-xs mt-1">{marketInfo.creator}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Created:</span>
                <div className="mt-1">
                  {new Date(marketInfo.createdAt * 1000).toLocaleString()}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Ends:</span>
                <div className="mt-1">
                  {new Date(marketInfo.endTime * 1000).toLocaleString()}
                </div>
              </div>
              {marketInfo.platform >= 0 && (
                <div>
                  <span className="text-muted-foreground">Platform:</span>
                  <div className="flex items-center gap-1 mt-1">
                    {marketInfo.platform === 0 && <Twitter className="w-3 h-3 text-blue-500" />}
                    {marketInfo.platform === 1 && <MessageSquare className="w-3 h-3 text-purple-500" />}
                    {marketInfo.platform === 2 && <Activity className="w-3 h-3 text-green-500" />}
                    {marketInfo.platform === 3 && <ExternalLink className="w-3 h-3 text-gray-500" />}
                    <span>
                      {marketInfo.platform === 0 ? 'Twitter' : 
                       marketInfo.platform === 1 ? 'Farcaster' : 
                       marketInfo.platform === 2 ? 'Lens' : 'Other'}
                    </span>
                  </div>
                </div>
              )}
              {marketInfo.resolutionSource && (
                <div>
                  <span className="text-muted-foreground">Resolution Source:</span>
                  <div className="mt-1">
                    <span className="text-xs text-muted-foreground">{marketInfo.resolutionSource}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Contract Info */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Contract Details</h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-muted-foreground">Address:</span>
                <div className="font-mono break-all">{marketInfo.address}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Network:</span>
                <div>BSC Testnet</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function getTimeRemaining(endsAt: Date): string {
  const now = new Date()
  const diff = endsAt.getTime() - now.getTime()

  if (diff < 0) return "Ended"

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h`
  return "< 1h"
}