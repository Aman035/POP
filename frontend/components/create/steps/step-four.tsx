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
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCreateMarket } from '@/hooks/contracts/use-contracts'
import { toast } from '@/hooks/utils/use-toast'
import { Platform } from '@/lib/types'
import { useEthBalance } from '@/hooks/wallet/use-eth-balance'
import {
  BridgeButton,
  BridgeAndExecuteButton,
  TOKEN_CONTRACT_ADDRESSES,
  TOKEN_METADATA,
  SUPPORTED_CHAINS,
  type SUPPORTED_TOKENS,
  type SUPPORTED_CHAINS_IDS,
} from '@avail-project/nexus-widgets'
import { parseUnits } from 'viem'

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
  } = useCreateMarket()
  const [isCreating, setIsCreating] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [marketAddress, setMarketAddress] = useState<string | null>(null)
  const [contractAddress, setContractAddress] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showManualBridge, setShowManualBridge] = useState(false)
  const [showBridgePopup, setShowBridgePopup] = useState(false)
  const [availableFunds, setAvailableFunds] = useState<any[]>([])
  const [selectedChain, setSelectedChain] = useState<string>('')

  // Note: Bridge state management removed - Nexus widgets handle their own state

  // ETH balance and Nexus SDK hooks
  const {
    balance,
    balanceFormatted,
    hasInsufficientBalance,
    isLoading: balanceLoading,
    error: balanceError,
    isBridging,
    bridgeError,
    bridgeSuccess,
    availableChains,
    bridgeEthFromOtherChain,
    getAvailableChains,
    refreshBalance,
  } = useEthBalance()

  // Note: Nexus widgets handle their own SDK internally

  // const nexusWidget = useNexusWidget();

  const PlatformIcon =
    marketData.platform === Platform.Twitter
      ? Twitter
      : marketData.platform === Platform.Farcaster
      ? MessageSquare
      : MessageSquare // Default fallback

  // Check for available funds on other chains
  const checkForAvailableFunds = async () => {
    try {
      console.log('Checking for available funds on other chains...')

      // For now, just show manual bridge options
      // The Nexus widgets will handle their own balance checking
      console.log('Showing manual bridge options')
      setShowManualBridge(true)

      toast({
        title: 'Bridge Options Available',
        description:
          'Use the Nexus widgets below to bridge funds from other chains.',
      })
    } catch (error) {
      console.error('Error checking for funds:', error)
      // Fallback to manual bridge options
      setShowManualBridge(true)

      toast({
        title: 'Error Checking Funds',
        description:
          'Failed to check balances on other chains. Using manual bridge options.',
        variant: 'destructive',
      })
    }
  }

  // Helper function to get chain name from chain ID (Nexus Testnet supported chains)
  const getChainName = (chainId: number): string => {
    const chainNames: { [key: number]: string } = {
      // Nexus Testnet supported chains
      11155420: 'Optimism Sepolia',
      80002: 'Polygon Amoy',
      421614: 'Arbitrum Sepolia',
      84532: 'Base Sepolia',
      11155111: 'Sepolia',
      10143: 'Monad Testnet',
      // Additional chains for reference
      1: 'Ethereum Mainnet',
      42161: 'Arbitrum One',
      8453: 'Base Mainnet',
      137: 'Polygon Mainnet',
      80001: 'Polygon Mumbai',
    }
    return chainNames[chainId] || `Chain ${chainId}`
  }

  // Handle bridge confirmation using real Nexus SDK
  const handleBridgeConfirm = async () => {
    if (!selectedChain) {
      toast({
        title: 'Please select a chain',
        description: 'Choose which chain to bridge from',
        variant: 'destructive',
      })
      return
    }

    // Note: Nexus widgets handle their own initialization

    try {
      // Find the selected asset from available funds
      const selectedAsset = availableFunds.find(
        (fund) => fund.chain === selectedChain
      )
      if (!selectedAsset) {
        toast({
          title: 'Asset Not Found',
          description: 'Selected asset not found. Please try again.',
          variant: 'destructive',
        })
        return
      }

      console.log(
        `Bridge requested for ${selectedAsset.balance} from ${selectedChain}`
      )

      toast({
        title: '🔄 Bridge Requested',
        description: `Please use the Nexus widgets below to bridge ${selectedAsset.balance} to Arbitrum Sepolia.`,
      })

      // Close the popup and let user use the widgets
      setShowBridgePopup(false)
    } catch (error) {
      console.error('Bridge failed:', error)
      toast({
        title: '❌ Bridge Failed',
        description: `Could not bridge funds: ${
          error instanceof Error ? error.message : 'Unknown error'
        }. Please try again or use manual options.`,
        variant: 'destructive',
      })
    }
  }

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

    // If user has insufficient balance, check for funds on other chains
    if (hasInsufficientBalance && !forceContinue) {
      console.log(
        'Insufficient balance detected, checking for funds on other chains...'
      )

      // Show manual bridge options directly
      setShowManualBridge(true)

      // Also try to check for available funds
      checkForAvailableFunds()

      return
    }

    // Show warning if proceeding without sufficient balance
    if (hasInsufficientBalance && forceContinue) {
      toast({
        title: '⚠️ Insufficient ETH Balance',
        description:
          "You're proceeding without sufficient ETH. You'll need to get ETH before the transaction can be confirmed.",
        variant: 'destructive',
      })
    }

    try {
      setIsCreating(true)

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

      toast({
        title: 'Creating Market',
        description: 'Please confirm the transaction in your wallet...',
      })

      console.log('🔄 Calling createMarket with params:', marketParams)
      console.log('🔄 createMarket function reference:', createMarket)
      console.log('🔄 createMarket type:', typeof createMarket)

      const result = await createMarket(marketParams)
      console.log('✅ createMarket result:', result)

      if (result) {
        // Set the transaction hash immediately
        setTxHash(hash || '')

        toast({
          title: 'Transaction Submitted',
          description:
            'Your market creation transaction has been submitted to the blockchain',
        })

        // Wait for confirmation
        if (isConfirmed && hash) {
          // For now, we'll use the transaction hash as a placeholder
          // In a real implementation, you'd get the contract address from the transaction receipt
          setContractAddress(hash) // This should be the actual contract address
          setMarketAddress(hash) // This should be the actual market contract address

          toast({
            title: 'Market Created Successfully!',
            description: `Your market has been deployed to the blockchain`,
          })

          // Call the callback if provided
          if (onCreateMarket) {
            onCreateMarket(hash, hash)
          }
        }
      } else {
        throw new Error('Failed to create market')
      }
    } catch (error) {
      console.error('Error creating market:', error)

      let errorMessage = 'An unknown error occurred'
      if (error instanceof Error) {
        errorMessage = error.message
      }

      // Handle specific MetaMask errors
      if (
        errorMessage.includes(
          'External transactions to internal accounts cannot include data'
        )
      ) {
        errorMessage =
          'Wallet connection issue. Please disconnect and reconnect your wallet, then try again.'
      } else if (errorMessage.includes('wallet_sendTransaction')) {
        errorMessage =
          'MetaMask connection issue. Please refresh the page and try again.'
      } else if (errorMessage.includes('User rejected')) {
        errorMessage = 'Transaction was cancelled by user.'
      } else if (errorMessage.includes('insufficient funds')) {
        errorMessage =
          'Insufficient funds for transaction. Please add ETH to your wallet.'
      } else if (
        errorMessage.includes('Wallet address is the same as contract address')
      ) {
        errorMessage =
          'Wallet connection error detected. Please follow these steps:\n1. Disconnect your wallet from the app\n2. Refresh the page\n3. Reconnect your wallet\n4. Try creating the market again'
      }

      toast({
        title: 'Error Creating Market',
        description: errorMessage,
        variant: 'destructive',
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

  const isMarketCreated = marketAddress || marketData.marketAddress

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && hash && !marketAddress) {
      setMarketAddress(hash) // Using hash as placeholder for market address
      setTxHash(hash)

      toast({
        title: 'Market Created Successfully!',
        description: `Your market has been deployed to the blockchain`,
      })

      // Call the callback if provided
      if (onCreateMarket) {
        onCreateMarket(hash, hash)
      }
    }
  }, [isConfirmed, hash, marketAddress, onCreateMarket])

  // Note: Bridge in progress screen removed - Nexus widgets handle their own UI

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
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Auto-Bridge Available
                </span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                We'll automatically bridge ETH from another chain when you
                launch your market.
              </p>
            </div>
          )}
        </Card>

        {/* Smart Contract Creation */}
        {!isMarketCreated ? (
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

              <Button
                onClick={() => handleCreateMarket()}
                disabled={isCreating || creatingMarket}
                className="w-full gold-gradient text-background font-semibold"
                size="lg"
                style={{
                  opacity: isCreating || creatingMarket ? 0.5 : 1,
                  cursor:
                    isCreating || creatingMarket ? 'not-allowed' : 'pointer',
                }}
              >
                {isCreating || creatingMarket ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Launching Market...
                  </>
                ) : (
                  'Launch Prediction Market'
                )}
              </Button>
            </div>
          </Card>
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
                            `https://sepolia.arbiscan.io/address/${
                              contractAddress ||
                              marketAddress ||
                              marketData.marketAddress
                            }`,
                            '_blank'
                          )
                        }
                        className="h-6 px-2"
                        title="View Contract on Arbiscan"
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
                          `https://sepolia.arbiscan.io/address/${
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
                      View Contract on Arbiscan
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
                              `https://sepolia.arbiscan.io/tx/${txHash}`,
                              '_blank'
                            )
                          }
                          className="h-6 px-2"
                          title="View Transaction on Arbiscan"
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
                            `https://sepolia.arbiscan.io/tx/${txHash}`,
                            '_blank'
                          )
                        }
                        className="w-full"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Transaction on Arbiscan
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

        {/* Nexus Bridge Section - shown when user has insufficient balance */}
        {showManualBridge && (
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Bridge to Arbitrum Sepolia
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Use Nexus to bridge native currency from supported chains to
                  Arbitrum Sepolia.
                </p>
              </div>

              {/* Nexus Bridge Widget */}
              <div className="space-y-4">
                <div className="space-y-3">
                  {/* Simple Bridge */}
                  <BridgeButton
                    prefill={{ chainId: 421614, token: 'ETH', amount: '0.01' }}
                  >
                    {({ onClick, isLoading }) => (
                      <Button
                        onClick={onClick}
                        disabled={isLoading}
                        className="w-full"
                        variant="outline"
                      >
                        {isLoading ? (
                          <>
                            <Zap className="w-4 h-4 mr-2 animate-pulse" />
                            Bridging ETH...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Bridge 0.01 ETH to Arbitrum Sepolia
                          </>
                        )}
                      </Button>
                    )}
                  </BridgeButton>

                  {/* Bridge and Create Market in One Transaction */}
                  <BridgeAndExecuteButton
                    contractAddress={
                      (process.env
                        .NEXT_PUBLIC_MARKET_FACTORY_ADDRESS as `0x${string}`) ||
                      ('0x6b70e7fC5E40AcFC76EbC3Fa148159E5EF6F7643' as `0x${string}`)
                    }
                    contractAbi={
                      [
                        {
                          name: 'createMarket',
                          type: 'function',
                          stateMutability: 'nonpayable',
                          inputs: [
                            { name: 'identifier', type: 'string' },
                            { name: 'endTime', type: 'uint64' },
                            { name: 'creatorFeeBps', type: 'uint96' },
                            { name: 'question', type: 'string' },
                            { name: 'description', type: 'string' },
                            { name: 'category', type: 'string' },
                            { name: 'platform', type: 'uint8' },
                            { name: 'resolutionSource', type: 'string' },
                            { name: 'options', type: 'string[]' },
                          ],
                          outputs: [{ name: 'market', type: 'address' }],
                        },
                      ] as const
                    }
                    functionName="createMarket"
                    buildFunctionParams={(token, amount, chainId, user) => {
                      // Generate a unique identifier string
                      const identifier =
                        marketData.identifier ||
                        `market_${Date.now()}_${Math.random()
                          .toString(36)
                          .substr(2, 9)}`

                      // Convert endDate to timestamp
                      const endTime = Math.floor(
                        marketData.endDate.getTime() / 1000
                      )

                      // Convert creator fee percentage to basis points
                      const creatorFeeBps = Math.floor(
                        (marketData.creatorFee || 2) * 100
                      )

                      console.log('BridgeAndExecuteButton params:', {
                        identifier,
                        endTime,
                        creatorFeeBps,
                        question: marketData.question,
                        description: marketData.description,
                        category: marketData.category || 'other',
                        platform: marketData.platform || 0,
                        resolutionSource: marketData.resolutionSource || '',
                        options: marketData.options.filter((option: string) =>
                          option.trim()
                        ),
                      })

                      return {
                        functionParams: [
                          identifier, // string
                          endTime, // uint64
                          creatorFeeBps, // uint96
                          marketData.question,
                          marketData.description,
                          marketData.category || 'other',
                          marketData.platform || 0,
                          marketData.resolutionSource || '',
                          marketData.options.filter((option: string) =>
                            option.trim()
                          ),
                        ],
                      }
                    }}
                    prefill={{
                      toChainId: 421614, // Arbitrum Sepolia
                      token: 'ETH',
                    }}
                  >
                    {({ onClick, isLoading }) => (
                      <Button
                        onClick={onClick}
                        disabled={isLoading}
                        className="w-full gold-gradient text-background font-semibold"
                        size="lg"
                      >
                        {isLoading ? (
                          <>
                            <Zap className="w-4 h-4 mr-2 animate-pulse" />
                            Bridge & Create Market...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Bridge ETH & Create Market (One Transaction)
                          </>
                        )}
                      </Button>
                    )}
                  </BridgeAndExecuteButton>
                </div>
              </div>

              {/* Alternative Options */}
              <div className="text-xs text-muted-foreground">
                <p>💡 Alternative: Get testnet ETH from faucets:</p>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(
                        'https://faucet.quicknode.com/arbitrum/sepolia',
                        '_blank'
                      )
                    }
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Arbitrum Faucet
                  </Button>

                  <Button variant="outline" size="sm" onClick={refreshBalance}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Balance
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowManualBridge(false)
                      handleCreateMarket(true)
                    }}
                    className="bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Continue Anyway
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Simple Bridge Popup */}
        {showBridgePopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-6 bg-background border-border max-w-md w-full mx-4">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                  <Zap className="w-6 h-6 text-green-500" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    💰 Funds Found!
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    We found native currency on other chains. Bridge it to
                    Arbitrum Sepolia?
                  </p>
                </div>

                {/* Chain Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Select chain to bridge from:
                  </label>
                  <div className="space-y-2">
                    {availableFunds.map((fund, index) => (
                      <label
                        key={index}
                        className="flex items-center space-x-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50"
                      >
                        <input
                          type="radio"
                          name="chain"
                          value={fund.chain}
                          checked={selectedChain === fund.chain}
                          onChange={(e) => setSelectedChain(e.target.value)}
                          className="w-4 h-4"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{fund.chain}</div>
                          <div className="text-sm text-muted-foreground">
                            {fund.balance}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowBridgePopup(false)
                      setShowManualBridge(true)
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>

                  <Button
                    onClick={handleBridgeConfirm}
                    disabled={!selectedChain}
                    className="flex-1 gold-gradient text-background font-semibold"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Bridge & Create Market
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
