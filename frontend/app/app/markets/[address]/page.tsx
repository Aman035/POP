"use client"

import { useState, use, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Clock, DollarSign, Users, Twitter, MessageSquare, TrendingUp, AlertCircle, Activity, ExternalLink, Wallet, Coins, CheckCircle, XCircle, Copy, RefreshCw, Zap } from "lucide-react"
import Link from "next/link"
import { useMarketGraphQL } from "@/hooks/graphql/use-market-graphql"
import { useWallet } from "@/hooks/wallet/use-wallet"
import { usePlaceBet, useExitBet } from "@/hooks/contracts/use-contracts"
import { useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { formatUnits, parseUnits } from "viem"
import { COLLATERAL_TOKEN_ADDRESS, IERC20_ABI, MARKET_ABI } from "@/lib/contracts"
import { useUsdcBalance } from "@/hooks/wallet/use-usdc-balance"
import { BridgeAndBetButton } from "@/components/nexus/bridge-and-bet-button"
import { SimpleBridgeWidget } from "@/components/nexus/simple-bridge-widget"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
  const { isConnected, address, connect, isCorrectChain, switchToArbitrumSepolia } = useWallet()
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
  const [showBridgeOption, setShowBridgeOption] = useState(false)
  
  // USDC balance checking with real-time validation
  const { 
    balanceFormatted: usdcBalanceFormatted, 
    hasInsufficientBalance: hasInsufficientUSDC, 
    isLoading: usdcBalanceLoading, 
    error: usdcBalanceError,
    refreshBalance: refreshUsdcBalance 
  } = useUsdcBalance(betAmount)
  
  // Contract hooks
  const { placeBet, loading: placeBetLoading, error: placeBetError, isConfirmed: betConfirmed } = usePlaceBet(resolvedParams.address)
  const { exitBet, loading: exitBetLoading, error: exitBetError } = useExitBet(resolvedParams.address)
  const { writeContract: writeContractUSDC, isPending: isApprovingUSDC, data: approvalHash } = useWriteContract()
  const { isLoading: isApprovalConfirming, isSuccess: isApprovalConfirmed } = useWaitForTransactionReceipt({
    hash: approvalHash,
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
  
  // Calculate user's total position
  const userTotalPosition = userPositions?.reduce((total, position) => {
    return total + (position.result ? Number(formatUnits(position.result as bigint, 6)) : 0)
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
      await switchToArbitrumSepolia()
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
    
    const usdcBalanceNum = usdcBalance ? Number(formatUnits(usdcBalance as bigint, 6)) : 0
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
  
  // Format USDC balance
  const formatUSDCBalance = (balance: bigint | undefined) => {
    if (!balance) return "0.00"
    return Number(formatUnits(balance, 6)).toFixed(2)
  }
  
  // Check if user has sufficient allowance
  const hasSufficientAllowance = () => {
    if (usdcAllowance === undefined || !betAmount) {
      console.log("🔍 Allowance check - missing data:", { usdcAllowance, betAmount })
      return false
    }
    const allowanceNum = Number(formatUnits(usdcAllowance as bigint, 6))
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
  
  // Show success notification when bet is confirmed
  useEffect(() => {
    if (betConfirmed) {
      setTransactionStatus("Bet placed successfully! Your position has been updated.")
      setShowSuccess(true)
      setSelectedOption(null)
      setBetAmount("")
      setTransactionHash("")
      
      // Refetch market data to update liquidity with delay to prevent race conditions
      if (refetch) {
        setTimeout(() => {
          console.log('🔄 Refetching market data after bet confirmation')
          refetch()
        }, 2000) // Wait 2 seconds for blockchain confirmation
      }
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false)
        setTransactionStatus("")
      }, 5000)
    }
  }, [betConfirmed, refetch])
  
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
  
  const timeRemaining = getTimeRemaining(new Date(marketInfo.endTime * 1000))
  const totalLiquidity = parseFloat(marketInfo.totalLiquidity)
  
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
      ? parseFloat(marketInfo.optionLiquidity[index]) 
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

          {/* Options */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Prediction Options</h3>
            <div className="space-y-3">
              {optionsWithOdds.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg bg-background border border-border ${
                    isResolved && marketInfo.winningOption === index ? "border-green-500 bg-green-50" : ""
                  }`}
                >
                  <div className="flex-1">
                    <span className="font-medium text-lg">{option.label}</span>
                    {isResolved && marketInfo.winningOption === index && (
                      <Badge className="ml-2 bg-green-600 text-white">Winner</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Pool Size</div>
                      <div className="font-semibold">${option.pool.toLocaleString()}</div>
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
                    Please switch to Arbitrum Sepolia to place bets
                  </p>
                  <Button 
                    onClick={switchToArbitrumSepolia}
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
                              if (position && Number(formatUnits(position as bigint, 6)) > 0) {
                                return (
                                  <Badge variant="secondary" className="text-xs">
                                    {Number(formatUnits(position as bigint, 6)).toFixed(2)} USDC
                                  </Badge>
                                )
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
                                  ⚠️ Insufficient USDC! You need ${Number(betAmount).toFixed(2)} but only have ${usdcBalanceFormatted}.
                                </AlertDescription>
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
                                USDC Allowance: {Number(formatUnits(usdcAllowance as bigint, 6)).toFixed(2)} USDC
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

                      {/* Approval and Place Bet Buttons */}
                      {hasInsufficientUSDC ? (
                        /* Bridge and Bet Button - shown when insufficient USDC */
                        <div className="space-y-3">
                          <Alert className="border-2 border-blue-600 bg-blue-100 dark:bg-blue-900/40 py-3 shadow-lg">
                            <Zap className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                            <AlertDescription className="text-sm font-bold text-blue-900 dark:text-blue-100">
                              💡 Bridge ETH to USDC and place your bet in one transaction!
                            </AlertDescription>
                          </Alert>
                          
                          <BridgeAndBetButton
                            marketAddress={resolvedParams.address}
                            option={selectedOption!}
                            amount={betAmount}
                            onSuccess={(txHash) => {
                              setShowSuccess(true)
                              setTransactionHash(txHash)
                              setTimeout(() => {
                                setShowSuccess(false)
                                setBetAmount("")
                                setSelectedOption(null)
                                refetch()
                              }, 3000)
                            }}
                            onError={(error) => {
                              console.error("Bridge and bet failed:", error)
                              setTransactionStatus(`Bridge failed: ${error}`)
                            }}
                          />
                          
                          <Button
                            variant="outline"
                            onClick={() => setShowBridgeOption(!showBridgeOption)}
                            className="w-full border-2 border-purple-500 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-semibold"
                            size="sm"
                          >
                            <Zap className="w-4 h-4 mr-2" />
                            {showBridgeOption ? 'Hide' : 'Show'} Alternative Bridge Options
                          </Button>
                        </div>
                      ) : !hasSufficientAllowance() ? (
                        <Button
                          onClick={handleApproveUSDC}
                          disabled={!betAmount || parseFloat(betAmount) <= 0 || isApproving || isApprovingUSDC || isApprovalConfirming}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isApproving || isApprovingUSDC || isApprovalConfirming ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              {isApprovalConfirming ? "Confirming..." : "Approving USDC..."}
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5 mr-2" />
                              Approve USDC
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          onClick={handlePlaceBet}
                          disabled={!betAmount || parseFloat(betAmount) <= 0 || isPlacingBet || placeBetLoading}
                          className="w-full gold-gradient text-background font-semibold py-3 text-lg hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-gold-2/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isPlacingBet || placeBetLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2"></div>
                              Placing Bet...
                            </>
                          ) : (
                            <>
                              <TrendingUp className="w-5 h-5 mr-2" />
                              Place Bet
                            </>
                          )}
                        </Button>
                      )}
                      
                      {/* Bridge Option Section */}
                      {showBridgeOption && hasInsufficientUSDC && (
                        <Card className="p-6 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 border-2 border-purple-400 dark:border-purple-600 mt-4 shadow-xl">
                          <div className="text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto shadow-lg">
                              <Zap className="w-8 h-8 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold mb-2 text-purple-900 dark:text-purple-100">
                                🌉 Bridge ETH to USDC
                              </h3>
                              <p className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-4">
                                Bridge ETH from any supported chain to get USDC on Arbitrum Sepolia
                              </p>
                            </div>

                            <SimpleBridgeWidget
                              onSuccess={() => {
                                setShowBridgeOption(false)
                                refreshUsdcBalance()
                              }}
                              onError={(error) => {
                                console.error("Bridge failed:", error)
                              }}
                            />
                          </div>
                        </Card>
                      )}
                    </div>
                  )}

                  {/* User Positions */}
                  {userTotalPosition > 0 && (
                    <div className="border-t pt-6">
                      <h4 className="font-semibold mb-4">Your Positions</h4>
                      <div className="space-y-3">
                        {userPositions?.map((position, index) => {
                          const positionAmount = position.result ? Number(formatUnits(position.result as bigint, 6)) : 0
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
                    <div className={`border rounded-lg p-4 ${
                      transactionStatus.includes("successfully") || showSuccess
                        ? "bg-green-50 border-green-200"
                        : transactionStatus.includes("Failed") || transactionStatus.includes("Error")
                        ? "bg-red-50 border-red-200"
                        : "bg-blue-50 border-blue-200"
                    }`}>
                      <div className="flex items-center gap-2">
                        {transactionStatus.includes("successfully") || showSuccess ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : transactionStatus.includes("Failed") || transactionStatus.includes("Error") ? (
                          <XCircle className="w-4 h-4 text-red-600" />
                        ) : (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        )}
                        <span className={`font-medium ${
                          transactionStatus.includes("successfully") || showSuccess
                            ? "text-green-700"
                            : transactionStatus.includes("Failed") || transactionStatus.includes("Error")
                            ? "text-red-700"
                            : "text-blue-700"
                        }`}>
                          {transactionStatus.includes("successfully") || showSuccess ? "Success!" : "Status"}
                        </span>
                      </div>
                      <p className={`text-sm mt-1 ${
                        transactionStatus.includes("successfully") || showSuccess
                          ? "text-green-600"
                          : transactionStatus.includes("Failed") || transactionStatus.includes("Error")
                          ? "text-red-600"
                          : "text-blue-600"
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

          {/* Proposed State Info */}
          {isProposed && (
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
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Market Stats */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Market Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Total Liquidity</span>
                </div>
                <span className="font-semibold">${totalLiquidity.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Participants</span>
                </div>
                <span className="font-semibold">{marketInfo.activeParticipantsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Time Remaining</span>
                </div>
                <span className="font-semibold text-gold-2">{timeRemaining}</span>
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
                <div>Arbitrum Sepolia</div>
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