'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import dynamic from 'next/dynamic';

import { config } from '@/lib/wagmi';
import '@rainbow-me/rainbowkit/styles.css';
import '@coinbase/onchainkit/styles.css';

const queryClient = new QueryClient();

// Dynamic import wallet providers to avoid SSR issues with indexedDB
const WalletProviders = dynamic(
  () => import('./wallet-providers').then(mod => ({ default: mod.WalletProviders })),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletProviders>
          {children}
        </WalletProviders>
      </QueryClientProvider>
    </WagmiProvider>
  );
}