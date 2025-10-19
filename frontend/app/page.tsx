"use client"

import { PopLogo } from "@/components/branding/pop-logo"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import {
  TrendingUp,
  Zap,
  Shield,
  Users,
  BarChart3,
  Sparkles,
  ArrowRight,
  Twitter,
  MessageSquare,
  DollarSign,
  Clock,
  Award,
  Target,
} from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const features = [
    {
      icon: Zap,
      title: "Instant Markets",
      description: "Turn any social media poll into a prediction market in seconds. No complex setup required.",
    },
    {
      icon: Shield,
      title: "Secure & Transparent",
      description: "Built on Arbitrum with PYUSD collateral. All transactions are verifiable onchain.",
    },
    {
      icon: TrendingUp,
      title: "Real-Time Odds",
      description: "Watch odds update live as users place bets. Dynamic pricing based on market activity.",
    },
    {
      icon: Users,
      title: "Social Integration",
      description: "Seamlessly integrates with Twitter/X and Farcaster. Bet directly from your feed.",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Track your performance, ROI, and win rate. Leaderboards for top bettors and creators.",
    },
    {
      icon: Sparkles,
      title: "Creator Rewards",
      description: "Market creators earn fees on every bet. Build your reputation and earn passive income.",
    },
  ]

  const stats = [
    { label: "Active Markets", value: "1,234", icon: Target },
    { label: "24h Volume", value: "$45.2K", icon: DollarSign },
    { label: "Total Users", value: "8,901", icon: Users },
    { label: "Avg Resolution", value: "2.3h", icon: Clock },
  ]

  const platforms = [
    { name: "Twitter/X", icon: Twitter, color: "text-blue-400" },
    { name: "Farcaster", icon: MessageSquare, color: "text-purple-400" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PopLogo />
            <div>
              <h1 className="text-xl font-bold text-foreground">Predict on Posts</h1>
              <p className="text-xs text-muted-foreground">Micro-markets embedded in social</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/app">
              <Button variant="ghost" className="text-foreground">
                Markets
              </Button>
            </Link>
            <Link href="/app/leaderboard">
              <Button variant="ghost" className="text-foreground">
                Leaderboard
              </Button>
            </Link>
            <Link href="/app">
              <Button className="gold-gradient text-background font-semibold">Launch App</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-6">
              <Sparkles className="w-4 h-4 text-gold-2" />
              <span className="text-sm text-muted-foreground">Now live on Arbitrum</span>
            </div>

            <h2 className="text-5xl md:text-7xl font-bold mb-6 text-balance">
              Turn Social Polls Into <span className="gold-text">Prediction Markets</span>
            </h2>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
              POP transforms Twitter and Farcaster polls into onchain prediction markets. Bet with PYUSD, earn from your
              insights, and watch odds move in real-time.
            </p>

            <div className="flex items-center justify-center gap-4 mb-12">
              <Link href="/app">
                <Button
                  size="lg"
                  className="gold-gradient text-background font-semibold text-lg px-8 hover:opacity-90 transition-opacity"
                >
                  Open App
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/app/create">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-foreground border-border hover:bg-card bg-transparent"
                >
                  Create Market
                </Button>
              </Link>
            </div>

            {/* Platform Pills */}
            <div className="flex items-center justify-center gap-4">
              {platforms.map((platform) => (
                <div
                  key={platform.name}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border"
                >
                  <platform.icon className={`w-4 h-4 ${platform.color}`} />
                  <span className="text-sm text-foreground">{platform.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <Card className="p-6 bg-card border-border card-glow text-center">
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-gold-2" />
                <div className="text-3xl font-bold gold-text mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold mb-4">
            Everything You Need to <span className="gold-text">Predict & Profit</span>
          </h3>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A complete platform for creating, betting on, and resolving prediction markets from social media polls.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <Card className="p-6 bg-card border-border card-glow hover:border-gold-2/50 transition-colors h-full">
                <div className="w-12 h-12 rounded-lg gold-gradient flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-background" />
                </div>
                <h4 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h4>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold mb-4">
            How <span className="gold-text">POP</span> Works
          </h3>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">From poll to payout in three simple steps</p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Create or Find",
              description: "Paste a poll URL to create a market, or browse existing markets from your feed.",
            },
            {
              step: "02",
              title: "Place Your Bet",
              description: "Stake PYUSD on your prediction. Watch odds update in real-time as others bet.",
            },
            {
              step: "03",
              title: "Claim Rewards",
              description: "When the market resolves, winners claim their share of the pool plus earnings.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="relative"
            >
              <div className="text-6xl font-bold gold-text opacity-20 mb-4">{item.step}</div>
              <h4 className="text-2xl font-semibold mb-3 text-foreground">{item.title}</h4>
              <p className="text-muted-foreground">{item.description}</p>
              {i < 2 && <ArrowRight className="hidden md:block absolute -right-8 top-12 w-6 h-6 text-gold-2" />}
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="p-12 bg-gradient-to-br from-card to-bg-4 border-border card-glow text-center">
          <Award className="w-16 h-16 mx-auto mb-6 text-gold-2" />
          <h3 className="text-4xl font-bold mb-4">
            Ready to Start <span className="gold-text">Predicting?</span>
          </h3>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users turning their insights into profits. No signup required—just connect your wallet and
            start betting.
          </p>
          <Link href="/app">
            <Button
              size="lg"
              className="gold-gradient text-background font-semibold text-lg px-12 hover:opacity-90 transition-opacity"
            >
              Open App
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <PopLogo className="scale-75" />
              <div>
                <p className="text-sm text-muted-foreground">Experimental app. For demonstration only.</p>
                <p className="text-xs text-muted-foreground">Not an offer to gamble. Use where permitted.</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/app" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Markets
              </Link>
              <Link
                href="/app/create"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Create
              </Link>
              <Link
                href="/app/leaderboard"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Leaderboard
              </Link>
              <Link
                href="/app/settings"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
