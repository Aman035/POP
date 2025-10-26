"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ArrowRight, Coins, ExternalLink } from "lucide-react"
import { BridgeButton, BridgeAndExecuteButton } from "@avail-project/nexus-widgets"
import { parseUnits } from "viem"
import { MARKET_ABI } from "@/lib/contracts"

interface AutoBridgePopupProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  onError: (error: string) => void
  betAmount: string
  marketAddress: string
  selectedOption: number
  userAddress: string
  userEthBalance?: string
  userUsdcBalance?: string
}

export function AutoBridgePopup({
  isOpen,
  onClose,
  onSuccess,
  onError,
  betAmount,
  marketAddress,
  selectedOption,
  userAddress,
  userEthBalance = "0",
  userUsdcBalance = "0"
}: AutoBridgePopupProps) {
  const [isBridging, setIsBridging] = useState(false)
  const [bridgeError, setBridgeError] = useState<string | null>(null)

  // Determine what action to take based on user's balances
  const ethBalance = parseFloat(userEthBalance || "0")
  const usdcBalance = parseFloat(userUsdcBalance || "0")
  const neededUsdc = parseFloat(betAmount)
  
  const hasEnoughEth = ethBalance > 0.01 // Need at least 0.01 ETH to swap
  const hasEnoughUsdc = usdcBalance >= neededUsdc
  
  // Determine the best action
  const shouldSwapEth = hasEnoughEth && !hasEnoughUsdc
  const shouldBridgeUsdc = !hasEnoughEth && !hasEnoughUsdc
  const actionType = shouldSwapEth ? 'swap' : shouldBridgeUsdc ? 'bridge' : 'none'

  const handleBridgeSuccess = () => {
    setIsBridging(false)
    onSuccess()
    onClose()
  }

  const handleBridgeError = (error: string) => {
    setIsBridging(false)
    setBridgeError(error)
    onError(error)
  }

  const buildFunctionParams = (token: string, amount: string, chainId: number, user: string) => {
    try {
      // For ETH to USDC swap, we need to swap ETH to USDC and then place the bet
      // The function will be called on the market contract to place the bet
      const amountWei = parseUnits(amount, 6) // USDC has 6 decimals
      return {
        functionParams: [selectedOption, amountWei], // placeBet(option, amount)
        value: "0" // No ETH value needed for USDC bet
      }
    } catch (error) {
      console.error("Error building function params:", error)
      throw new Error("Invalid amount format")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-md max-h-[80vh] overflow-y-auto fixed bottom-4 left-1/2 transform -translate-x-1/2">
        <DialogHeader className="space-y-2 pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Coins className="w-5 h-5 text-blue-600 flex-shrink-0" />
            {actionType === 'swap' ? 'Swap ETH to USDC' : 'Bridge USDC'}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-gray-600">
            You need <strong>{betAmount} USDC</strong> on Arbitrum Sepolia to place this bet. 
            {actionType === 'swap' 
              ? `We can swap your ${ethBalance.toFixed(4)} ETH to USDC.`
              : 'We can bridge USDC from your other chains.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Action Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-800 text-sm">
                  {actionType === 'swap' ? 'Swap Required' : 'Bridge Required'}
                </h4>
                <p className="text-xs text-blue-700 leading-relaxed mt-1">
                  {actionType === 'swap' 
                    ? `We'll swap your ETH to ${betAmount} USDC on Arbitrum Sepolia.`
                    : `We'll bridge ${betAmount} USDC from your other chains to Arbitrum Sepolia.`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-medium text-xs text-gray-800 mb-2">Transaction Details</h4>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">
                  {actionType === 'swap' ? 'Swap:' : 'Bridge:'}
                </span>
                <span className="font-mono text-xs font-medium">
                  {actionType === 'swap' ? `ETH → ${betAmount} USDC` : `${betAmount} USDC`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Network:</span>
                <span className="text-xs font-medium text-blue-600">Arbitrum Sepolia</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Action:</span>
                <span className="text-xs font-medium">
                  {actionType === 'swap' ? 'Swap ETH to USDC' : 'Bridge USDC'}
                </span>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {bridgeError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-800 text-xs">Error</h4>
                  <p className="text-red-600 text-xs mt-1">{bridgeError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="space-y-2">
            {actionType === 'swap' ? (
              // ETH to USDC Swap using BridgeAndExecuteButton
              <BridgeAndExecuteButton
                contractAddress={marketAddress as `0x${string}`}
                contractAbi={[
                  {
                    name: 'placeBet',
                    type: 'function',
                    stateMutability: 'nonpayable',
                    inputs: [
                      { name: 'option', type: 'uint256' },
                      { name: 'amount', type: 'uint256' }
                    ],
                    outputs: [],
                  }
                ] as const}
                functionName="placeBet"
                buildFunctionParams={(token, amount, chainId, user) => {
                  const amountWei = parseUnits(amount, 6) // USDC has 6 decimals
                  return {
                    functionParams: [selectedOption, amountWei],
                    value: "0"
                  }
                }}
                prefill={{
                  toChainId: 421614, // Arbitrum Sepolia
                  token: 'ETH',
                  amount: '0.01' // Default ETH amount for swap
                }}
              >
                {({ onClick, isLoading }) => (
                  <Button
                    onClick={async () => {
                      try {
                        setIsBridging(true)
                        setBridgeError(null)
                        await onClick()
                      } catch (error) {
                        handleBridgeError(error instanceof Error ? error.message : 'Swap failed')
                      }
                    }}
                    disabled={isBridging}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 h-10 text-sm"
                  >
                    {isLoading || isBridging ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        <span className="hidden sm:inline">Swapping ETH to USDC...</span>
                        <span className="sm:hidden">Swapping...</span>
                      </>
                    ) : (
                      <>
                        <Coins className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Swap ETH to {betAmount} USDC</span>
                        <span className="sm:hidden">Swap ETH to {betAmount} USDC</span>
                      </>
                    )}
                  </Button>
                )}
              </BridgeAndExecuteButton>
            ) : (
              // USDC Bridge using BridgeButton
              <BridgeButton
                prefill={{
                  chainId: 421614, // Arbitrum Sepolia
                  token: 'USDC',
                  amount: betAmount
                }}
              >
                {({ onClick, isLoading }) => (
                  <Button
                    onClick={async () => {
                      try {
                        setIsBridging(true)
                        setBridgeError(null)
                        await onClick()
                      } catch (error) {
                        handleBridgeError(error instanceof Error ? error.message : 'Bridge failed')
                      }
                    }}
                    disabled={isBridging}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 h-10 text-sm"
                  >
                    {isLoading || isBridging ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        <span className="hidden sm:inline">Bridging USDC...</span>
                        <span className="sm:hidden">Bridging...</span>
                      </>
                    ) : (
                      <>
                        <Coins className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Bridge {betAmount} USDC</span>
                        <span className="sm:hidden">Bridge {betAmount} USDC</span>
                      </>
                    )}
                  </Button>
                )}
              </BridgeButton>
            )}

            {/* Alternative Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isBridging}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open('https://bridge.arbitrum.io/', '_blank')}
                disabled={isBridging}
                className="h-8 text-xs"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Manual
              </Button>
            </div>
          </div>

          {/* Help Text */}
          <div className="text-xs text-gray-500 text-center bg-gray-50 rounded-lg p-2">
            <p>
              {actionType === 'swap' 
                ? 'This will automatically swap your ETH to USDC and place your bet in one transaction.'
                : 'This will automatically bridge USDC from your other chains to Arbitrum Sepolia.'
              }
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
