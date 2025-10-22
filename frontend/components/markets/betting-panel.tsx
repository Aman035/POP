"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Wallet, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { usePlaceBet, useExitBet, useClaimPayout } from "@/hooks/use-contracts"
import { MarketInfo } from "@/lib/types"

interface BettingPanelProps {
  market: MarketInfo
  selectedOption: number | null
  onSelectOption: (optionId: number | null) => void
}

export function BettingPanel({ market, selectedOption, onSelectOption }: BettingPanelProps) {
  const [betAmount, setBetAmount] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  
  // Smart contract hooks
  const { placeBet, loading: placeBetLoading, error: placeBetError, isConfirmed: betConfirmed } = usePlaceBet(market.address)
  const { exitBet, loading: exitBetLoading, error: exitBetError } = useExitBet(market.address)
  const { claimPayout, loading: claimLoading, error: claimError } = useClaimPayout(market.address)

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
            <Label htmlFor="bet-amount">Bet Amount (USDC)</Label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="bet-amount"
                type="number"
                placeholder="0.00"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="pl-7"
                min="0"
                step="0.01"
              />
            </div>
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
          <Button
            className="w-full gold-gradient text-background font-semibold"
            size="lg"
            disabled={!selectedOption || !betAmount || Number(betAmount) <= 0 || placeBetLoading}
            onClick={handlePlaceBet}
          >
            <Wallet className="w-4 h-4 mr-2" />
            {placeBetLoading ? "Placing Bet..." : "Place Bet"}
          </Button>
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
