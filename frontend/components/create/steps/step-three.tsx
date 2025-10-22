"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { CalendarIcon, AlertCircle, CheckCircle, DollarSign, TrendingUp } from "lucide-react"
import { format, addDays, isAfter, isToday } from "date-fns"

interface StepThreeProps {
  marketData: any
  updateMarketData: (updates: any) => void
}

interface ValidationErrors {
  endDate?: string
  creatorFee?: string
  resolutionSource?: string
}

export function StepThree({ marketData, updateMarketData }: StepThreeProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [isSliderDragging, setIsSliderDragging] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [isValidating, setIsValidating] = useState(false)

  // Real-time validation
  useEffect(() => {
    const validateForm = async () => {
      setIsValidating(true)
      const errors: ValidationErrors = {}

      // Validate end date
      if (!marketData.endDate) {
        errors.endDate = "End date is required"
      } else if (!isAfter(marketData.endDate, new Date()) && !isToday(marketData.endDate)) {
        errors.endDate = "End date must be in the future"
      } else if (isAfter(marketData.endDate, addDays(new Date(), 365))) {
        errors.endDate = "End date cannot be more than 1 year in the future"
      }

      // Validate creator fee
      if (marketData.creatorFee < 1 || marketData.creatorFee > 5) {
        errors.creatorFee = "Creator fee must be between 1% and 5%"
      }

      // Validate resolution source
      if (!marketData.resolutionSource.trim()) {
        errors.resolutionSource = "Resolution source is required"
      } else if (marketData.resolutionSource.trim().length < 10) {
        errors.resolutionSource = "Resolution source must be at least 10 characters"
      }

      setValidationErrors(errors)
      setIsValidating(false)
    }

    const timeoutId = setTimeout(validateForm, 300) // Debounce validation
    return () => clearTimeout(timeoutId)
  }, [marketData.endDate, marketData.creatorFee, marketData.resolutionSource])

  const handleDateSelect = (date: Date | undefined) => {
    updateMarketData({ endDate: date })
    setIsDatePickerOpen(false)
  }

  const handleSliderChange = (value: number[]) => {
    updateMarketData({ creatorFee: value[0] })
  }

  const handleSliderStart = () => {
    setIsSliderDragging(true)
  }

  const handleSliderEnd = () => {
    setIsSliderDragging(false)
  }

  const isFormValid = Object.keys(validationErrors).length === 0 && 
    marketData.endDate && 
    marketData.resolutionSource.trim()

  const getFeeColor = (fee: number) => {
    if (fee <= 2) return "text-green-600"
    if (fee <= 3.5) return "text-yellow-600"
    return "text-red-600"
  }

  const getFeeLabel = (fee: number) => {
    if (fee <= 2) return "Low fee - Great for attracting users"
    if (fee <= 3.5) return "Moderate fee - Balanced approach"
    return "High fee - Consider if you have strong market confidence"
  }

  const getFeeRecommendation = (fee: number) => {
    if (fee <= 1.5) return "Excellent for new markets - attracts more participants"
    if (fee <= 2.5) return "Good balance - competitive yet profitable"
    if (fee <= 3.5) return "Moderate approach - consider market confidence"
    return "High fee - ensure strong market conviction and unique value"
  }

  const calculateRealisticEarnings = (fee: number) => {
    // More realistic pool sizes based on typical prediction markets
    const scenarios = [
      { pool: 500, probability: 0.3, label: "Small market" },
      { pool: 2000, probability: 0.4, label: "Medium market" },
      { pool: 5000, probability: 0.2, label: "Large market" },
      { pool: 10000, probability: 0.1, label: "Viral market" }
    ]
    
    return scenarios.map(scenario => ({
      ...scenario,
      earnings: (scenario.pool * fee / 100).toFixed(2)
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Market Parameters</h2>
        <p className="text-muted-foreground">Set the end date, creator fee, and resolution source</p>
      </div>

      <div className="space-y-6">
        {/* End Date Section */}
        <div className="space-y-2">
          <Label htmlFor="end-date" className="flex items-center gap-2">
            End Date
            {marketData.endDate && !validationErrors.endDate && (
              <CheckCircle className="w-4 h-4 text-green-600" />
            )}
            {validationErrors.endDate && (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
          </Label>
          
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button 
                id="end-date"
                variant="outline" 
                className={`w-full justify-start text-left font-normal transition-all duration-200 ${
                  validationErrors.endDate 
                    ? "border-red-500 bg-red-50 hover:bg-red-100" 
                    : marketData.endDate 
                    ? "border-green-500 bg-green-50 hover:bg-green-100"
                    : "bg-background border-border hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {marketData.endDate ? (
                  <span className="flex items-center gap-2">
                    {format(marketData.endDate, "PPP")}
                    {isValidating && <Spinner className="w-3 h-3" />}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={marketData.endDate}
                onSelect={handleDateSelect}
                initialFocus
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </PopoverContent>
          </Popover>
          
          {validationErrors.endDate && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {validationErrors.endDate}
              </AlertDescription>
            </Alert>
          )}
          
          <p className="text-xs text-muted-foreground">
            When betting will close for this market
          </p>
        </div>

        {/* Creator Fee Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="creator-fee" className="flex items-center gap-2 text-base">
              Creator Fee
              {!validationErrors.creatorFee && marketData.creatorFee > 0 && (
                <CheckCircle className="w-4 h-4 text-green-600" />
              )}
              {validationErrors.creatorFee && (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
            </Label>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold ${getFeeColor(marketData.creatorFee)}`}>
                {marketData.creatorFee}%
              </span>
            </div>
          </div>
          
          <div className="px-1">
            <Slider
              id="creator-fee"
              value={[marketData.creatorFee]}
              onValueChange={handleSliderChange}
              onPointerDown={handleSliderStart}
              onPointerUp={handleSliderEnd}
              min={1}
              max={5}
              step={0.5}
              className="w-full"
              disabled={isValidating}
            />
          </div>
          
          {/* Fee level indicators */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1%</span>
            <span>2%</span>
            <span>3%</span>
            <span>4%</span>
            <span>5%</span>
          </div>
          
          {/* Dynamic feedback based on fee level */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-start gap-2">
              <div className={`w-2 h-2 rounded-full mt-1.5 ${
                marketData.creatorFee <= 2 ? 'bg-green-500' : 
                marketData.creatorFee <= 3.5 ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {getFeeLabel(marketData.creatorFee)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {getFeeRecommendation(marketData.creatorFee)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Live earnings preview while dragging */}
          {isSliderDragging && (
            <div className="flex items-center gap-1 text-gold-2 bg-gold-2/10 p-2 rounded-lg">
              <DollarSign className="w-4 h-4" />
              <span className="font-medium">
                ${(1000 * marketData.creatorFee / 100).toFixed(2)} per $1,000 pool
              </span>
            </div>
          )}
          
          {validationErrors.creatorFee && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {validationErrors.creatorFee}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Resolution Source Section */}
        <div className="space-y-2">
          <Label htmlFor="resolution-source" className="flex items-center gap-2">
            Resolution Source
            {marketData.resolutionSource.trim() && !validationErrors.resolutionSource && (
              <CheckCircle className="w-4 h-4 text-green-600" />
            )}
            {validationErrors.resolutionSource && (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
          </Label>
          
          <Textarea
            id="resolution-source"
            placeholder="e.g., CoinMarketCap, Coinbase, Binance official price data"
            value={marketData.resolutionSource}
            onChange={(e) => updateMarketData({ resolutionSource: e.target.value })}
            className={`min-h-[80px] resize-none transition-all duration-200 ${
              validationErrors.resolutionSource 
                ? "border-red-500 focus:border-red-500" 
                : marketData.resolutionSource.trim()
                ? "border-green-500 focus:border-green-500"
                : ""
            }`}
            disabled={isValidating}
          />
          
          {validationErrors.resolutionSource && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {validationErrors.resolutionSource}
              </AlertDescription>
            </Alert>
          )}
          
          <p className="text-xs text-muted-foreground">
            What source will you use to determine the outcome? Be specific.
          </p>
        </div>
      </div>

      {/* Realistic Earnings Projection */}
      <div className="p-4 rounded-lg bg-muted/50 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-gold-2" />
          <h4 className="font-semibold text-foreground">Realistic Earnings Projection</h4>
          {isValidating && <Spinner className="w-3 h-3" />}
        </div>
        
        {isValidating ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : (
          <div className="space-y-3">
            {calculateRealisticEarnings(marketData.creatorFee).map((scenario, index) => (
              <div key={index} className="flex items-center justify-between py-2 px-3 rounded-lg bg-background/50 border border-border/50">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    scenario.pool <= 1000 ? 'bg-blue-500' :
                    scenario.pool <= 3000 ? 'bg-green-500' :
                    scenario.pool <= 7000 ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      {scenario.label} (${scenario.pool.toLocaleString()})
                    </span>
                    <div className="text-xs text-muted-foreground">
                      {(scenario.probability * 100).toFixed(0)}% chance
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-gold-2">
                    ${scenario.earnings}
                  </span>
                  <div className="text-xs text-muted-foreground">
                    {marketData.creatorFee}% fee
                  </div>
                </div>
              </div>
            ))}
            
            {/* Expected value calculation */}
            <div className="mt-4 p-3 rounded-lg bg-gold-2/10 border border-gold-2/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gold-2" />
                  <span className="font-medium text-foreground">Expected Earnings</span>
                </div>
                <span className="font-bold text-gold-2">
                  ${(calculateRealisticEarnings(marketData.creatorFee)
                    .reduce((sum, scenario) => sum + (parseFloat(scenario.earnings) * scenario.probability), 0)
                    .toFixed(2))}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Weighted average based on market size probabilities
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Form Status Summary */}
      {isFormValid && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            All parameters are configured correctly. You're ready to proceed to the next step.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
