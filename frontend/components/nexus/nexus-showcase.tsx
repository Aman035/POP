'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Globe, 
  Coins, 
  ArrowRightLeft, 
  Wallet,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { UnifiedBalanceDisplay } from './unified-balance-display';
import { CrossChainBridge } from './cross-chain-bridge';
import { useNexusSDK } from '@/components/providers/nexus-provider';
import { useWallet } from '@/hooks/wallet/use-wallet';
import { cn } from '@/lib/utils';

interface NexusShowcaseProps {
  className?: string;
}

export function NexusShowcase({ className }: NexusShowcaseProps) {
  const { isConnected, address, isCorrectChain } = useWallet();
  const { isInitialized, progress } = useNexusSDK();
  const [activeTab, setActiveTab] = useState('overview');

  const features = [
    {
      icon: <Globe className="w-5 h-5" />,
      title: 'Cross-Chain Operations',
      description: 'Seamlessly bridge tokens across 16+ testnet chains',
      status: 'active'
    },
    {
      icon: <Wallet className="w-5 h-5" />,
      title: 'Unified Balance Management',
      description: 'View and manage your portfolio across all chains',
      status: 'active'
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Smart Optimizations',
      description: 'Automatic chain abstraction and direct transfers',
      status: 'active'
    },
    {
      icon: <ArrowRightLeft className="w-5 h-5" />,
      title: 'Real-time Progress',
      description: 'Animated progress tracking for all operations',
      status: 'active'
    }
  ];

  const supportedChains = [
    { name: 'Arbitrum Sepolia', id: 421614, status: 'active' },
    { name: 'Base Sepolia', id: 84532, status: 'active' },
    { name: 'Optimism Sepolia', id: 11155420, status: 'active' },
    { name: 'Polygon Amoy', id: 80002, status: 'active' },
    { name: 'Sepolia', id: 11155111, status: 'active' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (!isConnected) {
    return (
      <div className={cn("w-full space-y-6", className)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-gold-2" />
              Cross-Chain Power
            </CardTitle>
            <CardDescription>
              Experience the future of multi-chain DeFi with Avail Nexus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Connect your wallet to access cross-chain features
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Nexus SDK handles its own chain management - no preview mode needed

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-gold-2" />
                Cross-Chain Power
              </CardTitle>
              <CardDescription>
                Experience the future of multi-chain DeFi with Avail Nexus
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {isInitialized ? (
                <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Initializing
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="text-gold-2">{feature.icon}</div>
                <div className="space-y-1">
                  <div className="font-medium text-sm">{feature.title}</div>
                  <div className="text-xs text-muted-foreground">{feature.description}</div>
                  {getStatusBadge(feature.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="balances">Balances</TabsTrigger>
          <TabsTrigger value="bridge">Bridge</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Supported Chains */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-gold-2" />
                Supported Testnet Chains
              </CardTitle>
              <CardDescription>
                Bridge tokens across these testnet networks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {supportedChains.map((chain, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {chain.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{chain.name}</div>
                        <div className="text-xs text-muted-foreground">Chain ID: {chain.id}</div>
                      </div>
                    </div>
                    {getStatusBadge(chain.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-gold-2" />
                How It Works
              </CardTitle>
              <CardDescription>
                Understanding the cross-chain magic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                    1
                  </div>
                  <div>
                    <div className="font-medium">Smart Balance Detection</div>
                    <div className="text-sm text-muted-foreground">
                      The SDK automatically checks if you have sufficient funds on the target chain
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-sm">
                    2
                  </div>
                  <div>
                    <div className="font-medium">Optimized Routing</div>
                    <div className="text-sm text-muted-foreground">
                      Uses direct transfers when possible, falls back to chain abstraction when needed
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-sm">
                    3
                  </div>
                  <div>
                    <div className="font-medium">Real-time Progress</div>
                    <div className="text-sm text-muted-foreground">
                      Track your transaction progress with animated step-by-step updates
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Status */}
          {progress.isActive && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-gold-2" />
                  Operation in Progress
                </CardTitle>
                <CardDescription>
                  Step {progress.currentStep} of {progress.totalSteps}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {progress.steps.map((step, index) => (
                    <div 
                      key={index}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg transition-all",
                        index < progress.currentStep 
                          ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300"
                          : index === progress.currentStep
                          ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <div className="w-6 h-6 rounded-full bg-current flex items-center justify-center text-white text-xs">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{step.typeID}</div>
                        <div className="text-xs opacity-75">Processing...</div>
                      </div>
                      {index < progress.currentStep && (
                        <CheckCircle className="w-5 h-5" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="balances">
          <UnifiedBalanceDisplay showDetails={true} autoRefresh={true} />
        </TabsContent>

        <TabsContent value="bridge">
          <CrossChainBridge 
            onBridgeComplete={(result) => {
              console.log('Bridge completed:', result);
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Footer Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              <span>Powered by Avail Nexus SDK</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Testnet Mode</span>
              <Badge variant="outline">v0.0.1</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
