'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { User, AlertCircle } from 'lucide-react';
import { useWallet } from './useWallet';

interface WalletConnectProps {
  className?: string;
}

export function WalletConnect({ className }: WalletConnectProps) {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { isCorrectNetwork, switchToMonadTestnet } = useWallet();
  const [hasMounted, setHasMounted] = useState(false);

  // ClientOnly - prevent hydration mismatch
  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  // Loading state
  if (!ready) {
    return (
      <Button disabled className={className}>
        Loading...
      </Button>
    );
  }

  // Not connected
  if (!authenticated) {
    return (
      <Button
        onClick={login}
        className={`bg-gradient-to-r from-primary/70 to-accent/70 hover:from-primary hover:to-accent shadow-sm ${className}`}
      >
        Connect Wallet
      </Button>
    );
  }

  // Get wallet address for display
  const walletAddress = user?.wallet?.address;
  const displayName = user?.email?.address ||
    user?.google?.email ||
    (walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'User');

  // Wrong network - show prominent warning and block usage
  if (authenticated && !isCorrectNetwork) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Wrong Network!</p>
            <p className="text-xs opacity-80">Please switch to Monad Testnet to continue</p>
          </div>
        </div>
        <Button
          onClick={switchToMonadTestnet}
          className="bg-gradient-to-r from-red-500/70 to-orange-500/70 hover:from-red-500 hover:to-orange-500"
        >
          Switch to Monad Testnet
        </Button>
        <Button
          onClick={logout}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  // Connected state (on correct network)
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Wallet Button */}
      <Button
        onClick={logout}
        variant="outline"
        className="bg-card border-border/40 hover:bg-card/80 transition-colors"
      >
        <div className="w-2 h-2 rounded-full bg-gradient-to-br from-primary to-accent mr-2" />
        <span className="font-mono text-sm font-medium truncate max-w-[120px]">
          {displayName}
        </span>
        <User className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}
