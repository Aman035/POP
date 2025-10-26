import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, Copy, CheckCircle, AlertCircle, Coins } from 'lucide-react';
import { useWallet } from '@/hooks/wallet/use-wallet';
import { useCollateralToken } from '@/hooks/contracts/use-contracts';
import { ethers } from 'ethers';
import { config } from '@/lib/config';

interface USDCAcquisitionProps {
  onUSDCReceived?: () => void;
}

export function USDCAcquisition({ onUSDCReceived }: USDCAcquisitionProps) {
  const { address, isConnected } = useWallet();
  const { contract: usdcContract } = useCollateralToken();
  const [usdcBalance, setUsdcBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const USDC_ADDRESS = config.contracts.collateralToken;
  const USDC_DECIMALS = 6;

  // Check USDC balance
  const checkBalance = async () => {
    if (!usdcContract || !address) return;
    
    try {
      const balance = await usdcContract.balanceOf(address);
      const formattedBalance = ethers.formatUnits(balance, USDC_DECIMALS);
      setUsdcBalance(formattedBalance);
    } catch (error) {
      console.error('Error checking USDC balance:', error);
    }
  };

  useEffect(() => {
    if (isConnected && usdcContract) {
      checkBalance();
    }
  }, [isConnected, usdcContract, address]);

  // Try to get USDC from faucet
  const tryFaucet = async () => {
    if (!usdcContract) return;
    
    setIsLoading(true);
    try {
      // Try common faucet function names
      const faucetMethods = ['faucet', 'mint', 'claim', 'getTokens'];
      
      for (const method of faucetMethods) {
        try {
          if (usdcContract[method]) {
            const tx = await usdcContract[method]();
            await tx.wait();
            await checkBalance();
            onUSDCReceived?.();
            return;
          }
        } catch (error) {
          // Continue to next method
        }
      }
      
      throw new Error('No faucet method found');
    } catch (error) {
      console.error('Faucet failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(USDC_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasUSDC = parseFloat(usdcBalance) > 0;

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-gold-2" />
            USDC Required
          </CardTitle>
          <CardDescription>
            Connect your wallet to check USDC balance
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-gold-2" />
          USDC Balance
        </CardTitle>
        <CardDescription>
          You need USDC to place bets in prediction markets
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Balance */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-background border">
          <span className="text-sm font-medium">Current Balance</span>
          <Badge variant={hasUSDC ? "default" : "destructive"}>
            {usdcBalance} USDC
          </Badge>
        </div>

        {hasUSDC ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Great! You have USDC and can place bets.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You need USDC to place bets. Get testnet USDC from the options below.
              </AlertDescription>
            </Alert>

            {/* Token Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium">USDC Token Address</label>
              <div className="flex items-center gap-2 p-2 rounded border bg-muted">
                <code className="text-xs flex-1">{USDC_ADDRESS}</code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyAddress}
                  className="h-8 w-8 p-0"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Faucet Options */}
            <div className="space-y-3">
              <h4 className="font-medium">Get Testnet USDC</h4>
              
              {/* Try Built-in Faucet */}
              <Button
                onClick={tryFaucet}
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                {isLoading ? "Trying Faucet..." : "Try Built-in Faucet"}
              </Button>

              {/* External Faucets */}
              <div className="space-y-2">
                <Button
                  onClick={() => window.open('https://faucet.circle.com/', '_blank')}
                  variant="outline"
                  className="w-full"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Circle USDC Faucet
                </Button>
                
                <Button
                  onClick={() => window.open('https://developer.interlace.money/docs/usdc-on-testing-networks', '_blank')}
                  variant="outline"
                  className="w-full"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Interlace USDC Faucet
                </Button>
                
                <Button
                  onClick={() => window.open('https://faucet.quicknode.com/arbitrum/sepolia', '_blank')}
                  variant="outline"
                  className="w-full"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  QuickNode Faucet
                </Button>
              </div>
            </div>

            {/* Instructions */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Steps to get USDC:</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Get Arbitrum Sepolia ETH first (for gas fees)</li>
                <li>Visit the Circle faucet (recommended) or other faucet links above</li>
                <li>Select "Arbitrum Sepolia" network and connect your wallet</li>
                <li>Request 10 USDC (limit: once per hour per address)</li>
                <li>Add the USDC token to your wallet using the address above</li>
                <li>Refresh this page to see your balance</li>
              </ol>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
