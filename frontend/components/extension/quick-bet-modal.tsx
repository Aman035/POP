"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { Wallet, TrendingUp } from "lucide-react"

interface QuickBetModalProps {
  isOpen: boolean
  onClose: () => void
  market: {
    id: string
    question: string
    options: Array<{ id: string; label: string; odds: number }>
  }
  selectedOption: string | null
}

export function QuickBetModal({ isOpen, onClose, market, selectedOption }: QuickBetModalProps) {
  const [betAmount, setBetAmount] = useState("")
  const [isPlacingBet, setIsPlacingBet] = useState(false)

  const selectedOptionData = market.options.find((opt) => opt.id === selectedOption)
  const potentialReturn = selectedOptionData && betAmount ? (Number(betAmount) / selectedOptionData.odds) * 100 : 0

  const handlePlaceBet = async () => {
    setIsPlacingBet(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsPlacingBet(false)
    setBetAmount("")
    onClose()
    alert("Bet placed successfully!")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gold-2" />
            Quick Bet
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Market Question */}
          <div className="p-3 rounded-lg bg-background border border-border">
            <p className="text-sm font-medium mb-2">{market.question}</p>
            {selectedOptionData && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Betting on:</span>
                <Badge className="gold-gradient text-background">{selectedOptionData.label}</Badge>
                <Badge variant="secondary" className="text-xs">
                  {selectedOptionData.odds}% odds
                </Badge>
              </div>
            )}
          </div>

          {/* Bet Amount */}
          <div>
            <Label htmlFor="quick-bet-amount">Amount (PYUSD)</Label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="quick-bet-amount"
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

          {/* Quick Amounts */}
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

          {/* Potential Return */}
          {betAmount && Number(betAmount) > 0 && (
            <div className="p-3 rounded-lg bg-background border border-border">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Bet Amount</span>
                <span className="font-medium">${Number(betAmount).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Potential Return</span>
                <span className="font-bold text-gold-2">${potentialReturn.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handlePlaceBet}
              disabled={!betAmount || Number(betAmount) <= 0 || isPlacingBet}
              className="flex-1 gold-gradient text-background font-semibold"
            >
              <Wallet className="w-4 h-4 mr-2" />
              {isPlacingBet ? "Placing..." : "Place Bet"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
