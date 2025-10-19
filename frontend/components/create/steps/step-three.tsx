"use client"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

interface StepThreeProps {
  marketData: any
  updateMarketData: (updates: any) => void
}

export function StepThree({ marketData, updateMarketData }: StepThreeProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Market Parameters</h2>
        <p className="text-muted-foreground">Set the end date, creator fee, and resolution source</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal mt-2 bg-transparent">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {marketData.endDate ? format(marketData.endDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={marketData.endDate}
                onSelect={(date) => updateMarketData({ endDate: date })}
                initialFocus
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
          <p className="text-xs text-muted-foreground mt-1">When betting will close for this market</p>
        </div>

        <div>
          <Label>Creator Fee: {marketData.creatorFee}%</Label>
          <div className="mt-4">
            <Slider
              value={[marketData.creatorFee]}
              onValueChange={(value) => updateMarketData({ creatorFee: value[0] })}
              min={1}
              max={5}
              step={0.5}
              className="w-full"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            You'll earn {marketData.creatorFee}% of every bet placed in this market
          </p>
        </div>

        <div>
          <Label htmlFor="resolution-source">Resolution Source</Label>
          <Textarea
            id="resolution-source"
            placeholder="e.g., CoinMarketCap, Coinbase, Binance official price data"
            value={marketData.resolutionSource}
            onChange={(e) => updateMarketData({ resolutionSource: e.target.value })}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            What source will you use to determine the outcome? Be specific.
          </p>
        </div>
      </div>

      {/* Fee Estimate */}
      <div className="p-4 rounded-lg bg-background border border-border">
        <h4 className="font-semibold mb-2">Estimated Earnings</h4>
        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">If total pool reaches $1,000</span>
            <span className="font-medium text-gold-2">${(1000 * marketData.creatorFee) / 100}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">If total pool reaches $5,000</span>
            <span className="font-medium text-gold-2">${(5000 * marketData.creatorFee) / 100}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">If total pool reaches $10,000</span>
            <span className="font-medium text-gold-2">${(10000 * marketData.creatorFee) / 100}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
