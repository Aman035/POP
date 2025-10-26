"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Wallet, AlertCircle, CheckCircle, Zap, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { usePlaceBet, useExitBet, useClaimPayout } from "@/hooks/contracts/use-contracts"
import { useUsdcBalance } from "@/hooks/wallet/use-usdc-balance"
import { BridgeAndBetButton } from "@/components/nexus/bridge-and-bet-button"
import { SimpleBridgeWidget } from "@/components/nexus/simple-bridge-widget"
import { MarketInfo } from "@/lib/types"

interface BettingPanelProps {
  market: MarketInfo
  selectedOption: number | null
  onSelectOption: (optionId: number | null) => void
}

export function BettingPanel({ market, selectedOption, onSelectOption }: BettingPanelProps) {
  const [betAmount, setBetAmount] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [showBridgeOption, setShowBridgeOption] = useState(false)
  
  // Smart contract hooks
  const { placeBet, loading: placeBetLoading, error: placeBetError, isConfirmed: betConfirmed } = usePlaceBet(market.address)
  const { exitBet, loading: exitBetLoading, error: exitBetError } = useExitBet(market.address)
  const { claimPayout, loading: claimLoading, error: claimError } = useClaimPayout(market.address)
  
  // USDC balance checking
  const { 
    balanceFormatted, 
    hasInsufficientBalance, 
    isLoading: usdcLoading, 
    error: usdcError,
    refreshBalance 
  } = useUsdcBalance(betAmount)

  const totalLiquidity = parseFloat(market.totalLiquidity)
  const selectedOptionLiquidity = selectedOption !== null ? parseFloat(market.optionLiquidity[selectedOption] || "0") : 0
  const selectedOptionLabel = selectedOption !== null ? market.options[selectedOption] : null
  
  // Calculate odds and potential return
  const odds = totalLiquidity > 0 ? (selectedOptionLiquidity / totalLiquidity) * 100 : 0
  const potentialReturn = betAmount && odds > 0 ? calculateReturn(Number(betAmount), odds) : 0
  const creatorFee = betAmount ? (Number(betAmount) * market.creatorFeeBps) / 10000 : 0 // Convert BPS to percentage

  const handlePlaceBet = async () => {
    if (!selectedOption || !betAmount || selectedOption === null) return

    try {
      const result = await placeBet(selectedOption, betAmount)
      if (result) {
        setShowSuccess(true)
        setTimeout(() => {
          setShowSuccess(false)
          setBetAmount("")
          onSelectOption(null)
        }, 3000)
      }
    } catch (error) {
      console.error("Failed to place bet:", error)
    }
  }

  const handleExitBet = async () => {
    if (!selectedOption || !betAmount || selectedOption === null) return

    try {
      await exitBet(selectedOption, betAmount)
    } catch (error) {
      console.error("Failed to exit bet:", error)
    }
  }

  const handleClaimPayout = async () => {
    try {
      await claimPayout()
    } catch (error) {
      console.error("Failed to claim payout:", error)
    }
  }

  // Show success message
  useEffect(() => {
    if (betConfirmed) {
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        setBetAmount("")
        onSelectOption(null)
      }, 3000)
    }
  }, [betConfirmed, onSelectOption])

  return (
    <Card className="p-6 bg-card border-border card-glow">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-gold-2" />
        <h2 className="text-xl font-bold">
          {market.isResolved ? "Market Resolved" : "Place Your Bet"}
        </h2>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <Alert className="mb-6 border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Bet placed successfully! Transaction confirmed.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Messages */}
      {(placeBetError || exitBetError || claimError) && (
        <Alert className="mb-6 border-red-500 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {placeBetError || exitBetError || claimError}
          </AlertDescription>
        </Alert>
      )}

      {/* Option Selection */}
      <div className="space-y-3 mb-6">
        <Label>Select Outcome</Label>
        {market.options.map((option, index) => {
          const optionLiquidity = parseFloat(market.optionLiquidity[index] || "0")
          const optionOdds = totalLiquidity > 0 ? (optionLiquidity / totalLiquidity) * 100 : 0
          const isWinningOption = market.isResolved && market.winningOption === index
          
          return (
            <button
              key={index}
              onClick={() => onSelectOption(index === selectedOption ? null : index)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                selectedOption === index
                  ? "border-gold-2 bg-gold-2/10"
                  : isWinningOption
                  ? "border-green-500 bg-green-50"
                  : "border-border bg-background hover:border-gold-2/50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-lg">{option}</span>
                <div className="flex items-center gap-2">
                  <Badge className="gold-gradient text-background font-bold">
                    {Math.round(optionOdds * 100) / 100}%
                  </Badge>
                  {isWinningOption && (
                    <Badge className="bg-green-600 text-white">Winner</Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Pool: ${optionLiquidity.toLocaleString()}</span>
                <span>Liquidity: {optionOdds.toFixed(1)}%</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Bet Amount */}
      {selectedOption !== null && !market.isResolved && (
        <div className="space-y-4 mb-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="bet-amount">Bet Amount (USDC)</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Balance: {usdcLoading ? "..." : `$${balanceFormatted}`}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshBalance}
                  disabled={usdcLoading}
                  className="h-6 w-6 p-0"
                >
                  <RefreshCw className={`w-3 h-3 ${usdcLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="bet-amount"
                type="number"
                placeholder="0.00"
                value={betAmount}
                onChange={(e) => {
                  setBetAmount(e.target.value)
                  setShowBridgeOption(false)
                }}
                className="pl-7"
                min="0"
                step="0.01"
              />
            </div>
            
            {/* USDC Balance Status */}
            {betAmount && Number(betAmount) > 0 && (
              <div className="mt-2">
                {hasInsufficientBalance ? (
                  <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800 dark:text-orange-200">
                      Insufficient USDC balance. You need ${Number(betAmount).toFixed(2)} but have ${balanceFormatted}.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      Sufficient USDC balance available.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[10, 25, 50, 100].map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => setBetAmount(amount.toString())}
                className="bg-transparent"
              >
                ${amount}
              </Button>
            ))}
          </div>

          {/* Calculation Summary */}
          {betAmount && Number(betAmount) > 0 && (
            <div className="p-4 rounded-lg bg-background border border-border space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Bet Amount</span>
                <span className="font-medium">${Number(betAmount).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Creator Fee ({(market.creatorFeeBps / 100).toFixed(2)}%)</span>
                <span className="font-medium text-rose-1">-${creatorFee.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
                <span className="text-muted-foreground">Potential Return</span>
                <span className="font-bold text-gold-2">${potentialReturn.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Potential Profit</span>
                <span className="font-bold text-teal-1">+${(potentialReturn - Number(betAmount)).toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {!market.isResolved ? (
          <div className="space-y-3">
            {/* Normal Place Bet Button - shown when user has sufficient USDC */}
            {!hasInsufficientBalance && (
              <Button
                className="w-full gold-gradient text-background font-semibold"
                size="lg"
                disabled={!selectedOption || !betAmount || Number(betAmount) <= 0 || placeBetLoading}
                onClick={handlePlaceBet}
              >
                <Wallet className="w-4 h-4 mr-2" />
                {placeBetLoading ? "Placing Bet..." : "Place Bet"}
              </Button>
            )}

            {/* Bridge and Bet Button - shown when user has insufficient USDC */}
            {hasInsufficientBalance && betAmount && Number(betAmount) > 0 && (
              <div className="space-y-3">
                <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    Bridge ETH to USDC and place your bet in one transaction.
                  </AlertDescription>
                </Alert>
                
                <BridgeAndBetButton
                  marketAddress={market.address}
                  option={selectedOption!}
                  amount={betAmount}
                  onSuccess={(txHash) => {
                    setShowSuccess(true)
                    setTimeout(() => {
                      setShowSuccess(false)
                      setBetAmount("")
                      onSelectOption(null)
                    }, 3000)
                  }}
                  onError={(error) => {
                    console.error("Bridge and bet failed:", error)
                  }}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Bridge ETH & Place Bet
                </BridgeAndBetButton>
              </div>
            )}

            {/* Show bridge option button when insufficient balance */}
            {hasInsufficientBalance && (!betAmount || Number(betAmount) <= 0) && (
              <Button
                variant="outline"
                className="w-full border-orange-500 text-orange-600 hover:bg-orange-50"
                size="lg"
                onClick={() => setShowBridgeOption(true)}
              >
                <Zap className="w-4 h-4 mr-2" />
                Bridge ETH to USDC
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
              size="lg"
              onClick={handleClaimPayout}
              disabled={claimLoading}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {claimLoading ? "Claiming..." : "Claim Payout"}
            </Button>
            <Button
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold"
              size="lg"
              onClick={handleExitBet}
              disabled={!selectedOption || !betAmount || exitBetLoading}
            >
              <Wallet className="w-4 h-4 mr-2" />
              {exitBetLoading ? "Exiting..." : "Exit Position"}
            </Button>
          </div>
        )}
      </div>

      {/* Bridge Option Section */}
      {showBridgeOption && (
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto">
              <Zap className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Bridge ETH to USDC
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Use Nexus to bridge ETH from supported chains to Arbitrum Sepolia and get USDC for betting.
              </p>
            </div>

            {/* Simple Bridge Widget */}
            <div className="space-y-3">
              <SimpleBridgeWidget
                onSuccess={() => {
                  setShowBridgeOption(false)
                  refreshBalance() // Refresh USDC balance after bridge
                }}
                onError={(error) => {
                  console.error("Bridge failed:", error)
                }}
              >
                <Zap className="w-4 h-4 mr-2" />
                Bridge ETH to Arbitrum Sepolia
              </SimpleBridgeWidget>
              
              <Button
                variant="ghost"
                onClick={() => setShowBridgeOption(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Warning */}
      <Alert className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          {market.isResolved 
            ? "This market has been resolved. You can claim payouts if you bet on the winning option."
            : "Make sure you understand the market resolution criteria before betting. All bets are final."
          }
        </AlertDescription>
      </Alert>
    </Card>
  )
}

function calculateReturn(betAmount: number, odds: number): number {
  // Simple calculation: if odds are 65%, you get back betAmount / (odds/100)
  return betAmount / (odds / 100)
}
