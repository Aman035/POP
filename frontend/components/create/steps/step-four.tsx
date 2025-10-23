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
      
      // Generate unique identifier
      const identifier = generateIdentifier()
      
      // Convert endDate to timestamp
      const endTime = Math.floor(marketData.endDate.getTime() / 1000)
      
      // Convert creator fee percentage to basis points
      const creatorFeeBps = Math.floor((marketData.creatorFee || 2) * 100) // Convert percentage to basis points
      
      const marketParams = {
        identifier,
        options: marketData.options.filter((option: string) => option.trim()),
        creator: "", // Will be filled by the contract with msg.sender
        endTime,
        creatorFeeBps,
        question: marketData.question,
        description: marketData.description,
        category: marketData.category || "other",
        resolutionSource: marketData.resolutionSource || "",
        platform: marketData.platform || 0, // Default to Platform.Default
        postUrl: marketData.postUrl || marketData.pollUrl || "",
        minBet: marketData.minBet || 1,
        maxBetPerUser: marketData.maxBetPerUser || 1000,
        maxTotalStake: marketData.maxTotalStake || 10000
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
          setMarketAddress(hash) // Using hash as placeholder for market address
          
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
        <Card className="p-4 bg-background border-border">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-gold-2" />
            <p className="text-sm font-medium">Betting Limits</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Min Bet</p>
                <p className="text-sm font-medium">${marketData.minBet.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Max Per User</p>
                <p className="text-sm font-medium">${marketData.maxBetPerUser.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Max Total</p>
                <p className="text-sm font-medium">${marketData.maxTotalStake.toFixed(2)}</p>
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
                <h3 className="text-lg font-semibold mb-2">Deploy to Blockchain</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your market on the blockchain. No USDC required upfront.
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
                    Creating Market...
                  </>
                ) : (
                  "Deploy Market to Blockchain"
                )}
              </Button>
              
              {createError && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive text-center">
                    {createError}
                  </p>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <Card className="p-6 bg-background border-border border-green-500/20">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-green-500">Market Created Successfully!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your market has been deployed to the blockchain
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-background border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Market Address</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono flex-1 text-left truncate">
                      {marketAddress || marketData.marketAddress}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(marketAddress || marketData.marketAddress)}
                    >
                      {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                {txHash && (
                  <div className="p-3 rounded-lg bg-background border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono flex-1 text-left truncate">
                        {txHash}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(txHash)}
                      >
                        {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`https://sepolia.arbiscan.io/tx/${txHash}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
