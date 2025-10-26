'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRightLeft, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Coins,
  Zap,
  Shield,
  Clock
} from 'lucide-react';
import { useNexusSDK } from '@/components/providers/nexus-provider';
import { useWallet } from '@/hooks/wallet/use-wallet';
import { cn } from '@/lib/utils';

interface CrossChainBridgeProps {
  className?: string;
  onBridgeComplete?: (result: any) => void;
}

const SUPPORTED_CHAINS = [
  { id: 421614, name: 'Arbitrum Sepolia', symbol: 'ETH', isCurrent: true },
  { id: 84532, name: 'Base Sepolia', symbol: 'ETH' },
  { id: 11155420, name: 'Optimism Sepolia', symbol: 'ETH' },
  { id: 80002, name: 'Polygon Amoy', symbol: 'MATIC' },
  { id: 11155111, name: 'Sepolia', symbol: 'ETH' },
];

const SUPPORTED_TOKENS = [
  { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
  { symbol: 'USDT', name: 'Tether USD', decimals: 6 },
  { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
];

interface BridgeFormData {
  token: string;
  amount: string;
  fromChain: number;
  toChain: number;
}

export function CrossChainBridge({ className, onBridgeComplete }: CrossChainBridgeProps) {
  const { isConnected, address } = useWallet();
  const { 
    isInitialized, 
    isLoading, 
    error,
    balances,
    progress, 
    bridge, 
    simulateBridge,
    setOnIntentHook,
    setOnAllowanceHook
  } = useNexusSDK();

  const [formData, setFormData] = useState<BridgeFormData>({
    token: 'USDC',
    amount: '',
    fromChain: 421614, // Arbitrum Sepolia
    toChain: 84532, // Base Sepolia
  });

  const [simulation, setSimulation] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isBridging, setIsBridging] = useState(false);
  const [bridgeResult, setBridgeResult] = useState<any>(null);
  const [userIntent, setUserIntent] = useState<any>(null);
  const [userAllowance, setUserAllowance] = useState<any>(null);

  // Get balance for selected token and chain
  const getChainBalance = (chainId: number, tokenSymbol: string) => {
    const asset = balances.find(b => b.symbol === tokenSymbol);
    if (!asset || !asset.breakdown) return '0.00';
    
    const chainBalance = asset.breakdown.find((b: any) => b.chain.id === chainId);
    return chainBalance ? parseFloat(chainBalance.balance).toFixed(4) : '0.00';
  };

  // Set up hooks for user interactions
  useEffect(() => {
    if (!isInitialized) return;

    // Intent hook - show user what will happen
    setOnIntentHook(({ intent, allow, deny, refresh }) => {
      setUserIntent({ intent, allow, deny, refresh });
    });

    // Allowance hook - handle token approvals
    setOnAllowanceHook(({ allow, deny, sources }) => {
      setUserAllowance({ allow, deny, sources });
    });
  }, [isInitialized, setOnIntentHook, setOnAllowanceHook]);

  const handleSimulate = async () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) return;

    setIsSimulating(true);
    try {
      const sim = await simulateBridge({
        token: formData.token as any,
        amount: parseFloat(formData.amount),
        chainId: formData.toChain as any,
        sourceChains: [formData.fromChain as any],
      });
      setSimulation(sim);
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleBridge = async () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) return;

    // Let Nexus SDK handle chain validation and switching
    setIsBridging(true);
    setBridgeResult(null);
    
    try {
      console.log('Starting bridge operation with Nexus SDK');
      const result = await bridge({
        token: formData.token as any,
        amount: parseFloat(formData.amount),
        chainId: formData.toChain as any,
        sourceChains: [formData.fromChain as any],
      });
      
      console.log('Bridge result:', result);
      setBridgeResult(result);
      onBridgeComplete?.(result);
    } catch (error) {
      console.error('Bridge failed:', error);
      setBridgeResult({
        success: false,
        error: error instanceof Error ? error.message : 'Bridge operation failed'
      } as any);
    } finally {
      setIsBridging(false);
    }
  };

  const getStepIcon = (stepType: string, isCompleted: boolean, isActive: boolean) => {
    const iconClass = isCompleted 
      ? "text-emerald-600 dark:text-emerald-400" 
      : isActive 
      ? "text-blue-600 dark:text-blue-400" 
      : "text-slate-400 dark:text-slate-600";
    
    switch (stepType) {
      case 'CS': return <Shield className={`w-5 h-5 ${iconClass}`} />;
      case 'TS': return <ArrowRightLeft className={`w-5 h-5 ${iconClass}`} />;
      case 'IS': return <CheckCircle className={`w-5 h-5 ${iconClass}`} />;
      case 'WS': return <Clock className={`w-5 h-5 ${iconClass}`} />;
      case 'AA': return <Shield className={`w-5 h-5 ${iconClass}`} />;
      default: return <Loader2 className={`w-5 h-5 ${iconClass} ${isActive ? 'animate-spin' : ''}`} />;
    }
  };

  const getStepDescription = (stepType: string, stepData?: any) => {
    switch (stepType) {
      case 'CS': return {
        title: 'Source Chain Validation',
        description: 'Verifying token balance on source chain'
      };
      case 'TS': return {
        title: 'Token Transfer',
        description: 'Initiating cross-chain token transfer'
      };
      case 'IS': return {
        title: 'Destination Finalization',
        description: 'Completing transfer on destination chain'
      };
      case 'WS': return {
        title: 'Waiting for Confirmation',
        description: 'Transaction pending confirmation'
      };
      case 'AA': return {
        title: 'Token Approval',
        description: 'Approving token spend on source chain'
      };
      default: return {
        title: 'Processing',
        description: 'Operation in progress...'
      };
    }
  };

  if (!isConnected) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-gold-2" />
            Cross-Chain Bridge
          </CardTitle>
          <CardDescription>
            Connect your wallet to bridge tokens across chains
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to use cross-chain bridging
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!isInitialized && isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-gold-2" />
            Cross-Chain Bridge
          </CardTitle>
          <CardDescription>
            Initializing cross-chain SDK... Please sign the message in your wallet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-gold-2" />
            <p className="text-sm text-muted-foreground text-center">
              Waiting for wallet signature...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isInitialized && !isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-gold-2" />
            Cross-Chain Bridge
          </CardTitle>
          <CardDescription>
            SDK not initialized
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Please connect your wallet to initialize the cross-chain SDK'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-gold-2" />
          Cross-Chain Bridge
        </CardTitle>
        <CardDescription>
          Bridge tokens seamlessly across multiple testnet chains
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Bridge Summary Visualization */}
        {formData.amount && parseFloat(formData.amount) > 0 && (
          <div className="p-5 rounded-xl bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50 dark:from-slate-900/50 dark:via-gray-900/50 dark:to-slate-900/50 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-center gap-6">
              <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm min-w-[160px] transition-all hover:shadow-md">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  {SUPPORTED_CHAINS.find(c => c.id === formData.fromChain)?.name || 'From'}
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {formData.amount}
                </div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {formData.token}
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-2 animate-pulse">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                  <ArrowRightLeft className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Transfer
                </div>
              </div>
              
              <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm min-w-[160px] transition-all hover:shadow-md">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  {SUPPORTED_CHAINS.find(c => c.id === formData.toChain)?.name || 'To'}
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {formData.amount}
                </div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {formData.token}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bridge Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="token">Token</Label>
              <Select 
                value={formData.token} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, token: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_TOKENS.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      {token.symbol} - {token.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromChain">From Chain</Label>
              <Select 
                value={formData.fromChain.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, fromChain: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CHAINS.map((chain) => (
                    <SelectItem key={chain.id} value={chain.id.toString()}>
                      {chain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isInitialized && (
                <div className="flex items-center justify-between p-2 bg-muted rounded text-xs">
                  <span className="text-muted-foreground">Available:</span>
                  <span className="font-semibold flex items-center gap-1">
                    <Coins className="w-3 h-3" />
                    {getChainBalance(formData.fromChain, formData.token)} {formData.token}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="toChain">To Chain</Label>
              <Select 
                value={formData.toChain.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, toChain: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CHAINS.filter(chain => chain.id !== formData.fromChain).map((chain) => (
                    <SelectItem key={chain.id} value={chain.id.toString()}>
                      {chain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isInitialized && (
                <div className="flex items-center justify-between p-2 bg-muted rounded text-xs">
                  <span className="text-muted-foreground">Current:</span>
                  <span className="font-semibold flex items-center gap-1">
                    <Coins className="w-3 h-3" />
                    {getChainBalance(formData.toChain, formData.token)} {formData.token}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Simulation Results */}
        {simulation && (
          <div className="p-5 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50 bg-gradient-to-br from-indigo-50/50 via-blue-50/50 to-purple-50/50 dark:from-indigo-950/30 dark:via-blue-950/30 dark:to-purple-950/30 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg text-slate-700 dark:text-slate-200">Simulation Results</span>
              <Badge variant="secondary" className="bg-indigo-100/80 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 border-0">
                Preview
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 transition-all hover:shadow-sm">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Estimated Cost</div>
                <div className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {simulation.intent?.fees?.totalCost || 'N/A'}
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 transition-all hover:shadow-sm">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Gas Supplied</div>
                <div className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {simulation.intent?.fees?.gasSupplied || 'N/A'}
                </div>
              </div>
            </div>

            {simulation.intent?.sources && simulation.intent.sources.length > 0 && (
              <div className="p-3 bg-white dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Source Chains:</div>
                <div className="flex flex-wrap gap-2">
                  {simulation.intent.sources.map((source: any, index: number) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1.5 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse" />
                      <span className="text-slate-700 dark:text-slate-300">{source.chainName || `Chain ${source.chainId}`}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Intent Confirmation */}
        {userIntent && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="space-y-3">
              <div>
                <strong>Bridge Intent Confirmation</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  Please review the bridge details and confirm to proceed.
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => {
                    userIntent.allow();
                    setUserIntent(null);
                  }}
                >
                  Confirm
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    userIntent.deny();
                    setUserIntent(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* User Allowance Confirmation */}
        {userAllowance && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="space-y-3">
              <div>
                <strong>Token Approval Required</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  Approve token spending for the bridge transaction.
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => {
                    userAllowance.allow(['min']);
                    setUserAllowance(null);
                  }}
                >
                  Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    userAllowance.deny();
                    setUserAllowance(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Progress Tracking */}
        {progress.isActive && (
          <div className="space-y-6 p-6 rounded-xl border border-blue-200/50 dark:border-blue-800/50 bg-gradient-to-br from-blue-50/30 via-indigo-50/30 to-purple-50/30 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-ping opacity-20" />
                  <div className="relative p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-slate-700 dark:text-slate-200">Bridge in Progress</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Step {progress.currentStep} of {progress.totalSteps}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-blue-100/80 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border-0 font-semibold px-3 py-1">
                {Math.round((progress.currentStep / progress.totalSteps) * 100)}% Complete
              </Badge>
            </div>
            
            <div className="relative">
              <Progress 
                value={(progress.currentStep / progress.totalSteps) * 100} 
                className="w-full h-4 bg-slate-200 dark:bg-slate-800"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-semibold text-white drop-shadow-lg">
                  {Math.round((progress.currentStep / progress.totalSteps) * 100)}%
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {progress.steps.map((step, index) => {
                const isCompleted = index < progress.currentStep;
                const isActive = index === progress.currentStep;
                const stepInfo = getStepDescription(step.typeID, step);
                
                return (
                  <div 
                    key={index}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-xl transition-all duration-500 border",
                      isCompleted 
                        ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300/50 dark:border-emerald-700/30 shadow-sm"
                        : isActive
                        ? "bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-400/50 dark:border-blue-600/30 shadow-md ring-2 ring-blue-400/20 dark:ring-blue-600/20"
                        : "bg-slate-50/50 dark:bg-slate-900/20 border-slate-200/50 dark:border-slate-700/30 opacity-60"
                    )}
                  >
                    <div className={cn(
                      "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                      isCompleted 
                        ? "bg-gradient-to-br from-emerald-500 to-green-600 shadow-md" 
                        : isActive 
                        ? "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg animate-pulse" 
                        : "bg-slate-300 dark:bg-slate-700"
                    )}>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : (
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {getStepIcon(step.typeID, isCompleted, isActive)}
                        <h4 className="font-semibold text-slate-700 dark:text-slate-200">{stepInfo.title}</h4>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {stepInfo.description}
                      </p>
                      {isActive && (
                        <div className="flex items-center gap-2 mt-3 p-2 bg-blue-100/50 dark:bg-blue-900/30 rounded-md">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
                          <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                            Processing transaction...
                          </span>
                        </div>
                      )}
                      {isCompleted && (
                        <div className="flex items-center gap-2 mt-3 p-2 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-md">
                          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                            Completed successfully
                          </span>
                        </div>
                      )}
                    </div>

                    {isCompleted && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {progress.currentStepData?.data && 'explorerURL' in progress.currentStepData.data && progress.currentStepData.data.explorerURL && (
              <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-lg border">
                <ExternalLink className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <div className="font-medium text-sm">Transaction Submitted</div>
                  <a 
                    href={progress.currentStepData.data.explorerURL as string} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View on Block Explorer →
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bridge Result */}
        {bridgeResult && (
          <div className={cn(
            "p-6 rounded-xl border space-y-4 backdrop-blur-sm",
            bridgeResult.success 
              ? "border-emerald-300/50 dark:border-emerald-700/30 bg-gradient-to-br from-emerald-50/40 via-green-50/40 to-teal-50/40 dark:from-emerald-950/20 dark:via-green-950/20 dark:to-teal-950/20" 
              : "border-rose-300/50 dark:border-rose-700/30 bg-gradient-to-br from-rose-50/40 via-red-50/40 to-orange-50/40 dark:from-rose-950/20 dark:via-red-950/20 dark:to-orange-950/20"
          )}>
            <div className="flex items-center gap-4">
              {bridgeResult.success ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full animate-ping opacity-20" />
                  <div className="relative w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-red-600 rounded-full animate-ping opacity-20" />
                  <div className="relative w-14 h-14 bg-gradient-to-br from-rose-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                    <AlertCircle className="w-8 h-8 text-white" />
                  </div>
                </div>
              )}
              <div className="flex-1">
                <h3 className={cn(
                  "text-xl font-bold",
                  bridgeResult.success ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"
                )}>
                  {bridgeResult.success ? '✓ Bridge Successful!' : '✗ Bridge Failed'}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {bridgeResult.success 
                    ? `Successfully bridged ${formData.amount} ${formData.token}` 
                    : 'The bridge operation encountered an error'}
                </p>
              </div>
            </div>
            
            {bridgeResult.success && bridgeResult.explorerUrl && (
              <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-sm transition-all">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-slate-700 dark:text-slate-300">View Transaction</div>
                  <a 
                    href={bridgeResult.explorerUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline text-xs break-all"
                  >
                    {bridgeResult.explorerUrl}
                  </a>
                </div>
              </div>
            )}
            
            {!bridgeResult.success && bridgeResult.error && (
              <div className="p-4 bg-white dark:bg-slate-900/50 rounded-lg border border-rose-200 dark:border-rose-800">
                <div className="font-medium text-sm text-rose-700 dark:text-rose-400 mb-2">Error Details:</div>
                <div className="text-sm text-rose-600 dark:text-rose-400 font-mono bg-rose-50/50 dark:bg-rose-950/30 p-3 rounded">
                  {bridgeResult.error}
                </div>
              </div>
            )}

            {bridgeResult.success && (
              <Button
                onClick={() => setBridgeResult(null)}
                variant="outline"
                size="sm"
                className="w-full border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              >
                Start New Bridge
              </Button>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={handleSimulate}
            variant="outline"
            disabled={!formData.amount || parseFloat(formData.amount) <= 0 || isSimulating}
            className="h-12 border-2 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all duration-300"
            size="lg"
          >
            {isSimulating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                <span className="font-medium">Simulating...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                <span className="font-medium">Simulate Bridge</span>
              </>
            )}
          </Button>
          
          <Button
            onClick={handleBridge}
            disabled={!formData.amount || parseFloat(formData.amount) <= 0 || isBridging || progress.isActive}
            className="h-12 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 text-white font-semibold text-base shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
          >
            {isBridging || progress.isActive ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                <span>Bridging...</span>
              </>
            ) : (
              <>
                <ArrowRightLeft className="w-5 h-5 mr-2" />
                <span>Start Bridge</span>
              </>
            )}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
