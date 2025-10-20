import { News, Pool, PoolStake, ReputationData } from '@/types';
import { MOCK_NEWS } from './news.mock';
import { MOCK_POOLS } from './pools.mock';
import { MOCK_POOL_STAKES } from './stakes.mock';
import { MOCK_REPUTATION } from './reputation.mock';

/**
 * MOCK DATA HELPER FUNCTIONS
 *
 * This file contains utility functions for querying and manipulating mock data.
 * When integrating with smart contracts, these helpers will be replaced by service layer functions.
 *
 * Contract Integration:
 * - These functions will move to services layer (e.g., newsService.getById())
 * - Services will handle both mock data AND contract calls
 */

export function getNewsByCategory(category: string): News[] {
  if (category === 'All') return MOCK_NEWS;
  return MOCK_NEWS.filter(news => news.category === category);
}

export function getNewsById(id: string): News | undefined {
  return MOCK_NEWS.find(news => news.id === id);
}

export function getPoolsByNewsId(newsId: string): Pool[] {
  return MOCK_POOLS.filter(pool => pool.newsId === newsId);
}

export function getPoolById(id: string): Pool | undefined {
  return MOCK_POOLS.find(pool => pool.id === id);
}

export function getPoolStakesByPoolId(poolId: string): PoolStake[] {
  return MOCK_POOL_STAKES.filter(stake => stake.poolId === poolId);
}

export function getNewsCategories(): string[] {
  return ['All', ...Array.from(new Set(MOCK_NEWS.map(news => news.category)))];
}

// Calculate pool stats
export function getPoolStats(pool: Pool) {
  const agreePercentage = pool.totalStaked > 0
    ? (pool.agreeStakes / pool.totalStaked) * 100
    : 0;
  const disagreePercentage = pool.totalStaked > 0
    ? (pool.disagreeStakes / pool.totalStaked) * 100
    : 0;

  return {
    agreePercentage,
    disagreePercentage,
    totalStakers: getPoolStakesByPoolId(pool.id).length,
    agreeStakers: getPoolStakesByPoolId(pool.id).filter(s => s.position === 'agree').length,
    disagreeStakers: getPoolStakesByPoolId(pool.id).filter(s => s.position === 'disagree').length
  };
}

// Calculate news stats
export function getNewsStats(newsId: string) {
  const pools = getPoolsByNewsId(newsId);
  const yesPools = pools.filter(p => p.position === 'YES').length;
  const noPools = pools.filter(p => p.position === 'NO').length;
  const totalStaked = pools.reduce((sum, p) => sum + p.totalStaked, 0);

  return {
    totalPools: pools.length,
    yesPools,
    noPools,
    totalStaked
  };
}

// Get reputation data for an address
export function getReputationData(address: string): ReputationData | undefined {
  return MOCK_REPUTATION[address];
}

// Get pools created by address
export function getPoolsByCreator(address: string): Pool[] {
  return MOCK_POOLS.filter(pool => pool.creatorAddress === address);
}

// Get stakes made by address
export function getStakesByUser(address: string): PoolStake[] {
  return MOCK_POOL_STAKES.filter(stake => stake.userAddress === address);
}

// Get tier icon
export function getTierIcon(tier: string): string {
  switch (tier) {
    case 'Novice': return '🥉';
    case 'Analyst': return '🥈';
    case 'Expert': return '🥇';
    case 'Master': return '💎';
    case 'Legend': return '👑';
    default: return '❓';
  }
}

// Calculate tier based on accuracy
export function calculateTier(accuracy: number): 'Novice' | 'Analyst' | 'Expert' | 'Master' | 'Legend' {
  if (accuracy >= 95) return 'Legend';
  if (accuracy >= 85) return 'Master';
  if (accuracy >= 70) return 'Expert';
  if (accuracy >= 50) return 'Analyst';
  return 'Novice';
}

// Get all analysts (users who have created pools)
export function getAllAnalysts(): ReputationData[] {
  return Object.values(MOCK_REPUTATION);
}

// Get analysts by tier
export function getAnalystsByTier(tier?: string): ReputationData[] {
  const analysts = getAllAnalysts();
  if (!tier || tier === 'All') return analysts;
  return analysts.filter(a => a.tier === tier);
}

// Get analysts by category
export function getAnalystsByCategory(category?: string): ReputationData[] {
  const analysts = getAllAnalysts();
  if (!category || category === 'All') return analysts;
  return analysts.filter(a => a.specialty?.includes(category));
}

// Sort analysts
export function sortAnalysts(
  analysts: ReputationData[],
  sortBy: 'accuracy' | 'totalPools' | 'recent' | 'score' | 'successRate' | 'totalStaked' = 'accuracy'
): ReputationData[] {
  const sorted = [...analysts];

  if (sortBy === 'accuracy') {
    // Sort by tier first, then accuracy within tier
    const tierOrder = { 'Legend': 5, 'Master': 4, 'Expert': 3, 'Analyst': 2, 'Novice': 1 };
    sorted.sort((a, b) => {
      const tierDiff = tierOrder[b.tier] - tierOrder[a.tier];
      if (tierDiff !== 0) return tierDiff;
      return b.accuracy - a.accuracy;
    });
  } else if (sortBy === 'totalPools') {
    sorted.sort((a, b) => b.totalPools - a.totalPools);
  } else if (sortBy === 'recent') {
    sorted.sort((a, b) => (b.memberSince?.getTime() ?? 0) - (a.memberSince?.getTime() ?? 0));
  } else if (sortBy === 'score') {
    // Sort by score (use accuracy as score for reputation data)
    sorted.sort((a, b) => b.accuracy - a.accuracy);
  } else if (sortBy === 'successRate') {
    // Sort by success rate (use accuracy for reputation data)
    sorted.sort((a, b) => b.accuracy - a.accuracy);
  } else if (sortBy === 'totalStaked') {
    // Sort by total pools (reputation doesn't track totalStaked, use totalPools)
    sorted.sort((a, b) => b.totalPools - a.totalPools);
  }

  return sorted;
}

// Get user profile stats (including stakes even if no pools)
export interface UserProfileStats {
  address: string;
  reputation?: ReputationData;
  totalPools: number;
  totalStakes: number;
  totalNews: number;
  stakesWon?: number;
  stakesLost?: number;
  stakesActive?: number;
}

export function getUserProfileStats(address: string): UserProfileStats {
  const reputation = getReputationData(address);
  const pools = getPoolsByCreator(address);
  const stakes = getStakesByUser(address);
  const newsCreated = MOCK_NEWS.filter(n => n.creatorAddress === address);

  // Calculate stakes win/loss (based on resolved pools)
  let stakesWon = 0;
  let stakesLost = 0;
  let stakesActive = 0;

  stakes.forEach(stake => {
    const pool = getPoolById(stake.poolId);
    if (!pool) return;

    if (pool.status === 'resolved' && pool.outcome) {
      const userWon =
        (stake.position === 'agree' && pool.outcome === 'creator_correct') ||
        (stake.position === 'disagree' && pool.outcome === 'creator_wrong');

      if (userWon) stakesWon++;
      else stakesLost++;
    } else {
      stakesActive++;
    }
  });

  return {
    address,
    reputation,
    totalPools: pools.length,
    totalStakes: stakes.length,
    totalNews: newsCreated.length,
    stakesWon,
    stakesLost,
    stakesActive
  };
}
