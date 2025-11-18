import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  CheckCircle2,
  Twitter,
  MessageSquare,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  ExternalLink,
  Copy,
  CheckCircle,
  Shield,
  Target,
  Users,
  Zap,
  Loader2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCreateMarket } from '@/hooks/contracts/use-contracts'
import { NETWORK_CONFIG } from '@/lib/contracts'
import { toast } from '@/hooks/utils/use-toast'
import { Platform } from '@/lib/types'
import { useEthBalance } from '@/hooks/wallet/use-eth-balance'
import { parseUnits } from 'viem'
import { MarketCreationProgress } from '../market-creation-progress'

interface StepFourProps {
  marketData: any
  onCreateMarket?: (marketAddress: string, txHash: string) => void
}

export function StepFour({ marketData, onCreateMarket }: StepFourProps) {
  const {
    createMarket,
    loading: creatingMarket,
    error: createError,
    hash,
    isConfirmed,
    marketAddress: hookMarketAddress,
  } = useCreateMarket()
  const [isCreating, setIsCreating] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [marketAddress, setMarketAddress] = useState<string | null>(null)
  const [contractAddress, setContractAddress] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [creationStep, setCreationStep] = useState<'idle' | 'preparing' | 'submitting' | 'confirming' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // ETH balance hooks
  const {
    balance,
    balanceFormatted,
    hasInsufficientBalance,
    isLoading: balanceLoading,
    error: balanceError,
    refreshBalance,
  } = useEthBalance()

  const PlatformIcon =
    marketData.platform === Platform.Twitter
      ? Twitter
      : marketData.platform === Platform.Farcaster
      ? MessageSquare
      : MessageSquare // Default fallback


  const handleCreateMarket = async (forceContinue = false) => {
    console.log('Launch Prediction Market button clicked!')
    console.log('Market data:', marketData)
    console.log('hasInsufficientBalance:', hasInsufficientBalance)
    console.log('balanceFormatted:', balanceFormatted)
    console.log('forceContinue:', forceContinue)

    if (
      !marketData.question ||
      !marketData.description ||
      marketData.options.length < 2
    ) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    // Check if all options are filled
    const emptyOptions = marketData.options.some(
      (option: string) => !option.trim()
    )
    if (emptyOptions) {
      toast({
        title: 'Empty Options',
        description: 'Please fill in all market options',
        variant: 'destructive',
      })
      return
    }

    if (!marketData.endDate) {
      toast({
        title: 'Missing End Date',
        description: 'Please set an end date for your market',
        variant: 'destructive',
      })
      return
    }

    // Refresh balance before checking to ensure we have the latest balance
    await refreshBalance()
    
    // Wait a bit for balance to update
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Re-check balance after refresh
    const currentBalance = parseFloat(balanceFormatted)
    const minimumRequired = 0.001
    const actuallyHasInsufficientBalance = currentBalance < minimumRequired || (balanceLoading && currentBalance === 0)
    
    console.log('Balance check:', {
      balanceFormatted,
      currentBalance,
      minimumRequired,
      actuallyHasInsufficientBalance,
      balanceLoading,
      hasInsufficientBalance
    })

    // Only show warning, don't block - let the blockchain handle the actual check
    if (actuallyHasInsufficientBalance && !forceContinue) {
      toast({
        title: '⚠️ Low ETH Balance Warning',
        description:
          `You have ${balanceFormatted} ETH. You may need at least 0.001 ETH for gas fees. The transaction will fail if you don't have enough.`,
        variant: 'destructive',
      })
      // Don't return - let the user proceed, blockchain will reject if insufficient
    }

    try {
      setIsCreating(true)
      setCreationStep('preparing')
      setErrorMessage(null) // Reset error state

      // Step 1: Preparing market parameters
      toast({
        title: '📋 Preparing Market',
        description: 'Validating market parameters and preparing transaction...',
      })

      // Convert endDate to timestamp
      const endTime = Math.floor(marketData.endDate.getTime() / 1000)

      // Convert creator fee percentage to basis points
      const creatorFeeBps = Math.floor((marketData.creatorFee || 2) * 100) // Convert percentage to basis points

      // Generate a unique identifier string if not provided
      const identifier =
        marketData.identifier ||
        `market_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const marketParams = {
        identifier,
        options: marketData.options.filter((option: string) => option.trim()),
        endTime,
        creatorFeeBps,
        question: marketData.question,
        description: marketData.description,
        category: marketData.category || 'other',
        platform: marketData.platform || 0, // Default to Platform.Twitter
        resolutionSource: marketData.resolutionSource || '',
      }

      console.log('🔄 Calling createMarket with params:', marketParams)

      // Step 2: Submitting transaction
      setCreationStep('submitting')
      toast({
        title: '💼 Submitting Transaction',
        description: 'Please confirm the transaction in your wallet...',
      })

      const result = await createMarket(marketParams)
      console.log('✅ createMarket result:', result)

      if (result) {
        // Transaction was submitted to wallet - hash will come from hook state
        // Set step to confirming and wait for hash from hook
        setCreationStep('confirming')
        toast({
          title: '⏳ Transaction Submitted',
          description: 'Waiting for transaction hash...',
        })
        
        // The hash will be set by wagmi after user confirms in wallet
        // The useEffect below will handle updating txHash when hash becomes available
      } else {
        throw new Error('Failed to create market')
      }
    } catch (error: any) {
      console.error('❌ Error creating market:', error)
      setCreationStep('error')

      let errorMsg = 'An unknown error occurred'
      let errorDetails = ''
      
      if (error instanceof Error) {
        errorMsg = error.message
        errorDetails = error.stack || ''
      } else if (typeof error === 'string') {
        errorMsg = error
      } else if (error?.message) {
        errorMsg = error.message
        errorDetails = error.cause?.message || error.reason || ''
      } else if (error?.error?.message) {
        errorMsg = error.error.message
      }

      // Log full error for debugging
      console.error('Full error object:', {
        error,
        message: errorMsg,
        details: errorDetails,
        name: error?.name,
        code: error?.code,
      })

      // Handle specific error types
      let userFriendlyMessage = errorMsg
      
      if (
        errorMsg.includes(
          'External transactions to internal accounts cannot include data'
        )
      ) {
        userFriendlyMessage =
          'Wallet connection issue. Please disconnect and reconnect your wallet, then try again.'
      } else if (errorMsg.includes('wallet_sendTransaction')) {
        userFriendlyMessage =
          'MetaMask connection issue. Please refresh the page and try again.'
      } else if (errorMsg.includes('User rejected') || errorMsg.includes('user rejected') || errorMsg.includes('User denied')) {
        userFriendlyMessage = 'Transaction was cancelled by user.'
      } else if (errorMsg.includes('insufficient funds') || errorMsg.includes('insufficient balance')) {
        userFriendlyMessage =
          'Insufficient funds for transaction. Please add ETH to your wallet.'
      } else if (
        errorMsg.includes('Wallet address is the same as contract address')
      ) {
        userFriendlyMessage =
          'Wallet connection error detected. Please follow these steps:\n1. Disconnect your wallet from the app\n2. Refresh the page\n3. Reconnect your wallet\n4. Try creating the market again'
      } else if (errorMsg.includes('revert') || errorMsg.includes('execution reverted')) {
        // Try to extract revert reason
        const revertMatch = errorMsg.match(/revert\s+(.+)/i) || errorDetails.match(/revert\s+(.+)/i)
        if (revertMatch) {
          userFriendlyMessage = `Transaction failed: ${revertMatch[1]}`
        } else {
          userFriendlyMessage = 'Transaction failed. The contract rejected the transaction. Please check your inputs and try again.'
        }
      } else if (errorMsg.includes('nonce')) {
        userFriendlyMessage = 'Transaction nonce error. Please try again in a moment.'
      } else if (errorMsg.includes('gas') || errorMsg.includes('Gas')) {
        userFriendlyMessage = 'Gas estimation failed. Please try again or check your wallet settings.'
      } else if (errorMsg.includes('network') || errorMsg.includes('Network')) {
        userFriendlyMessage = 'Network error. Please check your connection and try again.'
      }

      setErrorMessage(userFriendlyMessage)

      toast({
        title: '❌ Transaction Failed',
        description: userFriendlyMessage,
        variant: 'destructive',
        duration: 10000, // Show for 10 seconds
      })
    } finally {
      setIsCreating(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: 'Copied!',
        description: 'Address copied to clipboard',
      })
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const isMarketCreated = marketAddress || hookMarketAddress || marketData.marketAddress

  // Update txHash when hash becomes available from hook
  useEffect(() => {
    if (hash && !txHash) {
      setTxHash(hash)
      if (creationStep === 'confirming') {
        toast({
          title: '⏳ Transaction Hash Received',
          description: `Transaction hash: ${hash.slice(0, 10)}... Waiting for confirmation...`,
        })
      }
    }
  }, [hash, txHash, creationStep])

  // Watch for market address when it becomes available (even after confirmation)
  useEffect(() => {
    if (hookMarketAddress && !marketAddress) {
      setMarketAddress(hookMarketAddress)
      setContractAddress(hookMarketAddress)
      
      // Ensure step is set to success if transaction is confirmed
      if (isConfirmed && creationStep !== 'success') {
        setCreationStep('success')
      }

      toast({
        title: '🎉 Market Created Successfully!',
        description: `Your market has been deployed at ${hookMarketAddress.slice(0, 10)}...`,
      })

      // Call the callback if provided
      if (onCreateMarket && hash) {
        onCreateMarket(hookMarketAddress, hash)
      }
    }
  }, [hookMarketAddress, marketAddress, isConfirmed, hash, onCreateMarket, creationStep])

  // Watch for errors from the hook
  useEffect(() => {
    if (createError && creationStep !== 'success') {
      console.error('❌ Create market error from hook:', createError)
      setCreationStep('error')
      setErrorMessage(createError)
      
      let userFriendlyMessage = createError
      
      // Parse common error messages
      if (createError.includes('User rejected') || createError.includes('user rejected')) {
        userFriendlyMessage = 'Transaction was cancelled by user.'
      } else if (createError.includes('insufficient funds') || createError.includes('insufficient balance')) {
        userFriendlyMessage = 'Insufficient funds for transaction. Please add ETH to your wallet.'
      } else if (createError.includes('revert') || createError.includes('execution reverted')) {
        // Try to extract the revert reason
        const revertMatch = createError.match(/revert\s+(.+)/i)
        if (revertMatch) {
          userFriendlyMessage = `Transaction failed: ${revertMatch[1]}`
        } else {
          userFriendlyMessage = 'Transaction failed. Please check your inputs and try again.'
        }
      } else if (createError.includes('nonce')) {
        userFriendlyMessage = 'Transaction nonce error. Please try again.'
      } else if (createError.includes('gas')) {
        userFriendlyMessage = 'Gas estimation failed. Please try again or increase gas limit.'
      }
      
      toast({
        title: '❌ Transaction Failed',
        description: userFriendlyMessage,
        variant: 'destructive',
        duration: 10000, // Show for 10 seconds
      })
    }
  }, [createError, creationStep])

  // Handle transaction confirmation and market address extraction
  useEffect(() => {
    if (isConfirmed && hash) {
      // Update transaction hash if not set
      if (!txHash) {
        setTxHash(hash)
      }

      // Update step to success when transaction is confirmed
      // Don't wait for market address - it might be extracted later
      if (creationStep !== 'success' && creationStep !== 'error') {
        setCreationStep('success')
        setErrorMessage(null)
      }

      // Use market address from hook if available
      if (hookMarketAddress && !marketAddress) {
        setMarketAddress(hookMarketAddress)
        setContractAddress(hookMarketAddress)

        toast({
          title: '🎉 Market Created Successfully!',
          description: `Your market has been deployed at ${hookMarketAddress.slice(0, 10)}...`,
        })

        // Call the callback if provided
        if (onCreateMarket) {
          onCreateMarket(hookMarketAddress, hash)
        }
      } else if (!marketAddress && creationStep === 'success') {
        // Transaction confirmed but still waiting for market address
        toast({
          title: '✅ Transaction Confirmed',
          description: 'Extracting market address from transaction receipt...',
        })
      }
    }
  }, [isConfirmed, hash, hookMarketAddress, marketAddress, txHash, onCreateMarket, creationStep])

  // Bridge functionality removed - use standard bridge methods

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-background" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Review Your Market</h2>
        <p className="text-muted-foreground">
          Double-check everything before creating your market
        </p>
      </div>

      <div className="space-y-4">
        {/* Platform */}
        <Card className="p-4 bg-background border-border">
          <div className="flex items-center gap-3">
            <PlatformIcon className="w-5 h-5 text-gold-2" />
            <div>
              <p className="text-sm text-muted-foreground">Platform</p>
              <p className="font-medium">
                {marketData.platform === Platform.Twitter
                  ? 'Twitter/X'
                  : marketData.platform === Platform.Farcaster
                  ? 'Farcaster'
                  : 'Other'}
              </p>
            </div>
          </div>
        </Card>

        {/* Question */}
        <Card className="p-4 bg-background border-border">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-gold-2 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Question</p>
              <p className="font-medium mb-2">{marketData.question}</p>
              <p className="text-sm text-muted-foreground">
                {marketData.description}
              </p>
            </div>
          </div>
        </Card>

        {/* Options */}
        <Card className="p-4 bg-background border-border">
          <p className="text-sm text-muted-foreground mb-3">Options</p>
          <div className="space-y-2">
            {marketData.options.map((option: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <Badge variant="secondary">
                  {option || `Option ${index + 1}`}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-4 bg-background border-border">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gold-2" />
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="font-medium">
                  {marketData.endDate
                    ? format(marketData.endDate, "PPP 'at' p")
                    : 'Not set'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-background border-border">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-gold-2" />
              <div>
                <p className="text-sm text-muted-foreground">Creator Fee</p>
                <p className="font-medium">{marketData.creatorFee}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Resolution Source */}
        <Card className="p-4 bg-background border-border">
          <p className="text-sm text-muted-foreground mb-2">
            Resolution Source
          </p>
          <p className="text-sm">{marketData.resolutionSource}</p>
        </Card>

        {/* Current Balance Status */}
        <Card className="p-4 bg-background border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  hasInsufficientBalance ? 'bg-red-500/10' : 'bg-green-500/10'
                }`}
              >
                {balanceLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : hasInsufficientBalance ? (
                  <Clock className="w-4 h-4 text-red-500" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">ETH Balance</p>
                <p className="text-lg font-bold">{balanceFormatted} ETH</p>
              </div>
            </div>
            {hasInsufficientBalance && (
              <Badge variant="destructive" className="text-xs">
                Insufficient Balance
              </Badge>
            )}
          </div>

          {hasInsufficientBalance && (
            <div className="relative p-4 rounded-xl bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-yellow-500/15 backdrop-blur-sm border-2 border-orange-500/30 shadow-lg">
              {/* Glass effect overlay */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
              
              <div className="relative flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-orange-500/30 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <span className="text-sm font-bold text-orange-700 dark:text-orange-300">
                    Auto-Bridge Available
                  </span>
                  <div className="w-2 h-2 bg-orange-600 rounded-full ml-2 inline-block" />
                </div>
              </div>
              
              <p className="text-sm font-medium text-black dark:text-black leading-relaxed">
                We'll automatically bridge ETH from another chain when you
                launch your market.
              </p>
            </div>
          )}
        </Card>

        {/* Smart Contract Creation */}
        {!isMarketCreated ? (
          <>
            {/* Progress Bar - Show when creating (including success state before transition) */}
            {creationStep !== 'idle' && (
              <MarketCreationProgress
                step={creationStep}
                txHash={txHash || hash || null}
                marketAddress={marketAddress || hookMarketAddress || null}
                errorMessage={errorMessage || createError || null}
                isConfirmed={isConfirmed}
              />
            )}

            {/* Launch Button - Show when not creating or on error */}
            {(creationStep === 'idle' || creationStep === 'error') && (
              <Card className="p-6 bg-background border-border">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-gold-2/10 flex items-center justify-center mx-auto">
                    <Clock className="w-6 h-6 text-gold-2" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Launch Your Prediction Market
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Deploy your market to the blockchain and start accepting
                      predictions.{' '}
                      {hasInsufficientBalance
                        ? 'Bridge ETH from another chain first.'
                        : 'No upfront costs required.'}
                    </p>
                  </div>

                  {/* Show error if transaction failed */}
                  {creationStep === 'error' && errorMessage && (
                    <Alert className="mb-4 border-red-500 bg-red-50 dark:bg-red-950/20">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800 dark:text-red-200">
                        <div className="font-semibold mb-1">Transaction Failed</div>
                        <div>{errorMessage}</div>
                        {createError && createError !== errorMessage && (
                          <div className="mt-2 text-xs opacity-75">
                            Technical details: {createError}
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Show warning if balance is low, but don't block */}
                  {hasInsufficientBalance && parseFloat(balanceFormatted) < 0.001 && creationStep !== 'error' ? (
                    <Alert className="mb-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-800 dark:text-orange-200">
                        Low ETH balance: {balanceFormatted} ETH. You may need at least 0.001 ETH for gas fees.
                        The transaction will fail if you don't have enough.
                      </AlertDescription>
                    </Alert>
                  ) : null}
                  
                  <Button
                    onClick={() => handleCreateMarket()}
                    disabled={isCreating || creatingMarket || balanceLoading}
                    className="w-full gold-gradient text-background font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    size="lg"
                    style={{
                      opacity: isCreating || creatingMarket || balanceLoading ? 0.5 : 1,
                      cursor:
                        isCreating || creatingMarket || balanceLoading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isCreating || creatingMarket ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Launching Market...
                      </>
                    ) : balanceLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Checking Balance...
                      </>
                    ) : (
                      'Launch Your Prediction Market'
                    )}
                  </Button>
                </div>
              </Card>
            )}
          </>
        ) : (
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-500/30">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 text-green-600">
                  🎉 Market Launched Successfully!
                </h3>
                <p className="text-muted-foreground mb-6">
                  Your prediction market is now live on the blockchain and ready
                  to accept predictions
                </p>
              </div>

              {/* Enhanced Stats Display */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-background/80 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Target className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground">
                        Creator Fee
                      </p>
                      <p className="text-lg font-bold text-foreground">
                        {marketData.creatorFee}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-background/80 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground">End Date</p>
                      <p className="text-sm font-semibold text-foreground">
                        {marketData.endDate
                          ? format(marketData.endDate, "MMM dd, yyyy 'at' p")
                          : 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-background/80 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold-2/10 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-gold-2" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground">Platform</p>
                      <p className="text-sm font-semibold text-foreground">
                        {marketData.platform === 0
                          ? 'Twitter/X'
                          : marketData.platform === 1
                          ? 'Farcaster'
                          : 'Other'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Market Details */}
              <div className="space-y-4">
                {/* Contract Address */}
                <div className="p-4 rounded-lg bg-background/80 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-foreground">
                      Market Contract Address
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            contractAddress ||
                              marketAddress ||
                              marketData.marketAddress
                          )
                        }
                        className="h-6 px-2"
                      >
                        {copied ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          window.open(
                            `${NETWORK_CONFIG.blockExplorer}/address/${
                              contractAddress ||
                              marketAddress ||
                              marketData.marketAddress
                            }`,
                            '_blank'
                          )
                        }
                        className="h-6 px-2"
                        title="View Contract on BSCScan"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <code className="text-xs font-mono text-muted-foreground break-all">
                    {contractAddress ||
                      marketAddress ||
                      marketData.marketAddress}
                  </code>
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(
                          `${NETWORK_CONFIG.blockExplorer}/address/${
                            contractAddress ||
                            marketAddress ||
                            marketData.marketAddress
                          }`,
                          '_blank'
                        )
                      }
                      className="w-full"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Contract on BSCScan
                    </Button>
                  </div>
                </div>

                {/* Transaction Hash */}
                {txHash && (
                  <div className="p-4 rounded-lg bg-background/80 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-foreground">
                        Transaction Hash
                      </p>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(txHash)}
                          className="h-6 px-2"
                        >
                          {copied ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            window.open(
                              `${NETWORK_CONFIG.blockExplorer}/tx/${txHash}`,
                              '_blank'
                            )
                          }
                          className="h-6 px-2"
                          title="View Transaction on BSCScan"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <code className="text-xs font-mono text-muted-foreground break-all">
                      {txHash}
                    </code>
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(
                            `${NETWORK_CONFIG.blockExplorer}/tx/${txHash}`,
                            '_blank'
                          )
                        }
                        className="w-full"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Transaction on BSCScan
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Next Steps */}
              <div className="p-4 rounded-lg bg-gold-2/10 border border-gold-2/20">
                <h4 className="font-semibold text-foreground mb-2">
                  What's Next?
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 text-left">
                  <li>• Share your market link to attract participants</li>
                  <li>• Monitor betting activity and market sentiment</li>
                  <li>• Resolve the market when the end date arrives</li>
                </ul>
              </div>
            </div>
          </Card>
        )}


      </div>
    </div>
  )
}
