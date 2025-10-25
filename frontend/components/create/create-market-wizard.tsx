"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { StepOne } from "./steps/step-one"
import { StepTwo } from "./steps/step-two"
import { StepThree } from "./steps/step-three"
import { StepFour } from "./steps/step-four"
import { X } from "lucide-react"
import { Platform, MarketCreationParams } from "@/lib/types"

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
  // Betting limit fields (for UI display)
  minBet: number
  maxBetPerUser: number
  maxTotalStake: number
  // Smart contract fields
  marketAddress?: string
  txHash?: string
  endTime?: number
  creatorFeeBps?: number
}

interface CreateMarketWizardProps {
  onClose: () => void
}

export function CreateMarketWizard({ onClose }: CreateMarketWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [marketData, setMarketData] = useState<MarketData>({
    pollUrl: "",
    platform: null,
    question: "",
    description: "",
    options: ["", ""],
    category: "other",
    endDate: null,
    creatorFee: 2,
    resolutionSource: "",
    identifier: "",
    // Default betting limits
    minBet: 1,
    maxBetPerUser: 1000,
    maxTotalStake: 10000,
  })

  const totalSteps = 4
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
    
    // If we're on step 4 and market hasn't been created yet, show message
    if (currentStep === 4 && !marketData.marketAddress) {
      alert("Please deploy your market to the blockchain first!")
      return
    }
    
    // Simulate API call for non-blockchain creation (fallback)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    alert("Market created successfully!")
    onClose()
  }

  const handleMarketCreated = (marketAddress: string, txHash: string) => {
    // Market was created on blockchain, update the data
    updateMarketData({ 
      marketAddress,
      txHash,
      endTime: marketData.endDate ? Math.floor(marketData.endDate.getTime() / 1000) : undefined,
      creatorFeeBps: Math.floor((marketData.creatorFee || 2) * 100)
    })
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
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

      {/* Progress Bar */}
      <Progress value={progress} className="h-2" />

      {/* Step Content */}
      <Card className="p-4 md:p-8 bg-card border-border overflow-hidden">
        <div className="max-h-[70vh] overflow-y-auto">
          {currentStep === 1 && <StepOne marketData={marketData} updateMarketData={updateMarketData} />}
          {currentStep === 2 && <StepTwo marketData={marketData} updateMarketData={updateMarketData} />}
          {currentStep === 3 && <StepThree marketData={marketData} updateMarketData={updateMarketData} />}
          {currentStep === 4 && <StepFour marketData={marketData} onCreateMarket={handleMarketCreated} />}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1} className="bg-transparent flex-1 md:flex-none">
          Back
        </Button>
        {currentStep < totalSteps ? (
          <Button onClick={handleNext} className="gold-gradient text-background font-semibold flex-1 md:flex-none">
            Continue
          </Button>
        ) : (
          <Button 
            onClick={handleCreate} 
            className="gold-gradient text-background font-semibold flex-1 md:flex-none"
            disabled={currentStep === 4 && !marketData.marketAddress}
          >
            {marketData.marketAddress ? "Finish" : "Create Market"}
          </Button>
        )}
      </div>
    </div>
  )
}
