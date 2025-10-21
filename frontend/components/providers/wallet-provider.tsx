'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { config } from '@/lib/wallet-config';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

// Import RainbowKit styles
import '@rainbow-me/rainbowkit/styles.css';

interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: (failureCount, error) => {
          // Don't retry on certain errors
          if (error instanceof Error && error.message.includes('User rejected')) {
            return false;
          }
          return failureCount < 3;
        },
      },
    },
  }));

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitThemeProvider>
          {children}
        </RainbowKitThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// Separate component to handle theme switching
function RainbowKitThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <RainbowKitProvider
      theme={isDark ? darkTheme() : lightTheme()}
      appInfo={{
        appName: process.env.NEXT_PUBLIC_APP_NAME || 'POP',
        learnMoreUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://pop.xyz',
      }}
      initialChain={config.chains[0]}
      showRecentTransactions={true}
    >
      {children}
    </RainbowKitProvider>
  );
}
