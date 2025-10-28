/**
 * React Hook for MetaMask Smart Accounts Integration
 * Porter News - Information Finance Protocol on Monad
 */

import { useState, useCallback, useEffect } from 'react';
import { useAccount, useSignMessage, useChainId } from 'wagmi';
import {
  createAIDelegation,
  revokeAIDelegation,
  getUserDelegations,
  hasAIPermission,
  getAIPerformance,
  signDelegationMessage,
  executeDelegatedTransaction,
  AI_AGENTS,
  AIAgentConfig,
  AIPerformance
} from '../metamask-smart-accounts';

export interface UseMetaMaskSmartAccountsReturn {
  // State
  isDelegationEnabled: boolean;
  activeDelegations: any[];
  aiPerformances: Record<string, AIPerformance>;
  isLoading: boolean;
  error: string | null;

  // Actions
  enableDelegation: (agentId: string) => Promise<void>;
  disableDelegation: (delegationId: string) => Promise<void>;
  refreshDelegations: () => Promise<void>;
  refreshPerformances: () => Promise<void>;
  canExecuteAction: (agentId: string, action: string, amount?: string) => boolean;
}

export function useMetaMaskSmartAccounts(): UseMetaMaskSmartAccountsReturn {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const chainId = useChainId();

  const [isDelegationEnabled, setIsDelegationEnabled] = useState(false);
  const [activeDelegations, setActiveDelegations] = useState<any[]>([]);
  const [aiPerformances, setAiPerformances] = useState<Record<string, AIPerformance>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if delegation is enabled in environment
  useEffect(() => {
    const delegationEnabled = process.env.NEXT_PUBLIC_DELEGATION_ENABLED === 'true';
    setIsDelegationEnabled(delegationEnabled);
  }, []);

  // Refresh delegations when account changes
  useEffect(() => {
    if (address && isDelegationEnabled) {
      refreshDelegations();
    }
  }, [address, isDelegationEnabled, refreshDelegations]);

  // Load AI performances on mount
  useEffect(() => {
    if (isDelegationEnabled) {
      refreshPerformances();
    }
  }, [isDelegationEnabled, refreshPerformances]);

  const refreshDelegations = useCallback(async () => {
    if (!address || !isDelegationEnabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const delegations = await getUserDelegations(address);
      setActiveDelegations(delegations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch delegations');
      console.error('Error refreshing delegations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [address, isDelegationEnabled, refreshDelegations]);

  const refreshPerformances = useCallback(async () => {
    if (!isDelegationEnabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const performances: Record<string, AIPerformance> = {};

      for (const agent of AI_AGENTS) {
        try {
          const performance = await getAIPerformance(agent.id);
          performances[agent.id] = performance;
        } catch (err) {
          console.error(`Error fetching performance for ${agent.id}:`, err);
          // Set default performance
          performances[agent.id] = {
            agentId: agent.id,
            totalPoolsCreated: 0,
            totalStakes: 0,
            successRate: 0,
            totalProfit: '0',
            averageReturn: '0',
          };
        }
      }

      setAiPerformances(performances);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch AI performances');
      console.error('Error refreshing performances:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isDelegationEnabled]);

  const enableDelegation = useCallback(async (agentId: string) => {
    if (!address || !isDelegationEnabled) {
      throw new Error('MetaMask Smart Accounts not enabled or wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Find the AI agent configuration
      const agentConfig = AI_AGENTS.find(agent => agent.id === agentId);
      if (!agentConfig) {
        throw new Error(`AI Agent ${agentId} not found`);
      }

      // Create delegation message
      const delegationMessage = JSON.stringify({
        type: 'AI_DELEGATION',
        agentId,
        permissions: agentConfig.permissions,
        timestamp: Date.now(),
        chainId,
      });

      // Sign the message with MetaMask Smart Account
      const signature = await signMessageAsync({ message: delegationMessage });

      // Create the delegation
      await createAIDelegation(address, agentConfig, signature);

      // Refresh delegations
      await refreshDelegations();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enable delegation';
      setError(errorMessage);
      console.error('Error enabling delegation:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [address, isDelegationEnabled, signMessageAsync, chainId, refreshDelegations]);

  const disableDelegation = useCallback(async (delegationId: string) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      await revokeAIDelegation(delegationId, address);

      // Refresh delegations
      await refreshDelegations();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disable delegation';
      setError(errorMessage);
      console.error('Error disabling delegation:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [address, refreshDelegations]);

  const canExecuteAction = useCallback((
    agentId: string,
    action: string,
    amount?: string
  ): boolean => {
    if (!isDelegationEnabled) return false;

    return hasAIPermission(agentId, action, amount, activeDelegations);
  }, [isDelegationEnabled, activeDelegations]);

  return {
    // State
    isDelegationEnabled,
    activeDelegations,
    aiPerformances,
    isLoading,
    error,

    // Actions
    enableDelegation,
    disableDelegation,
    refreshDelegations,
    refreshPerformances,
    canExecuteAction,
  };
}

export default useMetaMaskSmartAccounts;