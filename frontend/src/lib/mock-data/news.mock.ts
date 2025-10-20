import { News } from '@/types';

/**
 * MOCK NEWS DATA
 *
 * This file contains mock data for NEWS entities.
 * When integrating with smart contracts, replace this with contract calls.
 *
 * Contract Integration Point:
 * - Replace with: await readContract({ address: newsFactory, functionName: 'getAllNews' })
 * - Map contract struct to News interface (see types/index.ts)
 */

export const MOCK_NEWS: News[] = [
  {
    id: '1',
    title: 'ETH will reach $5000 before December 2024',
    description: 'Predicting Ethereum price movement considering ETF approval prospects, institutional adoption trends, and DeFi ecosystem growth. Key factors include spot ETF decisions, Layer 2 scaling improvements, and macroeconomic conditions.',
    category: 'Crypto',
    endDate: new Date('2024-12-31'),
    resolutionCriteria: 'ETH price >= $5000 on CoinGecko at Dec 31, 2024 23:59 UTC',
    creatorAddress: '0xabc...123',
    createdAt: new Date('2024-10-01'),
    status: 'active',
    totalPools: 3,
    totalStaked: 5200
  },
  {
    id: '2',
    title: 'BTC will hit $100,000 before March 2025',
    description: 'Bitcoin price prediction considering halving cycle effects, spot ETF inflows, institutional adoption, and macroeconomic factors including Fed policy and global liquidity conditions.',
    category: 'Crypto',
    endDate: new Date('2025-03-31'),
    resolutionCriteria: 'BTC price >= $100,000 on CoinGecko',
    creatorAddress: '0xdef...456',
    createdAt: new Date('2024-10-05'),
    status: 'active',
    totalPools: 5,
    totalStaked: 12500
  },
  {
    id: '3',
    title: 'Federal Reserve will cut interest rates in Q1 2025',
    description: 'Analyzing Federal Reserve monetary policy trajectory based on inflation data, employment figures, and economic growth indicators to predict rate cut timing.',
    category: 'Macro',
    endDate: new Date('2025-03-31'),
    resolutionCriteria: 'Fed Fund Rate reduced by at least 0.25% in Q1 2025',
    creatorAddress: '0x789...abc',
    createdAt: new Date('2024-10-08'),
    status: 'active',
    totalPools: 4,
    totalStaked: 8900
  },
  {
    id: '4',
    title: 'OpenAI will release GPT-5 before June 2025',
    description: 'Tracking OpenAI development timelines, computational requirements, and public statements to predict GPT-5 release timing. Considering training costs, regulatory approvals, and competitive landscape.',
    category: 'Tech',
    endDate: new Date('2025-06-01'),
    resolutionCriteria: 'Official GPT-5 model released and publicly accessible',
    creatorAddress: '0x321...def',
    createdAt: new Date('2024-10-10'),
    status: 'active',
    totalPools: 6,
    totalStaked: 15000
  },
  {
    id: '5',
    title: 'Ethereum ETF will reach $1B+ inflows within 3 months',
    description: 'Analyzing institutional investment patterns and ETF adoption rates for Ethereum-based financial products following spot ETF approvals.',
    category: 'Crypto',
    endDate: new Date('2025-01-15'),
    resolutionCriteria: 'Total net inflows to Ethereum spot ETFs >= $1 billion',
    creatorAddress: '0x654...987',
    createdAt: new Date('2024-10-12'),
    status: 'active',
    totalPools: 2,
    totalStaked: 4500
  },
  {
    id: '6',
    title: 'US unemployment rate will exceed 5% in 2025',
    description: 'Economic analysis of labor market trends, recession indicators, and employment data to predict unemployment trajectory in response to Fed policy and economic conditions.',
    category: 'Macro',
    endDate: new Date('2025-12-31'),
    resolutionCriteria: 'US unemployment rate >= 5.0% in any month of 2025',
    creatorAddress: '0x111...222',
    createdAt: new Date('2024-10-14'),
    status: 'active',
    totalPools: 3,
    totalStaked: 7200
  },

  // ============================================
  // RESOLVED NEWS (for testing)
  // ============================================
  {
    id: '7',
    title: 'SOL will reach $200 before November 2024',
    description: 'Solana price prediction based on network activity, memecoin trends, and institutional interest. Considering FTX liquidation impacts and overall market sentiment.',
    category: 'Crypto',
    endDate: new Date('2024-11-01'),
    resolutionCriteria: 'SOL price >= $200 on CoinGecko',
    creatorAddress: '0xabc...123',
    createdAt: new Date('2024-09-15'),
    status: 'resolved',
    totalPools: 3,
    totalStaked: 4800,
    outcome: 'YES',
    resolvedAt: new Date('2024-11-01'),
    resolvedBy: '0x580B01f8CDf7606723c3BE0dD2AaD058F5aECa3d',
    resolutionSource: 'https://www.coingecko.com/en/coins/solana',
    resolutionNotes: 'SOL reached $205 on Nov 1, 2024'
  },
  {
    id: '8',
    title: 'Apple will launch AI assistant before October 2024',
    description: 'Tracking Apple\'s AI development and WWDC announcements to predict launch timing of comprehensive AI assistant features in iOS.',
    category: 'Tech',
    endDate: new Date('2024-10-31'),
    resolutionCriteria: 'Apple Intelligence features publicly available',
    creatorAddress: '0xdef...456',
    createdAt: new Date('2024-08-01'),
    status: 'resolved',
    totalPools: 2,
    totalStaked: 3200,
    outcome: 'NO',
    resolvedAt: new Date('2024-10-31'),
    resolvedBy: '0x580B01f8CDf7606723c3BE0dD2AaD058F5aECa3d',
    resolutionSource: 'https://www.apple.com/apple-intelligence/',
    resolutionNotes: 'Apple Intelligence delayed to iOS 18.1 in late October, not fully available before deadline'
  }
];
