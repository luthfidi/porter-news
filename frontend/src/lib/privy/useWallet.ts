'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useAccount, useBalance, useChainId, useSwitchChain } from 'wagmi';
import { useCallback, useEffect } from 'react';
import { defineChain } from 'viem';

// Define Monad Testnet chain
const monadTestnet = defineChain({
  id: 41454,
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MON',
    symbol: 'MON',
  },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
    public: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' },
  },
  testnet: true,
});

// Get USDC contract address from environment
const USDC_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS as `0x${string}`;

export function useWallet() {
  const { authenticated, user, logout } = usePrivy();
  const { wallets } = useWallets();
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  // Get the active wallet address - either from embedded wallet or connected wallet
  const walletAddress = address || wallets[0]?.address;
  const isCorrectNetwork = chainId === monadTestnet.id;
  const isConnected = authenticated && !!walletAddress;

  // Auto-switch to Monad Testnet when wallet is authenticated but on wrong network
  useEffect(() => {
    if (authenticated && walletAddress && !isCorrectNetwork && switchChain) {
      // Add a small delay to ensure wallet is fully initialized
      const timer = setTimeout(() => {
        try {
          console.log('Auto-switching to Monad Testnet...');
          switchChain({ chainId: monadTestnet.id });
          console.log('Initiated switch to Monad Testnet');
        } catch (error) {
          console.error('Failed to auto-switch network:', error);
          // User will see the manual switch button in WalletConnect component
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [authenticated, walletAddress, isCorrectNetwork, switchChain]);

  const switchToMonadTestnet = useCallback(() => {
    if (switchChain) {
      try {
        switchChain({ chainId: monadTestnet.id });
        return true;
      } catch (error) {
        console.error('Failed to switch network:', error);
        return false;
      }
    }
    return false;
  }, [switchChain]);

  const { data: usdcBalance } = useBalance({
    address: walletAddress as `0x${string}`,
    token: USDC_ADDRESS,
  });

  const { data: ethBalance } = useBalance({
    address: walletAddress as `0x${string}`,
  });

  const getBalance = useCallback(async (assetSymbol: string): Promise<number> => {
    // Block balance queries if not on correct network
    if (!walletAddress || !isCorrectNetwork) return 0;

    if (assetSymbol === 'USDC' && usdcBalance) {
      return Number(usdcBalance.value) / Math.pow(10, usdcBalance.decimals);
    }

    if (assetSymbol === 'MON' && ethBalance) {
      return Number(ethBalance.value) / Math.pow(10, ethBalance.decimals);
    }

    // Mock balances for other tokens
    const mockBalances: Record<string, number> = {
      'cbBTC': 0.5,
      'cbETH': 2.5,
    };

    return mockBalances[assetSymbol] || 0;
  }, [walletAddress, isCorrectNetwork, usdcBalance, ethBalance]);

  return {
    address: walletAddress,
    isConnected,
    isCorrectNetwork,
    chainId,
    disconnect: logout,
    getBalance,
    // Return 0 balance if not on correct network
    usdcBalance: (isCorrectNetwork && usdcBalance) ? Number(usdcBalance.value) / Math.pow(10, usdcBalance.decimals) : 0,
    monBalance: (isCorrectNetwork && ethBalance) ? Number(ethBalance.value) / Math.pow(10, ethBalance.decimals) : 0,
    user,
    authenticated,
    switchToMonadTestnet
  };
}
