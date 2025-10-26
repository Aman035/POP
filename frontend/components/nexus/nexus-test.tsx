'use client';

import React from 'react';
import { BridgeButton, TransferButton } from '@avail-project/nexus-widgets';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function NexusTest() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Nexus SDK Test</h3>
      <div className="space-y-4">
        <BridgeButton prefill={{ chainId: 421614, token: 'ETH', amount: '0.01' }}>
          {({ onClick, isLoading }) => (
            <Button onClick={onClick} disabled={isLoading}>
              {isLoading ? 'Bridging...' : 'Bridge 0.01 ETH to Arbitrum Sepolia'}
            </Button>
          )}
        </BridgeButton>
        
        <TransferButton>
          {({ onClick, isLoading }) => (
            <Button onClick={onClick} disabled={isLoading}>
              {isLoading ? 'Transferring...' : 'Transfer ETH'}
            </Button>
          )}
        </TransferButton>
      </div>
    </Card>
  );
}
