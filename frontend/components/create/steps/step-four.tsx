import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Twitter, MessageSquare, Calendar, DollarSign, FileText, Clock, ExternalLink, Copy, CheckCircle, Shield, Target, Users } from "lucide-react"
import { format } from "date-fns"
import { useCreateMarket } from "@/hooks/use-contracts"
import { useState, useEffect } from "react"
import { toast } from "@/hooks/use-toast"
import { Platform } from "@/lib/types"

interface StepFourProps {
  marketData: any
  onCreateMarket?: (marketAddress: string, txHash: string) => void
}

export function StepFour({ marketData, onCreateMarket }: StepFourProps) {
  const { createMarket, loading: creatingMarket, error: createError, hash, isConfirmed } = useCreateMarket()
  const [isCreating, setIsCreating] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [marketAddress, setMarketAddress] = useState<string | null>(null)
  const [contractAddress, setContractAddress] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  
  const PlatformIcon = marketData.platform === Platform.Twitter ? Twitter : 
                       marketData.platform === Platform.Farcaster ? MessageSquare : 
                       MessageSquare // Default fallback

  const generateIdentifier = () => {
    // Generate a numeric identifier that can be converted to BigInt
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000000) // 6-digit random number
    return timestamp * 1000000 + random // Combine timestamp and random to create unique numeric ID
  }

  const handleCreateMarket = async () => {
    if (!marketData.question || !marketData.description || marketData.options.length < 2) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    // Check if all options are filled
    const emptyOptions = marketData.options.some((option: string) => !option.trim())
    if (emptyOptions) {
      toast({
        title: "Empty Options",
        description: "Please fill in all market options",
        variant: "destructive"
      })
      return
    }

    if (!marketData.endDate) {
      toast({
        title: "Missing End Date",
        description: "Please set an end date for your market",
        variant: "destructive"
      })
      return
    }

    try {
      setIsCreating(true)
      
      // Convert endDate to timestamp
      const endTime = Math.floor(marketData.endDate.getTime() / 1000)
      
      // Convert creator fee percentage to basis points
      const creatorFeeBps = Math.floor((marketData.creatorFee || 2) * 100) // Convert percentage to basis points
      
      const marketParams = {
        identifier: marketData.identifier,
        options: marketData.options.filter((option: string) => option.trim()),
        endTime,
        creatorFeeBps,
        question: marketData.question,
        description: marketData.description,
        category: marketData.category || "other",
        platform: marketData.platform || 0, // Default to Platform.Twitter
        resolutionSource: marketData.resolutionSource || "",
      }

      toast({
        title: "Creating Market",
        description: "Please confirm the transaction in your wallet...",
      })

      const result = await createMarket(marketParams)
      
      if (result) {
        // Set the transaction hash immediately
        setTxHash(hash || "")
        
        toast({
          title: "Transaction Submitted",
          description: "Your market creation transaction has been submitted to the blockchain",
        })
        
        // Wait for confirmation
        if (isConfirmed && hash) {
          // For now, we'll use the transaction hash as a placeholder
          // In a real implementation, you'd get the contract address from the transaction receipt
          setContractAddress(hash) // This should be the actual contract address
          setMarketAddress(hash) // This should be the actual market contract address
          
          toast({
            title: "Market Created Successfully!",
            description: `Your market has been deployed to the blockchain`,
          })
          
          // Call the callback if provided
          if (onCreateMarket) {
            onCreateMarket(hash, hash)
          }
        }
      } else {
        throw new Error("Failed to create market")
      }
    } catch (error) {
      console.error("Error creating market:", error)
      
      let errorMessage = "An unknown error occurred"
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      // Handle specific MetaMask errors
      if (errorMessage.includes("External transactions to internal accounts cannot include data")) {
        errorMessage = "Wallet connection issue. Please disconnect and reconnect your wallet, then try again."
      } else if (errorMessage.includes("wallet_sendTransaction")) {
        errorMessage = "MetaMask connection issue. Please refresh the page and try again."
      } else if (errorMessage.includes("User rejected")) {
        errorMessage = "Transaction was cancelled by user."
      } else if (errorMessage.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for transaction. Please add ETH to your wallet."
      } else if (errorMessage.includes("Wallet address is the same as contract address")) {
        errorMessage = "Wallet connection error detected. Please follow these steps:\n1. Disconnect your wallet from the app\n2. Refresh the page\n3. Reconnect your wallet\n4. Try creating the market again"
      }
      
      toast({
        title: "Error Creating Market",
        description: errorMessage,
        variant: "destructive"
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
        title: "Copied!",
        description: "Address copied to clipboard",
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
        title: "Market Created Successfully!",
        description: `Your market has been deployed to the blockchain`,
      })
      
      // Call the callback if provided
      if (onCreateMarket) {
        onCreateMarket(hash, hash)
      }
    }
  }, [isConfirmed, hash, marketAddress, onCreateMarket])

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-background" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Review Your Market</h2>
        <p className="text-muted-foreground">Double-check everything before creating your market</p>
      </div>

      <div className="space-y-4">
        {/* Platform */}
        <Card className="p-4 bg-background border-border">
          <div className="flex items-center gap-3">
            <PlatformIcon className="w-5 h-5 text-gold-2" />
            <div>
              <p className="text-sm text-muted-foreground">Platform</p>
              <p className="font-medium">
                {marketData.platform === Platform.Twitter ? "Twitter/X" : 
                 marketData.platform === Platform.Farcaster ? "Farcaster" : "Other"}
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
              <p className="text-sm text-muted-foreground">{marketData.description}</p>
            </div>
          </div>
        </Card>

        {/* Options */}
        <Card className="p-4 bg-background border-border">
          <p className="text-sm text-muted-foreground mb-3">Options</p>
          <div className="space-y-2">
            {marketData.options.map((option: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <Badge variant="secondary">{option || `Option ${index + 1}`}</Badge>
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
                <p className="font-medium">{marketData.endDate ? format(marketData.endDate, "PPP") : "Not set"}</p>
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
          <p className="text-sm text-muted-foreground mb-2">Resolution Source</p>
          <p className="text-sm">{marketData.resolutionSource}</p>
        </Card>

        {/* Betting Limits */}
        <Card className="p-4 bg-gradient-to-br from-gold-2/5 to-gold-2/10 border-gold-2/20">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gold-2/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-gold-2" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Betting Parameters</p>
              <p className="text-xs text-muted-foreground">Configured limits for your market</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Target className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Minimum Bet</p>
                <p className="text-sm font-semibold text-foreground">${(marketData.minBet || 1).toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Max Per User</p>
                <p className="text-sm font-semibold text-foreground">${(marketData.maxBetPerUser || 1000).toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Max Total Pool</p>
                <p className="text-sm font-semibold text-foreground">${(marketData.maxTotalStake || 10000).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Smart Contract Creation */}
        {!isMarketCreated ? (
          <Card className="p-6 bg-background border-border">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-gold-2/10 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6 text-gold-2" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Launch Your Prediction Market</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Deploy your market to the blockchain and start accepting predictions. No upfront costs required.
                </p>
              </div>
              
              <Button 
                onClick={handleCreateMarket}
                disabled={isCreating || creatingMarket}
                className="w-full gold-gradient text-background font-semibold"
                size="lg"
              >
                {isCreating || creatingMarket ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Launching Market...
                  </>
                ) : (
                  "Launch Prediction Market"
                )}
              </Button>
              
              {createError && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-destructive text-xs font-bold">!</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-destructive mb-1">Launch Failed</p>
                      <p className="text-sm text-destructive/80">
                        {createError}
                      </p>
                      <p className="text-xs text-destructive/60 mt-2">
                        Please check your wallet connection and try again. If the problem persists, try refreshing the page.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-500/30">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 text-green-600">🎉 Market Launched Successfully!</h3>
                <p className="text-muted-foreground mb-6">
                  Your prediction market is now live on the blockchain and ready to accept predictions
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
                      <p className="text-xs text-muted-foreground">Creator Fee</p>
                      <p className="text-lg font-bold text-foreground">{marketData.creatorFee}%</p>
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
                        {marketData.endDate ? format(marketData.endDate, "MMM dd, yyyy") : "Not set"}
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
                        {marketData.platform === 0 ? "Twitter/X" : 
                         marketData.platform === 1 ? "Farcaster" : "Other"}
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
                    <p className="text-sm font-medium text-foreground">Market Contract Address</p>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(contractAddress || marketAddress || marketData.marketAddress)}
                        className="h-6 px-2"
                      >
                        {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`https://sepolia.arbiscan.io/address/${contractAddress || marketAddress || marketData.marketAddress}`, '_blank')}
                        className="h-6 px-2"
                        title="View Contract on Arbiscan"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <code className="text-xs font-mono text-muted-foreground break-all">
                    {contractAddress || marketAddress || marketData.marketAddress}
                  </code>
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://sepolia.arbiscan.io/address/${contractAddress || marketAddress || marketData.marketAddress}`, '_blank')}
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
                      <p className="text-sm font-medium text-foreground">Transaction Hash</p>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(txHash)}
                          className="h-6 px-2"
                        >
                          {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://sepolia.arbiscan.io/tx/${txHash}`, '_blank')}
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
                        onClick={() => window.open(`https://sepolia.arbiscan.io/tx/${txHash}`, '_blank')}
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
                <h4 className="font-semibold text-foreground mb-2">What's Next?</h4>
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
