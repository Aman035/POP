"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreateMarketWizard } from "@/components/create/create-market-wizard"
import { Sparkles, TrendingUp, DollarSign, Shield } from "lucide-react"

export default function CreateMarketPage() {
  const [showWizard, setShowWizard] = useState(false)

  if (showWizard) {
    return (
      <div className="max-w-6xl mx-auto px-4">
        <CreateMarketWizard onClose={() => setShowWizard(false)} />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 px-4">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-4">
          <Sparkles className="w-4 h-4 text-gold-2" />
          <span className="text-sm text-muted-foreground">Create your first market</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold">
          Turn Any Poll Into a <span className="gold-text">Prediction Market</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Paste a Twitter or Farcaster poll URL and create a prediction market in minutes. Earn fees on every bet.
        </p>
        <Button
          size="lg"
          className="gold-gradient text-background font-semibold text-lg"
          onClick={() => setShowWizard(true)}
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Create Market
        </Button>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-card border-border card-glow">
          <div className="w-12 h-12 rounded-lg gold-gradient flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-background" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Easy Setup</h3>
          <p className="text-muted-foreground">
            Just paste a poll URL and configure basic settings. Your market goes live in minutes.
          </p>
        </Card>

        <Card className="p-6 bg-card border-border card-glow">
          <div className="w-12 h-12 rounded-lg gold-gradient flex items-center justify-center mb-4">
            <DollarSign className="w-6 h-6 text-background" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Earn Fees</h3>
          <p className="text-muted-foreground">
            Set a creator fee (1-5%) and earn passive income on every bet placed in your market.
          </p>
        </Card>

        <Card className="p-6 bg-card border-border card-glow">
          <div className="w-12 h-12 rounded-lg gold-gradient flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-background" />
          </div>
          <h3 className="text-xl font-semibold mb-2">You Control</h3>
          <p className="text-muted-foreground">
            You decide the resolution criteria and resolve the market when the outcome is clear.
          </p>
        </Card>
      </div>

      {/* How It Works */}
      <Card className="p-8 bg-card border-border">
        <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: "1",
              title: "Paste Poll URL",
              description: "Copy a Twitter or Farcaster poll link",
            },
            {
              step: "2",
              title: "Configure Market",
              description: "Set question, options, and end date",
            },
            {
              step: "3",
              title: "Set Parameters",
              description: "Choose creator fee and resolution source",
            },
            {
              step: "4",
              title: "Launch & Earn",
              description: "Market goes live and you earn fees",
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center mx-auto mb-3 text-background font-bold text-xl">
                {item.step}
              </div>
              <h4 className="font-semibold mb-2">{item.title}</h4>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* CTA */}
      <Card className="p-8 bg-gradient-to-br from-card to-bg-4 border-border text-center">
        <h3 className="text-2xl font-bold mb-3">Ready to Create Your Market?</h3>
        <p className="text-muted-foreground mb-6">Join hundreds of creators earning from prediction markets</p>
        <Button size="lg" className="gold-gradient text-background font-semibold" onClick={() => setShowWizard(true)}>
          Get Started
        </Button>
      </Card>
    </div>
  )
}
