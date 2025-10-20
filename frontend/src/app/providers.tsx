'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { baseSepolia } from 'viem/chains';

import { config } from '@/lib/wagmi';
import '@rainbow-me/rainbowkit/styles.css';
import '@coinbase/onchainkit/styles.css';

const queryClient = new QueryClient();

function MiniAppProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize MiniApp SDK when app is ready (optional)
    const initializeMiniApp = async () => {
      try {
        // Dynamic import to make it optional
        const { sdk } = await import('@farcaster/miniapp-sdk');

        // Wait for the app to be fully loaded
        await new Promise(resolve => setTimeout(resolve, 100));

        // Signal that the app is ready to be displayed
        await sdk.actions.ready();

        console.log('🎯 Forter MiniApp ready!');
      } catch (error) {
        console.warn('MiniApp SDK not available or initialization failed:', error);
        // App will still work normally if not in MiniApp context
      }
    };

    initializeMiniApp();
  }, []);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={baseSepolia}
          config={{
            appearance: {
              mode: 'auto',
            },
            wallet: {
              display: 'modal',
            },
          }}
        >
          <RainbowKitProvider>
            <MiniAppProvider>
              {children}
            </MiniAppProvider>
          </RainbowKitProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}