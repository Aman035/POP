'use client'

import { useState, useEffect } from 'react'
import '@/styles/calendar.css'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Calendar } from '@/components/ui/calendar'
import { DayPicker } from 'react-day-picker'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  CalendarIcon,
  AlertCircle,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Shield,
  Users,
  Target,
  MessageSquare,
} from 'lucide-react'
import { format, addDays, isAfter, isToday } from 'date-fns'

interface StepThreeProps {
  marketData: any
  updateMarketData: (updates: any) => void
}

interface ValidationErrors {
  endDate?: string
  creatorFee?: string
  resolutionSource?: string
  identifier?: string
}

export function StepThree({ marketData, updateMarketData }: StepThreeProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [isSliderDragging, setIsSliderDragging] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [isValidating, setIsValidating] = useState(false)
  const [selectedTime, setSelectedTime] = useState('')

  // Real-time validation
  useEffect(() => {
    const validateForm = async () => {
      setIsValidating(true)
      const errors: ValidationErrors = {}

      // Validate end date
      if (!marketData.endDate) {
        errors.endDate = 'End date and time are required'
      } else if (marketData.endDate < new Date()) {
        errors.endDate = 'End date and time must be in the future'
      } else if (isAfter(marketData.endDate, addDays(new Date(), 365))) {
        errors.endDate = 'End date cannot be more than 1 year in the future'
      }

      // Validate creator fee
      if (marketData.creatorFee < 1 || marketData.creatorFee > 5) {
        errors.creatorFee = 'Creator fee must be between 1% and 5%'
      }

      // Validate resolution source
      if (!marketData.resolutionSource.trim()) {
        errors.resolutionSource = 'Resolution source is required'
      } else if (marketData.resolutionSource.trim().length < 10) {
        errors.resolutionSource =
          'Resolution source must be at least 10 characters'
      }

      // Validate identifier
      if (!marketData.identifier.trim()) {
        errors.identifier = 'Market identifier is required'
      } else if (marketData.identifier.trim().length < 3) {
        errors.identifier = 'Market identifier must be at least 3 characters'
      }

      setValidationErrors(errors)
      setIsValidating(false)
    }

    const timeoutId = setTimeout(validateForm, 300) // Debounce validation
    return () => clearTimeout(timeoutId)
  }, [
    marketData.endDate,
    marketData.creatorFee,
    marketData.resolutionSource,
    marketData.identifier,
  ])

  const handleDateSelect = (date: Date | undefined) => {
    console.log('Date selected:', date)
    if (date) {
      // Ensure the date is not in the past
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      console.log(
        'Today:',
        today,
        'Selected:',
        date,
        'Is valid:',
        date >= today
      )

      if (date >= today) {
        // Set the initial time if time hasn't been set
        const newDate = new Date(date)
        if (selectedTime) {
          const [hours, minutes] = selectedTime.split(':')
          newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
        } else {
          newDate.setHours(23, 59, 0, 0) // Default to end of day
        }
        updateMarketData({ endDate: newDate })
        setIsDatePickerOpen(false)
        console.log('Date updated successfully')
      } else {
        console.log('Date is in the past, not selecting')
      }
    }
  }

  const handleTimeChange = (time: string) => {
    setSelectedTime(time)
    if (marketData.endDate) {
      const [hours, minutes] = time.split(':')
      const newDate = new Date(marketData.endDate)
      newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      updateMarketData({ endDate: newDate })
    }
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

  const isFormValid =
    Object.keys(validationErrors).length === 0 &&
    marketData.endDate &&
    marketData.resolutionSource.trim() &&
    marketData.identifier.trim()

  const getFeeColor = (fee: number) => {
    if (fee <= 2) return 'text-green-600'
    if (fee <= 3.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getFeeLabel = (fee: number) => {
    if (fee <= 2) return 'Low fee - Great for attracting users'
    if (fee <= 3.5) return 'Moderate fee - Balanced approach'
    return 'High fee - Consider if you have strong market confidence'
  }

  const getFeeRecommendation = (fee: number) => {
    if (fee <= 1.5)
      return 'Excellent for new markets - attracts more participants'
    if (fee <= 2.5) return 'Good balance - competitive yet profitable'
    if (fee <= 3.5) return 'Moderate approach - consider market confidence'
    return 'High fee - ensure strong market conviction and unique value'
  }

  const calculateRealisticEarnings = (fee: number) => {
    // More realistic pool sizes based on typical prediction markets
    const scenarios = [
      { pool: 500, probability: 0.3, label: 'Small market' },
      { pool: 2000, probability: 0.4, label: 'Medium market' },
      { pool: 5000, probability: 0.2, label: 'Large market' },
      { pool: 10000, probability: 0.1, label: 'Viral market' },
    ]

    return scenarios.map((scenario) => ({
      ...scenario,
      earnings: ((scenario.pool * fee) / 100).toFixed(2),
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Market Parameters</h2>
        <p className="text-muted-foreground">
          Set the end date, creator fee, and resolution source
        </p>
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
                    ? 'border-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:border-red-500'
                    : marketData.endDate
                    ? 'border-gold-2 bg-gold-2/10 hover:bg-gold-2/20 dark:bg-gold-2/20 dark:border-gold-2'
                    : 'bg-background border-border hover:bg-accent hover:text-accent-foreground hover:border-gold-2/50'
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {marketData.endDate ? (
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gold-2"></div>
                    {format(marketData.endDate, "PPP 'at' p")}
                    {isValidating && <Spinner className="w-3 h-3" />}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 z-[999999] bg-white border border-gray-200 shadow-2xl dark:bg-gray-50 dark:border-gray-300"
              align="start"
            >
              <DayPicker
                mode="single"
                selected={marketData.endDate}
                onSelect={handleDateSelect}
                disabled={(date) => {
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  return date < today
                }}
                defaultMonth={new Date()}
                fromDate={new Date()}
                className="rounded-md border bg-background p-3"
                classNames={{
                  months:
                    'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                  month: 'space-y-4',
                  caption: 'flex justify-center pt-1 relative items-center',
                  caption_label: 'text-sm font-medium',
                  nav: 'space-x-1 flex items-center',
                  nav_button:
                    'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                  nav_button_previous: 'absolute left-1',
                  nav_button_next: 'absolute right-1',
                  table: 'w-full border-collapse space-y-1',
                  head_row: 'flex',
                  head_cell:
                    'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
                  row: 'flex w-full mt-2',
                  cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                  day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100',
                  day_range_end: 'day-range-end',
                  day_selected:
                    'bg-gold-2 text-gold-2-foreground hover:bg-gold-2 hover:text-gold-2-foreground focus:bg-gold-2 focus:text-gold-2-foreground',
                  day_today: 'bg-accent text-accent-foreground',
                  day_outside:
                    'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
                  day_disabled: 'text-muted-foreground opacity-50',
                  day_range_middle:
                    'aria-selected:bg-accent aria-selected:text-accent-foreground',
                  day_hidden: 'invisible',
                }}
                styles={{
                  day: {
                    borderRadius: '6px',
                    transition: 'all 0.2s ease-in-out',
                  },
                  day_selected: {
                    backgroundColor: '#D4AF37',
                    color: '#000',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(212, 175, 55, 0.3)',
                  },
                  day_today: {
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    fontWeight: '600',
                  },
                }}
                modifiers={{
                  selected: marketData.endDate,
                  today: new Date(),
                }}
                modifiersStyles={{
                  selected: {
                    backgroundColor: '#D4AF37',
                    color: '#000',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(212, 175, 55, 0.4)',
                  },
                  today: {
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    fontWeight: '600',
                    border: '2px solid #D4AF37',
                  },
                }}
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

          {/* Time Input */}
          {marketData.endDate && (
            <div>
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={
                  selectedTime ||
                  (marketData.endDate
                    ? format(marketData.endDate, 'HH:mm')
                    : '')
                }
                onChange={(e) => handleTimeChange(e.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                The exact time betting will close (24-hour format)
              </p>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            When betting will close for this market
          </p>
        </div>

        {/* Creator Fee Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="creator-fee"
              className="flex items-center gap-2 text-base"
            >
              Creator Fee
              {!validationErrors.creatorFee && marketData.creatorFee > 0 && (
                <CheckCircle className="w-4 h-4 text-green-600" />
              )}
              {validationErrors.creatorFee && (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
            </Label>
            <div className="flex items-center gap-2">
              <span
                className={`text-lg font-bold ${getFeeColor(
                  marketData.creatorFee
                )}`}
              >
                {marketData.creatorFee}%
              </span>
            </div>
          </div>

          {/* Radio Button Options */}
          <RadioGroup
            value={marketData.creatorFee.toString()}
            onValueChange={(value) =>
              updateMarketData({ creatorFee: parseFloat(value) })
            }
            className="grid grid-cols-2 gap-3"
          >
            <div
              className={`flex items-center space-x-2 p-3 rounded-lg border transition-all duration-200 ${
                marketData.creatorFee === 1
                  ? 'border-gold-2 bg-gold-2/10 shadow-md'
                  : 'border-border hover:bg-accent/50 hover:border-gold-2/50'
              }`}
            >
              <RadioGroupItem value="1" id="fee-1" className="text-gold-2" />
              <Label htmlFor="fee-1" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <span
                    className={`font-medium ${
                      marketData.creatorFee === 1
                        ? 'text-gold-2'
                        : 'text-foreground'
                    }`}
                  >
                    1%
                  </span>
                  <span className="text-xs text-muted-foreground">Low fee</span>
                </div>
              </Label>
            </div>
            <div
              className={`flex items-center space-x-2 p-3 rounded-lg border transition-all duration-200 ${
                marketData.creatorFee === 2
                  ? 'border-gold-2 bg-gold-2/10 shadow-md'
                  : 'border-border hover:bg-accent/50 hover:border-gold-2/50'
              }`}
            >
              <RadioGroupItem value="2" id="fee-2" className="text-gold-2" />
              <Label htmlFor="fee-2" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <span
                    className={`font-medium ${
                      marketData.creatorFee === 2
                        ? 'text-gold-2'
                        : 'text-foreground'
                    }`}
                  >
                    2%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Recommended
                  </span>
                </div>
              </Label>
            </div>
            <div
              className={`flex items-center space-x-2 p-3 rounded-lg border transition-all duration-200 ${
                marketData.creatorFee === 3
                  ? 'border-gold-2 bg-gold-2/10 shadow-md'
                  : 'border-border hover:bg-accent/50 hover:border-gold-2/50'
              }`}
            >
              <RadioGroupItem value="3" id="fee-3" className="text-gold-2" />
              <Label htmlFor="fee-3" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <span
                    className={`font-medium ${
                      marketData.creatorFee === 3
                        ? 'text-gold-2'
                        : 'text-foreground'
                    }`}
                  >
                    3%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Moderate
                  </span>
                </div>
              </Label>
            </div>
            <div
              className={`flex items-center space-x-2 p-3 rounded-lg border transition-all duration-200 ${
                marketData.creatorFee === 5
                  ? 'border-gold-2 bg-gold-2/10 shadow-md'
                  : 'border-border hover:bg-accent/50 hover:border-gold-2/50'
              }`}
            >
              <RadioGroupItem value="5" id="fee-5" className="text-gold-2" />
              <Label htmlFor="fee-5" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <span
                    className={`font-medium ${
                      marketData.creatorFee === 5
                        ? 'text-gold-2'
                        : 'text-foreground'
                    }`}
                  >
                    5%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    High fee
                  </span>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {/* Slider for fine-tuning */}
          <div className="space-y-4 mt-4 p-4 rounded-lg bg-gradient-to-r from-gold-2/5 to-gold-2/10 border border-gold-2/20">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">
                Fine-tune with slider:
              </p>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gold-2"></div>
                <span className="text-sm font-bold text-gold-2">
                  {marketData.creatorFee}%
                </span>
              </div>
            </div>
            <div className="px-2">
              <Slider
                id="creator-fee"
                value={[marketData.creatorFee]}
                onValueChange={handleSliderChange}
                onPointerDown={handleSliderStart}
                onPointerUp={handleSliderEnd}
                min={1}
                max={5}
                step={0.5}
                className="w-full [&_.slider-track]:bg-muted/50 [&_.slider-range]:bg-gold-2 [&_.slider-thumb]:bg-gold-2 [&_.slider-thumb]:border-2 [&_.slider-thumb]:border-background [&_.slider-thumb]:w-6 [&_.slider-thumb]:h-6 [&_.slider-thumb]:shadow-lg"
                disabled={isValidating}
              />
            </div>

            {/* Fee level indicators with current position */}
            <div className="relative">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span
                  className={
                    marketData.creatorFee === 1 ? 'text-gold-2 font-bold' : ''
                  }
                >
                  1%
                </span>
                <span
                  className={
                    marketData.creatorFee === 2 ? 'text-gold-2 font-bold' : ''
                  }
                >
                  2%
                </span>
                <span
                  className={
                    marketData.creatorFee === 3 ? 'text-gold-2 font-bold' : ''
                  }
                >
                  3%
                </span>
                <span
                  className={
                    marketData.creatorFee === 4 ? 'text-gold-2 font-bold' : ''
                  }
                >
                  4%
                </span>
                <span
                  className={
                    marketData.creatorFee === 5 ? 'text-gold-2 font-bold' : ''
                  }
                >
                  5%
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic feedback based on fee level */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-start gap-2">
              <div
                className={`w-2 h-2 rounded-full mt-1.5 ${
                  marketData.creatorFee <= 2
                    ? 'bg-green-500'
                    : marketData.creatorFee <= 3.5
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
              />
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
                ${((1000 * marketData.creatorFee) / 100).toFixed(2)} per $1,000
                pool
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
          <Label
            htmlFor="resolution-source"
            className="flex items-center gap-2"
          >
            Resolution Source
            {marketData.resolutionSource.trim() &&
              !validationErrors.resolutionSource && (
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
            onChange={(e) =>
              updateMarketData({ resolutionSource: e.target.value })
            }
            className={`min-h-[80px] resize-none transition-all duration-200 ${
              validationErrors.resolutionSource
                ? 'border-red-500 focus:border-red-500'
                : marketData.resolutionSource.trim()
                ? 'border-green-500 focus:border-green-500'
                : ''
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

        {/* Identifier Section */}
        <div className="space-y-2">
          <Label htmlFor="identifier" className="flex items-center gap-2">
            Market Identifier
            {marketData.identifier.trim() && !validationErrors.identifier && (
              <CheckCircle className="w-4 h-4 text-green-600" />
            )}
            {validationErrors.identifier && (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
          </Label>

          <Input
            id="identifier"
            placeholder="e.g., btc-price-2024"
            value={marketData.identifier}
            onChange={(e) => updateMarketData({ identifier: e.target.value })}
            className={`transition-all duration-200 ${
              validationErrors.identifier
                ? 'border-red-500 focus:border-red-500'
                : marketData.identifier.trim()
                ? 'border-green-500 focus:border-green-500'
                : ''
            }`}
            disabled={isValidating}
          />

          {validationErrors.identifier && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {validationErrors.identifier}
              </AlertDescription>
            </Alert>
          )}

          <p className="text-xs text-muted-foreground">
            A unique identifier for this market (used for contract deployment)
          </p>
        </div>

        {/* Platform Section */}
        <div className="space-y-3">
          <Label
            htmlFor="platform"
            className="flex items-center gap-2 text-base"
          >
            Platform
            {marketData.platform !== null &&
              marketData.platform !== undefined && (
                <CheckCircle className="w-4 h-4 text-green-600" />
              )}
          </Label>

          <div className="p-4 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-center gap-2 mb-2">
              {marketData.platform === 0 ? (
                <MessageSquare className="w-5 h-5 text-blue-400" />
              ) : marketData.platform === 1 ? (
                <MessageSquare className="w-5 h-5 text-purple-400" />
              ) : (
                <MessageSquare className="w-5 h-5 text-gray-400" />
              )}
              <span className="font-medium">
                {marketData.platform === 0
                  ? 'Twitter/X'
                  : marketData.platform === 1
                  ? 'Farcaster'
                  : 'Other Platform'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Platform detected from the poll URL
            </p>
          </div>
        </div>
      </div>

      {/* Realistic Earnings Projection */}
      <div className="p-4 rounded-lg bg-muted/50 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-gold-2" />
          <h4 className="font-semibold text-foreground">
            Realistic Earnings Projection
          </h4>
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
            {calculateRealisticEarnings(marketData.creatorFee).map(
              (scenario, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-background/50 border border-border/50"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        scenario.pool <= 1000
                          ? 'bg-blue-500'
                          : scenario.pool <= 3000
                          ? 'bg-green-500'
                          : scenario.pool <= 7000
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                    />
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
              )
            )}

            {/* Expected value calculation */}
            <div className="mt-4 p-3 rounded-lg bg-gold-2/10 border border-gold-2/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gold-2" />
                  <span className="font-medium text-foreground">
                    Expected Earnings
                  </span>
                </div>
                <span className="font-bold text-gold-2">
                  $
                  {calculateRealisticEarnings(marketData.creatorFee)
                    .reduce(
                      (sum, scenario) =>
                        sum +
                        parseFloat(scenario.earnings) * scenario.probability,
                      0
                    )
                    .toFixed(2)}
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
            All parameters are configured correctly. You're ready to proceed to
            the next step.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
