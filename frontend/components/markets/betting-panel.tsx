"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Wallet, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface MarketOption {
  id: string
  label: string
  odds: number
  pool: number
  bettors: number
}

interface Market {
  id: string
  question: string
  options: MarketOption[]
  totalPool: number
  creatorFee: number
}

interface BettingPanelProps {
  market: Market
  selectedOption: string | null
  onSelectOption: (optionId: string | null) => void
}

export function BettingPanel({ market, selectedOption, onSelectOption }: BettingPanelProps) {
  const [betAmount, setBetAmount] = useState("")
  const [isPlacingBet, setIsPlacingBet] = useState(false)

  const selectedOptionData = market.options.find((opt) => opt.id === selectedOption)
  const potentialReturn =
    selectedOptionData && betAmount ? calculateReturn(Number(betAmount), selectedOptionData.odds) : 0
  const fee = betAmount ? (Number(betAmount) * market.creatorFee) / 100 : 0

  const handlePlaceBet = async () => {
    if (!selectedOption || !betAmount) return

    setIsPlacingBet(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsPlacingBet(false)

    // Reset form
    setBetAmount("")
    onSelectOption(null)

    // Show success message (in real app)
    alert("Bet placed successfully!")
  }

  return (
    <Card className="p-6 bg-card border-border card-glow">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-gold-2" />
        <h2 className="text-xl font-bold">Place Your Bet</h2>
      </div>

      {/* Option Selection */}
      <div className="space-y-3 mb-6">
        <Label>Select Outcome</Label>
        {market.options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelectOption(option.id === selectedOption ? null : option.id)}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              selectedOption === option.id
                ? "border-gold-2 bg-gold-2/10"
                : "border-border bg-background hover:border-gold-2/50"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-lg">{option.label}</span>
              <Badge className="gold-gradient text-background font-bold">{option.odds}%</Badge>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Pool: ${option.pool.toLocaleString()}</span>
              <span>{option.bettors} bettors</span>
            </div>
          </button>
        ))}
      </div>

      {/* Bet Amount */}
      {selectedOption && (
        <div className="space-y-4 mb-6">
          <div>
            <Label htmlFor="bet-amount">Bet Amount (PYUSD)</Label>
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
                <span className="text-muted-foreground">Creator Fee ({market.creatorFee}%)</span>
                <span className="font-medium text-rose-1">-${fee.toFixed(2)}</span>
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

      {/* Place Bet Button */}
      <Button
        className="w-full gold-gradient text-background font-semibold"
        size="lg"
        disabled={!selectedOption || !betAmount || Number(betAmount) <= 0 || isPlacingBet}
        onClick={handlePlaceBet}
      >
        <Wallet className="w-4 h-4 mr-2" />
        {isPlacingBet ? "Placing Bet..." : "Place Bet"}
      </Button>

      {/* Warning */}
      <Alert className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          Make sure you understand the market resolution criteria before betting. All bets are final.
        </AlertDescription>
      </Alert>
    </Card>
  )
}

function calculateReturn(betAmount: number, odds: number): number {
  // Simple calculation: if odds are 65%, you get back betAmount / (odds/100)
  return betAmount / (odds / 100)
}
