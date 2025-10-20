import { PoolStake, StakeInput } from '@/types';
import {
  MOCK_POOL_STAKES,
  getPoolStakesByPoolId as mockGetPoolStakesByPoolId,
  getStakesByUser as mockGetStakesByUser,
} from '@/lib/mock-data';
import { isContractsEnabled } from '@/config/contracts';
import { 
  stakeOnPoolContract,
  handleContractError 
} from '@/lib/contracts/utils';

/**
 * STAKING SERVICE
 *
 * ⭐ THIS IS THE INTEGRATION POINT FOR STAKING SMART CONTRACT ⭐
 *
 * This service abstracts data fetching and writing for STAKING operations.
 * Currently uses mock data, but designed to seamlessly integrate with smart contracts.
 *
 * SMART CONTRACT INTEGRATION GUIDE:
 *
 * 1. Add contract imports:
 *    ```typescript
 *    import { readContract, writeContract } from 'wagmi/actions';
 *    import { StakingManagerABI } from '@/lib/abis/StakingManager.abi';
 *    import { contracts } from '@/config/contracts';
 *    ```
 *
 * 2. Add environment toggle:
 *    ```typescript
 *    const USE_CONTRACTS = process.env.NEXT_PUBLIC_USE_CONTRACTS === 'true';
 *    ```
 *
 * 3. Update each method to check USE_CONTRACTS:
 *    ```typescript
 *    async stake(input: StakeInput) {
 *      if (USE_CONTRACTS) {
 *        const hash = await writeContract({
 *          address: contracts.stakingManager,
 *          abi: StakingManagerABI,
 *          functionName: 'stake',
 *          args: [
 *            BigInt(input.poolId),
 *            input.position === 'agree' ? true : false,
 *            parseUnits(input.amount.toString(), 6),
 *          ],
 *        });
 *        await waitForTransaction({ hash });
 *        return this.getByPoolId(input.poolId);
 *      }
 *      return mockStake(input);
 *    }
 *    ```
 *
 * See INTEGRATION_GUIDE.md for complete examples.
 */

class StakingService {
  /**
   * Get all stakes (all users, all pools)
   *
   * Contract Integration:
   * - Option 1: Query events (StakeCreated, StakeWithdrawn)
   * - Option 2: Use off-chain indexer (The Graph)
   * - Option 3: Contract view function getAllStakes() (gas-intensive)
   */
  async getAll(): Promise<PoolStake[]> {
    // TODO: Add contract integration here
    // if (USE_CONTRACTS) { ... }

    // Simulate API delay for realistic testing
    await new Promise(resolve => setTimeout(resolve, 500));

    return MOCK_POOL_STAKES;
  }

  /**
   * Get stakes by POOL ID
   *
   * Contract Integration:
   * - Function: getPoolStakeStats(newsId, poolId) for aggregated data
   * - Used to display "Supporters" and "Opponents" on pool detail page
   * - Individual stakes require event indexing for full history
   */
  async getByPoolId(poolId: string): Promise<PoolStake[]> {
    if (!isContractsEnabled()) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockGetPoolStakesByPoolId(poolId);
    }

    try {
      console.log('[StakingService] Fetching stakes for pool from contract:', poolId);
      
      // Individual stake history requires event indexing
      // For now, we'll fall back to mock data for detailed stake list
      // In production, this would use events or The Graph protocol
      
      console.log('[StakingService] Pool stake details require event indexing, falling back to mock');
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockGetPoolStakesByPoolId(poolId);

    } catch (error) {
      console.error('[StakingService] Contract getByPoolId failed, falling back to mock:', error);
      
      // Fallback to mock data on error
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockGetPoolStakesByPoolId(poolId);
      }
      
