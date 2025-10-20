import { Pool } from '@/types';

/**
 * MOCK POOLS DATA
 *
 * This file contains mock data for POOL entities (analysis with independent stake pools).
 * When integrating with smart contracts, replace this with contract calls.
 *
 * Contract Integration Point:
 * - Replace with: await readContract({ address: poolFactory, functionName: 'getPoolsByNews', args: [newsId] })
 * - Map contract struct to Pool interface (see types/index.ts)
 */

export const MOCK_POOLS: Pool[] = [
  // Pools for NEWS 1: "ETH will reach $5000"
  {
    id: 'pool-1',
    newsId: '1',
    creatorAddress: '0x1234...5678',
    position: 'YES',
    reasoning: 'ETF approval will drive massive institutional inflows. Historical data shows that after Bitcoin ETF approval, price surged 40% within 3 months. Ethereum has stronger fundamentals with its DeFi ecosystem and staking yields. Technical analysis shows bull flag pattern with strong support at $3500.',
    evidence: [
      'https://example.com/etf-approval-data',
      'https://example.com/institutional-flows',
      'https://example.com/eth-technical-analysis'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    imageCaption: 'ETH Bull Flag Pattern with Strong Support',
    creatorStake: 100,
    agreeStakes: 900,
    disagreeStakes: 200,
    totalStaked: 1200,
    status: 'active',
    outcome: null,
    createdAt: new Date('2024-10-02'),
    farcasterCastHash: 'cast-eth-yes-1'
  },
  {
    id: 'pool-2',
    newsId: '1',
    creatorAddress: '0xabcd...efgh',
    position: 'NO',
    reasoning: 'Regulation remains very unclear in many jurisdictions. SEC is still aggressive towards crypto projects. Macro conditions with high interest rates reduce risk appetite. Historical resistance at $4800 is very strong with 3x rejections already. Market remains bearish with low volume.',
    evidence: [
      'https://example.com/regulatory-concerns',
      'https://example.com/macro-headwinds',
      'https://example.com/technical-resistance'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800',
    imageCaption: 'ETH Technical Resistance Levels',
    creatorStake: 50,
    agreeStakes: 500,
    disagreeStakes: 800,
    totalStaked: 1350,
    status: 'active',
    outcome: null,
    createdAt: new Date('2024-10-03')
  },
  {
    id: 'pool-3',
    newsId: '1',
    creatorAddress: '0x9999...1111',
    position: 'YES',
    reasoning: 'Layer 2 scaling solutions like Arbitrum and Optimism have significantly reduced gas fees. This is driving rapid DeFi adoption growth. Real World Assets (RWA) tokenization trend will drive institutional demand. Ethereum merge is proven and staking yields are attractive for institutions.',
    evidence: [
      'https://example.com/l2-adoption',
      'https://example.com/rwa-tokenization'
    ],
    creatorStake: 150,
    agreeStakes: 1200,
    disagreeStakes: 300,
    totalStaked: 1650,
    status: 'active',
    outcome: null,
    createdAt: new Date('2024-10-04')
  },

  // Pools for NEWS 2: "BTC will hit $100k"
  {
    id: 'pool-4',
    newsId: '2',
    creatorAddress: '0x2222...3333',
    position: 'YES',
    reasoning: 'Halving cycle historically bullish. Spot ETF inflows breaking records - already $50B+ in 6 months. MicroStrategy and institutional buyers continue to accumulate. Stock-to-flow model predicts $100k+ post-halving. On-chain metrics show strong accumulation by whales.',
    evidence: [
      'https://example.com/halving-cycle-data',
      'https://example.com/etf-inflows-record',
      'https://example.com/on-chain-accumulation'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=800',
    imageCaption: 'BTC Halving Cycle Analysis',
    creatorStake: 200,
    agreeStakes: 2000,
    disagreeStakes: 500,
    totalStaked: 2700,
    status: 'active',
    outcome: null,
    createdAt: new Date('2024-10-06'),
    farcasterCastHash: 'cast-btc-yes-1'
  },
  {
    id: 'pool-5',
    newsId: '2',
    creatorAddress: '0x4444...5555',
    position: 'NO',
    reasoning: 'Macro environment still challenging. Fed has not pivoted yet, interest rates remain high. Global liquidity conditions are tight. China economic slowdown impacts risk assets. Historical post-halving rallies take 12-18 months, March 2025 is too early. Technical indicators show overbought on weekly timeframe.',
    evidence: [
      'https://example.com/fed-policy-outlook',
      'https://example.com/global-liquidity'
    ],
    creatorStake: 100,
    agreeStakes: 800,
    disagreeStakes: 1500,
    totalStaked: 2400,
    status: 'active',
    outcome: null,
    createdAt: new Date('2024-10-07')
  },

  // Pools for NEWS 3: "Fed rate cut Q1 2025"
  {
    id: 'pool-6',
    newsId: '3',
    creatorAddress: '0x6666...7777',
    position: 'YES',
    reasoning: 'Inflation data trending down towards 2% target. Employment data showing weakness - unemployment creeping up. Powell has signaled "higher for longer" is ending. Market pricing in 75% chance of Q1 cut. Historical precedent: Fed cuts when they see economic softening.',
    evidence: [
      'https://example.com/inflation-trends',
      'https://example.com/employment-weakness',
      'https://example.com/fed-signals'
    ],
    creatorStake: 75,
    agreeStakes: 600,
    disagreeStakes: 400,
    totalStaked: 1075,
    status: 'active',
    outcome: null,
    createdAt: new Date('2024-10-09')
  },
  {
    id: 'pool-7',
    newsId: '3',
    creatorAddress: '0x8888...9999',
    position: 'NO',
    reasoning: 'Core inflation remains sticky above 3%. Labor market remains resilient. Fed does not want to cut too early and risk inflation resurgence. Political pressure pre-election makes them cautious. CME Fed Watch still shows uncertainty. Q2 2025 more likely for first cut.',
    evidence: [
      'https://example.com/core-inflation-data',
      'https://example.com/labor-market-strength'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    imageCaption: 'Fed Rate Decision Analysis',
    creatorStake: 80,
    agreeStakes: 700,
    disagreeStakes: 600,
    totalStaked: 1380,
    status: 'active',
    outcome: null,
    createdAt: new Date('2024-10-10')
  },

  // Pools for NEWS 4: "GPT-5 before June 2025"
  {
    id: 'pool-8',
    newsId: '4',
    creatorAddress: '0xaaaa...bbbb',
    position: 'YES',
    reasoning: 'Sam Altman hints at "amazing models" coming soon. OpenAI just raised $6.6B for compute infrastructure. Competition from Google Gemini and Anthropic Claude pushing faster iteration. Training timeline suggests Q1-Q2 2025 window. Regulatory approvals mostly in place.',
    evidence: [
      'https://example.com/sam-altman-hints',
      'https://example.com/openai-funding',
      'https://example.com/training-timeline'
    ],
    creatorStake: 150,
    agreeStakes: 1800,
    disagreeStakes: 700,
    totalStaked: 2650,
    status: 'active',
    outcome: null,
    createdAt: new Date('2024-10-11'),
    farcasterCastHash: 'cast-gpt5-yes-1'
  },
  {
    id: 'pool-9',
    newsId: '4',
    creatorAddress: '0xcccc...dddd',
    position: 'NO',
    reasoning: 'Training GPT-5 requires massive compute - 12-18 months minimum. Safety testing and alignment work takes additional months. Regulatory scrutiny increasing globally. OpenAI historically delays releases - GPT-4 took longer than expected. June 2025 too aggressive, late 2025 more realistic.',
    evidence: [
      'https://example.com/training-requirements',
      'https://example.com/safety-protocols'
    ],
    creatorStake: 120,
    agreeStakes: 1000,
    disagreeStakes: 1500,
    totalStaked: 2620,
    status: 'active',
    outcome: null,
    createdAt: new Date('2024-10-12')
  },

  // ============================================
  // RESOLVED POOLS (for News 7: SOL $200 - Outcome: YES)
  // ============================================
  {
    id: 'pool-10',
    newsId: '7',
    creatorAddress: '0x1234...5678',
    position: 'YES',
    reasoning: 'Solana ecosystem growth is explosive. Memecoin mania driving massive trading volume. Jito airdrop and Jupiter launch creating positive sentiment. Network uptime stable. Major DeFi protocols migrating to Solana.',
    evidence: [
      'https://example.com/solana-activity',
      'https://example.com/dex-volume'
    ],
    creatorStake: 150,
    agreeStakes: 1200,
    disagreeStakes: 400,
    totalStaked: 1750,
    status: 'resolved',
    outcome: 'creator_correct',
    createdAt: new Date('2024-09-16')
  },
  {
    id: 'pool-11',
    newsId: '7',
    creatorAddress: '0xabcd...efgh',
    position: 'NO',
    reasoning: 'FTX overhang still present. Technical resistance at $180. Memecoin hype unsustainable. Network still has occasional congestion issues.',
    evidence: [
      'https://example.com/ftx-liquidations'
    ],
    creatorStake: 100,
    agreeStakes: 800,
    disagreeStakes: 900,
    totalStaked: 1800,
    status: 'resolved',
    outcome: 'creator_wrong',
    createdAt: new Date('2024-09-17')
  },
  {
    id: 'pool-12',
    newsId: '7',
    creatorAddress: '0x9999...1111',
    position: 'YES',
    reasoning: 'On-chain metrics bullish. Whale accumulation visible. Technical breakout from $150 confirmed. Momentum strong with Jupiter airdrop catalyst.',
    evidence: [
      'https://example.com/sol-on-chain'
    ],
    creatorStake: 120,
    agreeStakes: 900,
    disagreeStakes: 230,
    totalStaked: 1250,
    status: 'resolved',
    outcome: 'creator_correct',
    createdAt: new Date('2024-09-18')
  },

  // ============================================
  // RESOLVED POOLS (for News 8: Apple AI - Outcome: NO)
  // ============================================
  {
    id: 'pool-13',
    newsId: '8',
    creatorAddress: '0x2222...3333',
    position: 'YES',
    reasoning: 'WWDC announcements promising. Beta features already available. Apple typically ships on time. Competitive pressure from Google and Microsoft.',
    evidence: [
      'https://example.com/apple-wwdc'
    ],
    creatorStake: 100,
    agreeStakes: 700,
    disagreeStakes: 900,
    totalStaked: 1700,
    status: 'resolved',
    outcome: 'creator_wrong',
    createdAt: new Date('2024-08-05')
  },
  {
    id: 'pool-14',
    newsId: '8',
    creatorAddress: '0x4444...5555',
    position: 'NO',
    reasoning: 'Apple historically conservative with AI rollout. Privacy concerns require extensive testing. Beta feedback showing delays. October too optimistic.',
    evidence: [
      'https://example.com/apple-delays'
    ],
    creatorStake: 80,
    agreeStakes: 600,
    disagreeStakes: 920,
    totalStaked: 1500,
    status: 'resolved',
    outcome: 'creator_correct',
    createdAt: new Date('2024-08-06')
  }
];
