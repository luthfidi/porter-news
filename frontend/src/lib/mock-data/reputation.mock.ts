import { ReputationData } from '@/types';

/**
 * MOCK REPUTATION DATA
 *
 * This file contains mock data for user reputation (calculated from pool creation performance).
 * When integrating with smart contracts, this data is calculated on-chain or indexed from events.
 *
 * Contract Integration Point:
 * - On-chain: Reputation NFT contract tracks stats automatically
 * - Or: Index pool resolution events to calculate accuracy/stats
 * - Map contract struct to ReputationData interface (see types/index.ts)
 */

export const MOCK_REPUTATION: Record<string, ReputationData> = {
  '0x1234...5678': {
    address: '0x1234...5678',
    accuracy: 87,
    totalPools: 3,
    correctPools: 2,         // pool-1 (active), pool-10 (correct)
    wrongPools: 0,
    activePools: 1,
    tier: 'Master',
    nftTokenId: 1,
    categoryStats: {
      'Crypto': { total: 3, correct: 2, accuracy: 66.67 }
    },
    currentStreak: 1,
    bestStreak: 2,
    specialty: 'Crypto',
    memberSince: new Date('2024-09-15')
  },
  '0xabcd...efgh': {
    address: '0xabcd...efgh',
    accuracy: 50,
    totalPools: 2,
    correctPools: 0,
    wrongPools: 1,           // pool-11 (wrong)
    activePools: 1,          // pool-2 (active)
    tier: 'Analyst',
    nftTokenId: 2,
    categoryStats: {
      'Crypto': { total: 2, correct: 0, accuracy: 0 }
    },
    currentStreak: 0,
    bestStreak: 0,
    specialty: 'Crypto',
    memberSince: new Date('2024-09-17')
  },
  '0x9999...1111': {
    address: '0x9999...1111',
    accuracy: 100,
    totalPools: 2,
    correctPools: 1,         // pool-12 (correct)
    wrongPools: 0,
    activePools: 1,          // pool-3 (active)
    tier: 'Legend',
    nftTokenId: 3,
    categoryStats: {
      'Crypto': { total: 2, correct: 1, accuracy: 50 }
    },
    currentStreak: 1,
    bestStreak: 1,
    specialty: 'Crypto',
    memberSince: new Date('2024-09-18')
  },
  '0x2222...3333': {
    address: '0x2222...3333',
    accuracy: 50,
    totalPools: 2,
    correctPools: 0,
    wrongPools: 1,           // pool-13 (wrong)
    activePools: 1,          // pool-4 (active)
    tier: 'Analyst',
    nftTokenId: 4,
    categoryStats: {
      'Crypto': { total: 1, correct: 0, accuracy: 0 },
      'Tech': { total: 1, correct: 0, accuracy: 0 }
    },
    currentStreak: 0,
    bestStreak: 0,
    specialty: 'Crypto',
    memberSince: new Date('2024-08-05')
  },
  '0x4444...5555': {
    address: '0x4444...5555',
    accuracy: 100,
    totalPools: 2,
    correctPools: 1,         // pool-14 (correct)
    wrongPools: 0,
    activePools: 1,          // pool-5 (active)
    tier: 'Legend',
    nftTokenId: 5,
    categoryStats: {
      'Crypto': { total: 1, correct: 0, accuracy: 0 },
      'Tech': { total: 1, correct: 1, accuracy: 100 }
    },
    currentStreak: 1,
    bestStreak: 1,
    specialty: 'Tech',
    memberSince: new Date('2024-08-06')
  },
  '0x6666...7777': {
    address: '0x6666...7777',
    accuracy: 0,
    totalPools: 1,
    correctPools: 0,
    wrongPools: 0,
    activePools: 1,          // pool-6 (active)
    tier: 'Novice',
    nftTokenId: 6,
    categoryStats: {
      'Macro': { total: 1, correct: 0, accuracy: 0 }
    },
    currentStreak: 0,
    bestStreak: 0,
    specialty: 'Macro',
    memberSince: new Date('2024-10-09')
  },
  '0x8888...9999': {
    address: '0x8888...9999',
    accuracy: 0,
    totalPools: 1,
    correctPools: 0,
    wrongPools: 0,
    activePools: 1,          // pool-7 (active)
    tier: 'Novice',
    nftTokenId: 7,
    categoryStats: {
      'Macro': { total: 1, correct: 0, accuracy: 0 }
    },
    currentStreak: 0,
    bestStreak: 0,
    specialty: 'Macro',
    memberSince: new Date('2024-10-10')
  },
  '0xaaaa...bbbb': {
    address: '0xaaaa...bbbb',
    accuracy: 0,
    totalPools: 1,
    correctPools: 0,
    wrongPools: 0,
    activePools: 1,          // pool-8 (active)
    tier: 'Novice',
    nftTokenId: 8,
    categoryStats: {
      'Tech': { total: 1, correct: 0, accuracy: 0 }
    },
    currentStreak: 0,
    bestStreak: 0,
    specialty: 'Tech',
    memberSince: new Date('2024-10-11')
  },
  '0xcccc...dddd': {
    address: '0xcccc...dddd',
    accuracy: 0,
    totalPools: 1,
    correctPools: 0,
    wrongPools: 0,
    activePools: 1,          // pool-9 (active)
    tier: 'Novice',
    nftTokenId: 9,
    categoryStats: {
      'Tech': { total: 1, correct: 0, accuracy: 0 }
    },
    currentStreak: 0,
    bestStreak: 0,
    specialty: 'Tech',
    memberSince: new Date('2024-10-12')
  },
  // ADMIN WALLET (has resolved pools, builds reputation)
  '0x580B01f8CDf7606723c3BE0dD2AaD058F5aECa3d': {
    address: '0x580B01f8CDf7606723c3BE0dD2AaD058F5aECa3d',
    accuracy: 75,
    totalPools: 4,
    correctPools: 3,
    wrongPools: 1,
    activePools: 0,
    tier: 'Expert',
    nftTokenId: 10,
    categoryStats: {
      'Crypto': { total: 2, correct: 2, accuracy: 100 },
      'Macro': { total: 2, correct: 1, accuracy: 50 }
    },
    currentStreak: 2,
    bestStreak: 3,
    specialty: 'Crypto, Macro',
    memberSince: new Date('2024-08-01')
  },
  // ADMIN WALLET - Tachul (Co-founder, DeFi specialist)
  '0xa930FDA4B716341c8b5D1b83B67BfC2adFbd1fEd': {
    address: '0xa930FDA4B716341c8b5D1b83B67BfC2adFbd1fEd',
    accuracy: 82,
    totalPools: 5,
    correctPools: 4,
    wrongPools: 1,
    activePools: 0,
    tier: 'Expert',
    nftTokenId: 11,
    categoryStats: {
      'DeFi': { total: 3, correct: 3, accuracy: 100 },
      'Crypto': { total: 2, correct: 1, accuracy: 50 }
    },
    currentStreak: 3,
    bestStreak: 3,
    specialty: 'DeFi, Crypto',
    memberSince: new Date('2024-07-15')
  },
  // ADMIN WALLET - Zidan (Tech analyst, AI/ML focus)
  '0xeF4DB09D536439831FEcaA33fE4250168976535E': {
    address: '0xeF4DB09D536439831FEcaA33fE4250168976535E',
    accuracy: 88,
    totalPools: 6,
    correctPools: 5,
    wrongPools: 1,
    activePools: 0,
    tier: 'Master',
    nftTokenId: 12,
    categoryStats: {
      'Tech': { total: 4, correct: 4, accuracy: 100 },
      'Crypto': { total: 2, correct: 1, accuracy: 50 }
    },
    currentStreak: 4,
    bestStreak: 4,
    specialty: 'Tech, Crypto',
    memberSince: new Date('2024-07-01')
  }
};
