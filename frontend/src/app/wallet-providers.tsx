'use client';

import { useEffect, ReactNode } from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

// Define Monad Testnet chain (must match wagmi.ts definition)
const monad = defineChain({
  id: 41454,
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MON',
    symbol: 'MON'
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_MONAD_RPC_URL || 'https://rpc.monad.xyz']
    }
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: 'https://testnet.monadexplorer.com'
    }
  },
  testnet: true,
});

interface WalletProvidersProps {
  children: ReactNode;
}

export function WalletProviders({ children }: WalletProvidersProps) {
  useEffect(() => {
    // Initialize MiniApp SDK when app is ready (client-side only)
    const initializeMiniApp = async () => {
      try {
        // Dynamic import to make it optional
        const { sdk } = await import('@farcaster/miniapp-sdk');

        // Wait for the app to be fully loaded
        await new Promise(resolve => setTimeout(resolve, 100));

        // Signal that the app is ready to be displayed
        await sdk.actions.ready();

        console.log('🎯 Porter MiniApp ready!');
      } catch (error) {
        console.warn('MiniApp SDK not available or initialization failed:', error);
        // App will still work normally if not in MiniApp context
      }
    };

    initializeMiniApp();
  }, []);

  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={monad}
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
        {children}
      </RainbowKitProvider>
    </OnchainKitProvider>
  );
}
