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

interface MarketData {
  pollUrl: string
  platform: "twitter" | "farcaster" | null
  question: string
  description: string
  options: string[]
  category: string
  endDate: Date | null
  creatorFee: number
  resolutionSource: string
  // Smart contract fields
  marketAddress?: string
  txHash?: string
  identifier?: string
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
      identifier: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      endTime: marketData.endDate ? Math.floor(marketData.endDate.getTime() / 1000) : undefined,
      creatorFeeBps: Math.floor((marketData.creatorFee || 2) * 100)
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Market</h1>
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
      <Card className="p-8 bg-card border-border">
        {currentStep === 1 && <StepOne marketData={marketData} updateMarketData={updateMarketData} />}
        {currentStep === 2 && <StepTwo marketData={marketData} updateMarketData={updateMarketData} />}
        {currentStep === 3 && <StepThree marketData={marketData} updateMarketData={updateMarketData} />}
        {currentStep === 4 && <StepFour marketData={marketData} onCreateMarket={handleMarketCreated} />}
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1} className="bg-transparent">
          Back
        </Button>
        {currentStep < totalSteps ? (
          <Button onClick={handleNext} className="gold-gradient text-background font-semibold">
            Continue
          </Button>
        ) : (
          <Button 
            onClick={handleCreate} 
            className="gold-gradient text-background font-semibold"
            disabled={currentStep === 4 && !marketData.marketAddress}
          >
            {marketData.marketAddress ? "Finish" : "Create Market"}
          </Button>
        )}
      </div>
    </div>
  )
}
