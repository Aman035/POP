'use client'

import { useEffect, useState } from 'react'
import {
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  ExternalLink,
  Copy,
  CheckCircle,
  FileText,
  Zap,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/utils/use-toast'
import { NETWORK_CONFIG } from '@/lib/contracts'

interface MarketCreationProgressProps {
  step: 'idle' | 'preparing' | 'submitting' | 'confirming' | 'success' | 'error'
  txHash?: string | null
  marketAddress?: string | null
  errorMessage?: string | null
  isConfirmed?: boolean
  onClose?: () => void
}

const STEPS = [
  { id: 'preparing', label: 'Preparing Market', description: 'Validating parameters and preparing transaction' },
  { id: 'submitting', label: 'Submitting Transaction', description: 'Waiting for wallet confirmation' },
  { id: 'confirming', label: 'Confirming Transaction', description: 'Waiting for blockchain confirmation' },
  { id: 'success', label: 'Market Created', description: 'Your market is now live on the blockchain' },
]

export function MarketCreationProgress({
  step,
  txHash,
  marketAddress,
  errorMessage,
  isConfirmed,
  onClose,
}: MarketCreationProgressProps) {
  const [copied, setCopied] = useState<'tx' | 'address' | null>(null)
  const [progress, setProgress] = useState(0)

  // Determine actual step - if transaction is confirmed but step is still 'confirming', upgrade to 'success'
  const actualStep = (isConfirmed && step === 'confirming') ? 'success' : step

  // Calculate progress based on step
  useEffect(() => {
    switch (actualStep) {
      case 'preparing':
        setProgress(25)
        break
      case 'submitting':
        setProgress(50)
        break
      case 'confirming':
        setProgress(75)
        break
      case 'success':
        setProgress(100)
        break
      case 'error':
        setProgress(0)
        break
      default:
        setProgress(0)
    }
  }, [actualStep])

  const copyToClipboard = async (text: string, type: 'tx' | 'address') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
      toast({
        title: 'Copied!',
        description: `${type === 'tx' ? 'Transaction hash' : 'Market address'} copied to clipboard`,
      })
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getBlockExplorerUrl = (hash: string, type: 'tx' | 'address') => {
    const baseUrl = NETWORK_CONFIG.blockExplorer || 'https://testnet.bscscan.com'
    return `${baseUrl}/${type}/${hash}`
  }

  const getStepIndex = () => {
    switch (actualStep) {
      case 'preparing':
        return 0
      case 'submitting':
        return 1
      case 'confirming':
        return 2
      case 'success':
        return 3
      default:
        return -1
    }
  }

  const currentStepIndex = getStepIndex()

  if (actualStep === 'idle') {
    return null
  }

  return (
    <Card className="p-6 bg-background border-border shadow-lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Creating Your Market</h3>
            <p className="text-sm text-muted-foreground">
              {actualStep === 'error' ? 'Transaction failed' : 'Please wait while we deploy your market'}
            </p>
          </div>
          {actualStep === 'success' && onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <CheckCircle2 className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        {actualStep !== 'error' && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {progress}% Complete
            </p>
          </div>
        )}

        {/* Steps */}
        <div className="space-y-4">
          {STEPS.map((stepItem, index) => {
            const isActive = index === currentStepIndex && actualStep !== 'success'
            const isCompleted = index < currentStepIndex || actualStep === 'success'
            const isPending = index > currentStepIndex && actualStep !== 'success'

            return (
              <div key={stepItem.id} className="flex items-start gap-4">
                {/* Step Icon */}
                <div className="flex-shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isActive ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`text-sm font-medium ${
                        isCompleted
                          ? 'text-green-600 dark:text-green-400'
                          : isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {stepItem.label}
                    </h4>
                    {isCompleted && (
                      <Badge variant="outline" className="text-xs">
                        Complete
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stepItem.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Transaction Hash */}
        {txHash && (
          <Card className="p-4 bg-muted/50 border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-medium">Transaction Hash</p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(txHash, 'tx')}
                  className="h-6 px-2"
                >
                  {copied === 'tx' ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(getBlockExplorerUrl(txHash, 'tx'), '_blank')}
                  className="h-6 px-2"
                  title="View on BSCScan"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <code className="text-xs font-mono text-muted-foreground break-all block">
              {txHash}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(getBlockExplorerUrl(txHash, 'tx'), '_blank')}
              className="w-full mt-2"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Transaction on BSCScan
            </Button>
          </Card>
        )}

        {/* Market Address */}
        {marketAddress && (
          <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-600" />
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Market Address
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(marketAddress, 'address')}
                  className="h-6 px-2"
                >
                  {copied === 'address' ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(getBlockExplorerUrl(marketAddress, 'address'), '_blank')}
                  className="h-6 px-2"
                  title="View on BSCScan"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <code className="text-xs font-mono text-green-800 dark:text-green-200 break-all block">
              {marketAddress}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(getBlockExplorerUrl(marketAddress, 'address'), '_blank')}
              className="w-full mt-2 border-green-300 dark:border-green-700"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Contract on BSCScan
            </Button>
          </Card>
        )}

        {/* Error Message */}
        {actualStep === 'error' && errorMessage && (
          <Card className="p-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
                  Transaction Failed
                </h4>
                <p className="text-sm text-red-800 dark:text-red-200">
                  {errorMessage}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Success Message */}
        {actualStep === 'success' && (
          <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
                  Market Created Successfully!
                </h4>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Your prediction market is now live on the blockchain and ready to accept predictions.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Card>
  )
}

