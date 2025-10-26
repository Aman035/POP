'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { StepOne } from './steps/step-one'
import { StepTwo } from './steps/step-two'
import { StepThree } from './steps/step-three'
import { StepFour } from './steps/step-four'
import { X } from 'lucide-react'
import { Platform, MarketCreationParams } from '@/lib/types'
import { resolvePlatformMetadata } from '@/lib/platform'

interface MarketData {
  pollUrl: string
  platform: Platform | null
  question: string
  description: string
  options: string[]
  category: string
  endDate: Date | null
  creatorFee: number
  resolutionSource: string
  identifier: string
  // Smart contract fields
  marketAddress?: string
  txHash?: string
  endTime?: number
  creatorFeeBps?: number
}

interface CreateMarketWizardProps {
  hideUI?: boolean
  onClose: () => void
}

export function CreateMarketWizard({
  hideUI = false,
  onClose,
}: CreateMarketWizardProps) {
  const searchParams = useSearchParams()
  // Default end date to tomorrow
  const getDefaultEndDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(23, 59, 0, 0)
    return tomorrow
  }

  const [currentStep, setCurrentStep] = useState(hideUI ? 3 : 1) // Start at final step only if hideUI is true
  const [marketData, setMarketData] = useState<MarketData>({
    pollUrl: '',
    platform: null,
    question: '',
    description: '👀',
    options: ['', ''],
    category: 'other',
    endDate: getDefaultEndDate(),
    creatorFee: 2,
    resolutionSource: 'Decided By Creator',
    identifier: '',
  })

  // Auto-populate form from URL search params
  useEffect(() => {
    if (searchParams) {
      const question = searchParams.get('question')
      const option1 = searchParams.get('option1')
      const option2 = searchParams.get('option2')
      const option3 = searchParams.get('option3')
      const option4 = searchParams.get('option4')
      const category = searchParams.get('category')
      const identifier = searchParams.get('identifier')
      const platform = searchParams.get('platform')

      if (question) {
        // Validate category - if not in allowed list, default to "other"
        const validCategories = [
          'crypto',
          'tech',
          'finance',
          'science',
          'health',
          'sports',
          'politics',
          'entertainment',
          'other',
        ]
        const normalizedCategory = category?.toLowerCase() || ''
        const finalCategory = validCategories.includes(normalizedCategory)
          ? normalizedCategory
          : 'other'

        // Collect only provided options (up to 4)
        const providedOptions: string[] = []
        if (option1) providedOptions.push(option1)
        if (option2) providedOptions.push(option2)
        if (option3) providedOptions.push(option3)
        if (option4) providedOptions.push(option4)

        // Ensure at least 2 options - pad with empty strings if needed
        const options: string[] = []
        for (let i = 0; i < Math.max(2, providedOptions.length); i++) {
          options.push(providedOptions[i] || '')
        }

        // Trim to max 4
        if (options.length > 4) {
          options.splice(4)
        }

        // Parse endDate if provided
        let parsedEndDate = null
        const endDateParam = searchParams.get('endDate')
        if (endDateParam) {
          const parsed = new Date(endDateParam)
          if (!isNaN(parsed.getTime()) && parsed > new Date()) {
            parsedEndDate = parsed
          }
        }

        setMarketData((prev) => ({
          ...prev,
          question,
          options,
          category: finalCategory,
          identifier: identifier || prev.identifier,
          platform: platform
            ? resolvePlatformMetadata(platform)
            : prev.platform,
          endDate: parsedEndDate || prev.endDate,
          resolutionSource: 'Decided By Creator',
        }))
      }
    }
  }, [searchParams])

  const totalSteps = 3 // Removed Step 1, now we have: Market Details, Parameters, Review
  const progress = (currentStep / totalSteps) * 100

  const updateMarketData = (updates: Partial<MarketData>) => {
    setMarketData((prev) => ({ ...prev, ...updates }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCreate = async () => {
    // If market was already created on blockchain, just close
    if (marketData.marketAddress) {
      onClose()
      return
    }

    // If we're on step 3 and market hasn't been created yet, show message
    if (currentStep === 3 && !marketData.marketAddress) {
      alert('Please deploy your market to the blockchain first!')
      return
    }

    // Simulate API call for non-blockchain creation (fallback)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    alert('Market created successfully!')
    onClose()
  }

  const handleMarketCreated = (marketAddress: string, txHash: string) => {
    // Market was created on blockchain, update the data
    updateMarketData({
      marketAddress,
      txHash,
      endTime: marketData.endDate
        ? Math.floor(marketData.endDate.getTime() / 1000)
        : undefined,
      creatorFeeBps: Math.floor((marketData.creatorFee || 2) * 100),
    })
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      {!hideUI && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Create Market</h1>
            <p className="text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Progress Bar */}
      {!hideUI && <Progress value={progress} className="h-2" />}

      {/* Step Content */}
      <Card className="p-4 md:p-8 bg-card border-border overflow-hidden">
        <div className="max-h-[70vh] overflow-y-auto">
          {currentStep === 1 && (
            <StepTwo
              marketData={marketData}
              updateMarketData={updateMarketData}
            />
          )}
          {currentStep === 2 && (
            <StepThree
              marketData={marketData}
              updateMarketData={updateMarketData}
            />
          )}
          {currentStep === 3 && (
            <StepFour
              marketData={marketData}
              onCreateMarket={handleMarketCreated}
            />
          )}
        </div>
      </Card>

      {/* Navigation */}
      {currentStep < totalSteps && (
        <div className="flex items-center justify-between gap-4">
          {!hideUI && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="bg-transparent flex-1 md:flex-none"
            >
              Back
            </Button>
          )}
          {hideUI && currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="bg-transparent flex-1 md:flex-none"
            >
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            className="gold-gradient text-background font-semibold flex-1 md:flex-none"
          >
            Continue
          </Button>
        </div>
      )}

      {/* Edit button only on final step */}
      {currentStep === totalSteps && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(1)}
            className="bg-transparent"
          >
            Edit Market Details
          </Button>
        </div>
      )}
    </div>
  )
}
