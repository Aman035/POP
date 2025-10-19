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
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    alert("Market created successfully!")
    onClose()
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
        {currentStep === 4 && <StepFour marketData={marketData} />}
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
          <Button onClick={handleCreate} className="gold-gradient text-background font-semibold">
            Create Market
          </Button>
        )}
      </div>
    </div>
  )
}