      throw new Error(handleContractError(error));
    }
  }

  /**
   * Get stakes by USER ADDRESS
   *
   * Contract Integration:
   * - Function: getUserStake(newsId, poolId, user) for each pool
   * - Used for user profile page "Staking History"
   */
  async getByUser(userAddress: string): Promise<PoolStake[]> {
    if (!isContractsEnabled()) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return mockGetStakesByUser(userAddress);
    }

    try {
      console.log('[StakingService] Fetching stakes for user from contract:', userAddress);
      
      // Since contract doesn't have a direct getUserStakes function,
      // we'd need to iterate through all news/pools or use events
      // For now, fall back to mock data for user stakes
      // In production, this would be implemented with event indexing or The Graph
      
      console.log('[StakingService] User stakes require event indexing, falling back to mock');
      await new Promise(resolve => setTimeout(resolve, 400));
      return mockGetStakesByUser(userAddress);

    } catch (error) {
      console.error('[StakingService] Contract getByUser failed, falling back to mock:', error);
      
      // Fallback to mock data on error
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 400));
        return mockGetStakesByUser(userAddress);
      }
      
      throw new Error(handleContractError(error));
    }
  }

  /**
   * Create new stake (agree or disagree with pool)
   *
   * Contract Integration:
   * - Function: stake(newsId, poolId, amount, userPosition)
   * - Requires: USDC approval first (2-step transaction)
   * - Emits: Staked event
   */
  async stake(input: StakeInput): Promise<PoolStake> {
    if (!isContractsEnabled()) {
      // Mock implementation for development
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newStake: PoolStake = {
        id: `stake-${Date.now()}`,
        poolId: input.poolId,
        userAddress: '0xuser...mock',
        position: input.position,
        amount: input.amount,
        createdAt: new Date(),
      };

      return newStake;
    }

    try {
      console.log('[StakingService] Creating stake via smart contract...', input);

      // We need the newsId for the contract call
      // For now, we'll use a default newsId since we don't have it in the input
      // In a real app, we'd store newsId with the poolId or pass it in the input
      const newsId = '0'; // TODO: Get actual newsId from pool or pass in input

      // Call smart contract to create stake
      const result = await stakeOnPoolContract(
        newsId,
        input.poolId,
        input.amount,
        input.position === 'agree' // true = agree, false = disagree
      );

      if (!result.success) {
        throw new Error(result.error || 'Staking transaction failed');
      }

      console.log('[StakingService] Stake transaction successful:', result.hash);

      // Create the stake object based on the successful transaction
      const newStake: PoolStake = {
        id: `stake-${Date.now()}`, // In real app, get from event
        poolId: input.poolId,
        userAddress: '0xConnectedWallet', // TODO: Get from connected wallet
        position: input.position,
        amount: input.amount,
        createdAt: new Date(),
      };

      console.log('[StakingService] Successfully created stake:', newStake);
      return newStake;

    } catch (error) {
      console.error('[StakingService] Stake failed:', error);
      throw new Error(handleContractError(error));
    }
  }

  /**
   * Withdraw stake (before pool resolution)
   *
   * Contract Integration:
   * ```typescript
   * const hash = await writeContract({
   *   address: contracts.stakingManager,
   *   abi: StakingManagerABI,
   *   functionName: 'withdrawStake',
   *   args: [BigInt(stakeId)],
   * });
   *
   * await waitForTransaction({ hash });
   * ```
   *
   * Note: Contract should enforce withdrawal rules:
   * - Only allow before pool resolution
   * - Apply withdrawal penalty (e.g., 2%)
   * - Update pool's agreeStakes/disagreeStakes
   */
  async withdraw(stakeId: string): Promise<void> {
    // TODO: Add contract integration here

    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock: Remove stake from array
    console.log(`[Mock] Withdrew stake ${stakeId}`);
  }

  /**
   * Claim rewards (after pool resolution)
   *
   * Contract Integration:
   * ```typescript
   * const hash = await writeContract({
   *   address: contracts.stakingManager,
   *   abi: StakingManagerABI,
   *   functionName: 'claimRewards',
   *   args: [BigInt(poolId)],
   * });
   *
   * const receipt = await waitForTransaction({ hash });
   *
   * // Extract reward amount from event
   * const rewardAmount = receipt.logs[0].data; // Parse based on ABI
   *
   * return formatUnits(rewardAmount, 6); // Convert to decimal
   * ```
   *
   * Note: Contract calculates rewards based on:
   * - Pool outcome (creator correct/wrong)
   * - User's position (agree/disagree)
   * - Reward distribution algorithm
   */
  async claimRewards(
    poolId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _userAddress: string
  ): Promise<number> {
    // TODO: Add contract integration here

    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock reward amount
    const mockReward = 50; // $50 USDC
    console.log(`[Mock] Claimed ${mockReward} USDC from pool ${poolId}`);

    return mockReward;
  }

  /**
   * Calculate claimable rewards for user (view function)
   *
   * Contract Integration:
   * - Function: calculateRewards(newsId, poolId, userAddress)
   * - Returns: uint256 reward amount in USDC wei
   */
  async getClaimableRewards(poolId: string, userAddress: string): Promise<number> {
    if (!isContractsEnabled()) {
      await new Promise(resolve => setTimeout(resolve, 300));

      // Mock calculation
      const userStakes = await this.getByUser(userAddress);
      const poolStakes = userStakes.filter(s => s.poolId === poolId);

      if (poolStakes.length === 0) return 0;

      // Simplified mock reward calculation
      const totalStaked = poolStakes.reduce((sum, s) => sum + s.amount, 0);
      const mockMultiplier = 1.5; // 50% profit
      return totalStaked * mockMultiplier;
    }

    try {
      console.log('[StakingService] Calculating claimable rewards from contract:', { poolId, userAddress });
      
      // For now, we'll use mock calculation since rewards calculation
      // requires knowing the pool resolution status and user's position
      // This would be implemented with the actual contract function
      
      console.log('[StakingService] Rewards calculation not yet implemented, using mock');
      
      // Mock calculation
      const userStakes = await this.getByUser(userAddress);
      const poolStakes = userStakes.filter(s => s.poolId === poolId);

      if (poolStakes.length === 0) return 0;

      const totalStaked = poolStakes.reduce((sum, s) => sum + s.amount, 0);
      const mockMultiplier = 1.2; // 20% profit for contract mode
      return totalStaked * mockMultiplier;

    } catch (error) {
      console.error('[StakingService] Contract getClaimableRewards failed:', error);
      return 0;
    }
  }

  /**
   * Get staking statistics
   * (Can be calculated client-side or fetched from contract)
   */
  async getStats(poolId?: string, userAddress?: string) {
    let stakes: PoolStake[];

    if (poolId && userAddress) {
      stakes = await this.getByUser(userAddress);
      stakes = stakes.filter(s => s.poolId === poolId);
    } else if (poolId) {
      stakes = await this.getByPoolId(poolId);
    } else if (userAddress) {
      stakes = await this.getByUser(userAddress);
    } else {
      stakes = await this.getAll();
    }

    const agreeStakes = stakes.filter(s => s.position === 'agree');
    const disagreeStakes = stakes.filter(s => s.position === 'disagree');

    return {
      totalStakes: stakes.length,
      totalAmount: stakes.reduce((sum, s) => sum + s.amount, 0),
      agreeCount: agreeStakes.length,
      agreeAmount: agreeStakes.reduce((sum, s) => sum + s.amount, 0),
      disagreeCount: disagreeStakes.length,
      disagreeAmount: disagreeStakes.reduce((sum, s) => sum + s.amount, 0),
      uniqueStakers: new Set(stakes.map(s => s.userAddress)).size,
    };
  }

  /**
   * Check if user has staked on a pool
   * (Helper function for UI state)
   */
  async hasUserStaked(poolId: string, userAddress: string): Promise<boolean> {
    const userStakes = await this.getByUser(userAddress);
    return userStakes.some(s => s.poolId === poolId);
  }

  /**
   * Get user's position on a pool
   * (Helper function for UI state)
   */
  async getUserPosition(
    poolId: string,
    userAddress: string
  ): Promise<'agree' | 'disagree' | null> {
    const userStakes = await this.getByUser(userAddress);
    const poolStake = userStakes.find(s => s.poolId === poolId);
    return poolStake?.position || null;
  }
}

// Export singleton instance
export const stakingService = new StakingService();
