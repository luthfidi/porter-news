'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { config as wagmiConfig } from '@/lib/wagmi';
import { FarcasterProvider } from '@/contexts/FarcasterProvider';
import { useState, useEffect } from 'react';
import '@coinbase/onchainkit/styles.css';
import '@rainbow-me/rainbowkit/styles.css';

// DISABLED: PrivyProvider causing Monad Testnet issues
// const PrivyProvider = dynamic(
//   () => import('@privy-io/react-auth').then((mod) => ({ default: mod.PrivyProvider })),
//   { ssr: false }
// );

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  // Suppress console warnings for known Privy issues
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const originalError = console.error;
      console.error = (...args) => {
        if (
          typeof args[0] === 'string' &&
          (args[0].includes('unique "key" prop') ||
           args[0].includes('cannot be a descendant') ||
           args[0].includes('validateDOMNesting'))
        ) {
          return;
        }
        originalError.apply(console, args);
      };

      // Cleanup function to restore original console.error
      return () => {
        console.error = originalError;
      };
    }
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <FarcasterProvider>
            {children}
          </FarcasterProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}