"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X } from "lucide-react"

interface StepTwoProps {
  marketData: any
  updateMarketData: (updates: any) => void
}

export function StepTwo({ marketData, updateMarketData }: StepTwoProps) {
  const addOption = () => {
    updateMarketData({ options: [...marketData.options, ""] })
  }

  const removeOption = (index: number) => {
    if (marketData.options.length > 2) {
      const newOptions = marketData.options.filter((_: any, i: number) => i !== index)
      updateMarketData({ options: newOptions })
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...marketData.options]
    newOptions[index] = value
    updateMarketData({ options: newOptions })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Market Details</h2>
        <p className="text-muted-foreground">Configure your prediction market question and options</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="question">Market Question</Label>
          <Input
            id="question"
            placeholder="Will Bitcoin reach $100k by end of 2025?"
            value={marketData.question}
            onChange={(e) => updateMarketData({ question: e.target.value })}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe the resolution criteria and any important details..."
            value={marketData.description}
            onChange={(e) => updateMarketData({ description: e.target.value })}
            className="mt-2 min-h-[100px]"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Be specific about how and when the market will be resolved
          </p>
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={marketData.category} onValueChange={(value) => updateMarketData({ category: value })}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="z-[999999] bg-background border border-border shadow-2xl backdrop-blur-sm" side="bottom" align="start" sideOffset={4}>
              <SelectItem value="crypto" className="text-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">Crypto</SelectItem>
              <SelectItem value="tech" className="text-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">Tech</SelectItem>
              <SelectItem value="finance" className="text-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">Finance</SelectItem>
              <SelectItem value="science" className="text-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">Science</SelectItem>
              <SelectItem value="health" className="text-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">Health</SelectItem>
              <SelectItem value="sports" className="text-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">Sports</SelectItem>
              <SelectItem value="politics" className="text-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">Politics</SelectItem>
              <SelectItem value="other" className="text-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Market Options</Label>
          <div className="space-y-2 mt-2">
            {marketData.options.map((option: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="flex-1"
                />
                {marketData.options.length > 2 && (
                  <Button variant="ghost" size="icon" onClick={() => removeOption(index)} className="shrink-0">
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          {marketData.options.length < 5 && (
            <Button variant="outline" size="sm" onClick={addOption} className="mt-2 bg-transparent w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Option
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
