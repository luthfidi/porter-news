# 🔗 FORTER - SMART CONTRACT INTEGRATION GUIDE

**For Smart Contract Developers**

This guide shows you exactly where and how to integrate your Solidity contracts with the FORTER frontend.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Service Layer Integration](#service-layer-integration)
5. [Type Mapping](#type-mapping)
6. [Common Patterns](#common-patterns)
7. [Error Handling](#error-handling)
8. [Testing](#testing)
9. [Deployment Checklist](#deployment-checklist)

---

## 🎯 Overview

### What's Already Done ✅

- ✅ **Service Layer**: Abstraction layer for all data operations
- ✅ **Error Handling**: ErrorBoundary, error states, transaction management
- ✅ **Type System**: TypeScript interfaces matching your Solidity structs
- ✅ **Mock Data**: Fallback data for development/testing
- ✅ **Wagmi v2**: Configured for Base Sepolia testnet
- ✅ **RainbowKit**: Wallet connection ready

### What You Need to Do 🔨

1. Deploy your smart contracts to Base Sepolia
2. Get contract addresses and add to `.env.local`
3. Add ABIs to `src/lib/abis/`
4. Update service files (4 files: news, pool, staking, reputation)
5. Test with `NEXT_PUBLIC_USE_CONTRACTS=true`

**Estimated Time**: 2-4 hours for full integration

---

## 🚀 Quick Start

### Step 1: Deploy Contracts

```bash
# In sc/ directory (Foundry project)
forge build
forge script script/Deploy.s.sol --rpc-url base-sepolia --broadcast --verify
```

### Step 2: Configure Environment

Create/update `frontend/.env.local`:

```bash
# Contract Addresses (from deployment)
NEXT_PUBLIC_NEWS_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_POOL_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_STAKING_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_REPUTATION_NFT_ADDRESS=0x...

# USDC Address (Base Sepolia testnet)
NEXT_PUBLIC_USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e

# Toggle contracts on/off
NEXT_PUBLIC_USE_CONTRACTS=false  # Set to 'true' when ready

# Wallet Connect (already configured)
NEXT_PUBLIC_WALLET_CONNECT_ID=your_project_id_here
```

### Step 3: Add Contract ABIs

Create `src/lib/abis/` directory and add your ABIs:

```typescript
// src/lib/abis/NewsFactory.abi.ts
export const NewsFactoryABI = [
  {
    "inputs": [
      { "name": "title", "type": "string" },
      { "name": "description", "type": "string" },
      { "name": "endTimestamp", "type": "uint256" },
      { "name": "resolutionCriteria", "type": "string" },
      { "name": "category", "type": "uint8" }
    ],
    "name": "createNews",
    "outputs": [{ "name": "newsId", "type": "uint256" }],
    "stateMutability": "payable",
    "type": "function"
  },
  // ... more functions
] as const;
```

**Tip**: You can auto-generate ABIs from Foundry:

```bash
# In sc/ directory
forge inspect NewsFactory abi > ../frontend/src/lib/abis/NewsFactory.json
```

Then import in TypeScript:

```typescript
import NewsFactoryABI from './NewsFactory.json';
export { NewsFactoryABI };
```

### Step 4: Create Contracts Config

Create `src/config/contracts.ts`:

```typescript
import { Address } from 'viem';

/**
 * CONTRACT ADDRESSES
 *
 * Update these after deploying to Base Sepolia testnet.
 */
export const contracts = {
  newsFactory: process.env.NEXT_PUBLIC_NEWS_FACTORY_ADDRESS as Address,
  poolFactory: process.env.NEXT_PUBLIC_POOL_FACTORY_ADDRESS as Address,
  stakingManager: process.env.NEXT_PUBLIC_STAKING_MANAGER_ADDRESS as Address,
  reputationNFT: process.env.NEXT_PUBLIC_REPUTATION_NFT_ADDRESS as Address,
  usdc: process.env.NEXT_PUBLIC_USDC_ADDRESS as Address,
} as const;

/**
 * CONTRACT CONFIGURATION
 */
export const config = {
  USE_CONTRACTS: process.env.NEXT_PUBLIC_USE_CONTRACTS === 'true',
  NEWS_DEPOSIT: 10, // $10 USDC required to create NEWS
  MIN_POOL_STAKE: 1, // $1 USDC minimum pool stake
  PLATFORM_FEE: 0.02, // 2% platform fee
  BASE_SEPOLIA_ID: 84532,
} as const;

/**
 * VALIDATION
 * Ensures all contract addresses are configured
 */
export function validateContracts() {
  const missing = [];
  if (!contracts.newsFactory) missing.push('newsFactory');
  if (!contracts.poolFactory) missing.push('poolFactory');
  if (!contracts.stakingManager) missing.push('stakingManager');
  if (!contracts.usdc) missing.push('usdc');

  if (missing.length > 0) {
    throw new Error(`Missing contract addresses: ${missing.join(', ')}`);
  }
}
```

---

## 🏗️ Architecture

### Service Layer Pattern

```
┌─────────────┐
│  Component  │  ← Uses services, never imports mock data directly
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   Service   │  ← Integration point (YOU EDIT HERE)
└──────┬──────┘
       │
       ├─→ Mock Data (fallback, already implemented)
       │
       └─→ Smart Contract (YOU ADD THIS)
           ├── readContract() → fetch data
           ├── writeContract() → create/update
           └── waitForTransaction() → confirm
```

### Files You'll Edit

```
frontend/src/lib/
├── abis/                       # ADD: Your contract ABIs
│   ├── NewsFactory.abi.ts
│   ├── PoolFactory.abi.ts
│   ├── StakingManager.abi.ts
│   └── ReputationNFT.abi.ts
│
├── config/
│   └── contracts.ts            # ADD: Contract addresses & config
│
└── services/                   # EDIT: Add contract integration
    ├── news.service.ts         # ← Edit this
    ├── pool.service.ts         # ← Edit this
    ├── staking.service.ts      # ← Edit this
    └── reputation.service.ts   # ← Edit this
```

**That's it!** Components already use services, so no other files need changes.

---

## 🔌 Service Layer Integration

### Pattern: Add Contract Logic to Existing Services

Each service file has clear `TODO` comments showing where to add contract calls.

### Example: News Service

**File**: `src/lib/services/news.service.ts`

#### Step 1: Add Imports

```typescript
// Add at top of file
import { readContract, writeContract, waitForTransaction } from 'wagmi/actions';
import { config as wagmiConfig } from '@/lib/wagmi';
import { NewsFactoryABI } from '@/lib/abis/NewsFactory.abi';
import { contracts, config } from '@/config/contracts';
import { parseUnits, formatUnits } from 'viem';
```

#### Step 2: Update `getAll()` Method

Find this:

```typescript
async getAll(): Promise<News[]> {
  // TODO: Add contract integration here
  // if (USE_CONTRACTS) { ... }

  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_NEWS;
}
```

Replace with:

```typescript
async getAll(): Promise<News[]> {
  // Check if contracts are enabled
  if (!config.USE_CONTRACTS) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_NEWS;
  }

  try {
    // Call smart contract
    const data = await readContract(wagmiConfig, {
      address: contracts.newsFactory,
      abi: NewsFactoryABI,
      functionName: 'getAllActiveNews',
    });

    // Map contract data to TypeScript interface
    return this.mapContractToNews(data);
  } catch (error) {
    console.error('[NewsService] getAll failed:', error);

    // Fallback to mock data on error (during development)
    if (process.env.NODE_ENV === 'development') {
      return MOCK_NEWS;
    }

    throw new Error('Failed to fetch news from contract');
  }
}
```

#### Step 3: Add Mapping Helper

Add this method to the `NewsService` class:

```typescript
/**
 * Map contract struct to TypeScript interface
 * Adjust field names based on your actual Solidity struct
 */
private mapContractToNews(data: any[]): News[] {
  return data.map((item) => ({
    id: item.id.toString(),
    title: item.title,
    description: item.description,
    category: this.enumToCategory(item.category), // Convert uint8 → string
    endDate: new Date(Number(item.endTimestamp) * 1000), // Unix → JS Date
    resolutionCriteria: item.resolutionCriteria,
    creatorAddress: item.creator,
    createdAt: new Date(Number(item.createdAt) * 1000),
    status: this.mapStatus(item.status), // Convert uint8 → string
    totalPools: Number(item.poolCount),
    totalStaked: Number(formatUnits(item.totalStaked, 6)), // Wei → decimal
    outcome: item.outcome === 0 ? undefined : item.outcome === 1 ? 'YES' : 'NO',
    resolvedAt: item.resolvedAt > 0 ? new Date(Number(item.resolvedAt) * 1000) : undefined,
    resolvedBy: item.resolvedBy !== '0x0000000000000000000000000000000000000000'
      ? item.resolvedBy
      : undefined,
  }));
}

/**
 * Convert category enum (uint8) to string
 * Must match your Solidity enum order
 */
private enumToCategory(value: number): string {
  const categories = ['Crypto', 'Macro', 'Tech', 'Sports', 'Politics'];
  return categories[value] ?? 'Crypto';
}

/**
 * Convert category string to enum (uint8)
 */
private categoryToEnum(category: string): number {
  const map: Record<string, number> = {
    'Crypto': 0,
    'Macro': 1,
    'Tech': 2,
    'Sports': 3,
    'Politics': 4,
  };
  return map[category] ?? 0;
}

/**
 * Convert status enum (uint8) to string
 */
private mapStatus(status: number): News['status'] {
  const statuses = ['active', 'resolved', 'disputed', 'closed'];
  return (statuses[status] as News['status']) ?? 'active';
}
```

#### Step 4: Update `create()` Method (Write Operation)

Find this:

```typescript
async create(input: CreateNewsInput): Promise<News> {
  // TODO: Add contract integration here

  await new Promise(resolve => setTimeout(resolve, 1500));

  const newNews: News = { /* mock implementation */ };
  return newNews;
}
```

Replace with:

```typescript
async create(input: CreateNewsInput): Promise<News> {
  if (!config.USE_CONTRACTS) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const newNews: News = {
      id: `news-${Date.now()}`,
      title: input.title,
      description: input.description,
      category: input.category,
      endDate: input.endDate,
      resolutionCriteria: input.resolutionCriteria,
      creatorAddress: '0xuser...mock',
      createdAt: new Date(),
      status: 'active',
      totalPools: 0,
      totalStaked: 0
    };
    return newNews;
  }

  try {
    // Step 1: Call smart contract to create NEWS
    const hash = await writeContract(wagmiConfig, {
      address: contracts.newsFactory,
      abi: NewsFactoryABI,
      functionName: 'createNews',
      args: [
        input.title,
        input.description,
        Math.floor(input.endDate.getTime() / 1000), // JS Date → Unix timestamp
        input.resolutionCriteria,
        this.categoryToEnum(input.category), // String → uint8
      ],
      value: parseUnits(config.NEWS_DEPOSIT.toString(), 6), // $10 USDC deposit
    });

    // Step 2: Wait for transaction confirmation
    const receipt = await waitForTransaction(wagmiConfig, { hash });

    // Step 3: Extract newsId from emitted event
    // Adjust based on your event structure
    const newsCreatedEvent = receipt.logs[0];
    const newsId = newsCreatedEvent.topics[1]; // Assuming indexed newsId

    // Step 4: Fetch the newly created news
    const newNews = await this.getById(newsId);

    if (!newNews) {
      throw new Error('Failed to fetch created news');
    }

    return newNews;
  } catch (error: any) {
    console.error('[NewsService] create failed:', error);

    // User-friendly error messages
    if (error.message?.includes('User rejected')) {
      throw new Error('Transaction cancelled by user');
    }
    if (error.message?.includes('insufficient funds')) {
      throw new Error('Insufficient funds for gas + deposit');
    }

    throw new Error('Failed to create news. Please try again.');
  }
}
```

### Repeat for Other Services

Follow the same pattern for:

1. **pool.service.ts** → PoolFactory contract
2. **staking.service.ts** → StakingManager contract
3. **reputation.service.ts** → ReputationNFT contract

Each service file has detailed TODO comments and examples.

---

## 📊 Type Mapping

### TypeScript ↔ Solidity Type Conversions

| TypeScript | Solidity | Conversion |
|------------|----------|------------|
| `string` | `string` | Direct (no conversion) |
| `number` | `uint256` | `BigInt(value)` → Contract<br>`Number(value)` ← Contract |
| `boolean` | `bool` | Direct (no conversion) |
| `Date` | `uint256` (timestamp) | `Math.floor(date.getTime() / 1000)` → Contract<br>`new Date(Number(timestamp) * 1000)` ← Contract |
| `enum` (string) | `enum` (uint8) | `categoryToEnum(string)` → Contract<br>`enumToCategory(uint8)` ← Contract |
| `string` (address) | `address` | Cast as ``0x${string}`` |
| `number` (currency) | `uint256` (wei) | `parseUnits(value.toString(), 6)` → Contract<br>`Number(formatUnits(value, 6))` ← Contract |

### Example: News Interface Mapping

**TypeScript** (`src/types/index.ts`):

```typescript
export interface News {
  id: string;                   // → uint256 newsId
  title: string;                // → string title
  description: string;          // → string description
  category: string;             // → uint8 category (enum)
  endDate: Date;                // → uint256 endTimestamp
  resolutionCriteria: string;   // → string resolutionCriteria
  creatorAddress: string;       // → address creator
  createdAt: Date;              // → uint256 createdAt
  status: 'active' | 'resolved' | 'disputed' | 'closed'; // → uint8 status
  totalPools: number;           // → uint256 poolCount
  totalStaked: number;          // → uint256 totalStaked (in USDC wei)
  outcome?: 'YES' | 'NO';       // → uint8 outcome (0=None, 1=YES, 2=NO)
  resolvedAt?: Date;            // → uint256 resolvedAt (0 = not resolved)
  resolvedBy?: string;          // → address resolvedBy (0x0 = not resolved)
}
```

**Solidity** (`sc/src/core/NewsFactory.sol`):

```solidity
enum Category { Crypto, Macro, Tech, Sports, Politics }
enum Status { Active, Resolved, Disputed, Closed }
enum Outcome { None, YES, NO }

struct News {
    uint256 id;
    string title;
    string description;
    Category category;
    uint256 endTimestamp;
    string resolutionCriteria;
    address creator;
    uint256 createdAt;
    Status status;
    uint256 poolCount;
    uint256 totalStaked;
    Outcome outcome;
    uint256 resolvedAt;
    address resolvedBy;
}
```

**Mapping Function**:

```typescript
private mapContractToNews(data: any[]): News[] {
  return data.map((item) => ({
    id: item.id.toString(),                              // uint256 → string
    title: item.title,                                   // string (direct)
    description: item.description,                       // string (direct)
    category: this.enumToCategory(item.category),        // uint8 → string
    endDate: new Date(Number(item.endTimestamp) * 1000), // uint256 → Date
    resolutionCriteria: item.resolutionCriteria,         // string (direct)
    creatorAddress: item.creator,                        // address (direct)
    createdAt: new Date(Number(item.createdAt) * 1000),  // uint256 → Date
    status: this.mapStatus(item.status),                 // uint8 → string
    totalPools: Number(item.poolCount),                  // uint256 → number
    totalStaked: Number(formatUnits(item.totalStaked, 6)), // uint256 wei → number
    outcome: item.outcome === 0 ? undefined :
             item.outcome === 1 ? 'YES' : 'NO',          // uint8 → string
    resolvedAt: item.resolvedAt > 0
      ? new Date(Number(item.resolvedAt) * 1000)
      : undefined,                                       // uint256 → Date?
    resolvedBy: item.resolvedBy !== '0x0000000000000000000000000000000000000000'
      ? item.resolvedBy
      : undefined,                                       // address → string?
  }));
}
```

---

## 🔄 Common Patterns

### Pattern 1: Read-Only Contract Call

```typescript
async getData(): Promise<DataType[]> {
  if (!config.USE_CONTRACTS) return MOCK_DATA;

  try {
    const data = await readContract(wagmiConfig, {
      address: contracts.contractName,
      abi: ContractABI,
      functionName: 'getFunctionName',
      args: [arg1, arg2],
    });

    return this.mapContractToType(data);
  } catch (error) {
    console.error('[Service] getData failed:', error);
    throw new Error('User-friendly error message');
  }
}
```

### Pattern 2: Write Contract Call (Single Transaction)

```typescript
async createItem(input: CreateInput): Promise<Item> {
  if (!config.USE_CONTRACTS) return mockCreate(input);

  try {
    // Execute transaction
    const hash = await writeContract(wagmiConfig, {
      address: contracts.contractName,
      abi: ContractABI,
      functionName: 'createItem',
      args: [input.field1, input.field2],
      value: parseUnits('10', 6), // Optional: send USDC
    });

    // Wait for confirmation
    const receipt = await waitForTransaction(wagmiConfig, { hash });

    // Extract item ID from event
    const itemId = receipt.logs[0].topics[1];

    // Fetch created item
    return this.getById(itemId);
  } catch (error: any) {
    if (error.message?.includes('User rejected')) {
      throw new Error('Transaction cancelled');
    }
    throw new Error('Failed to create item');
  }
}
```

### Pattern 3: Multi-Step Transaction (Approve + Execute)

```typescript
async stakeOnPool(poolId: string, amount: number): Promise<void> {
  if (!config.USE_CONTRACTS) return mockStake(poolId, amount);

  try {
    // Step 1: Approve USDC spending
    const approveHash = await writeContract(wagmiConfig, {
      address: contracts.usdc,
      abi: USDCABI,
      functionName: 'approve',
      args: [contracts.stakingManager, parseUnits(amount.toString(), 6)],
    });

    await waitForTransaction(wagmiConfig, { hash: approveHash });

    // Step 2: Execute stake
    const stakeHash = await writeContract(wagmiConfig, {
      address: contracts.stakingManager,
      abi: StakingManagerABI,
      functionName: 'stake',
      args: [BigInt(poolId), parseUnits(amount.toString(), 6)],
    });

    await waitForTransaction(wagmiConfig, { hash: stakeHash });
  } catch (error: any) {
    if (error.message?.includes('insufficient allowance')) {
      throw new Error('USDC approval failed');
    }
    throw new Error('Stake transaction failed');
  }
}
```

### Pattern 4: Event Filtering

```typescript
import { parseAbiItem } from 'viem';

async getPoolsByNews(newsId: string): Promise<Pool[]> {
  if (!config.USE_CONTRACTS) return mockGetPoolsByNews(newsId);

  try {
    // Get events
    const logs = await wagmiConfig.publicClient.getLogs({
      address: contracts.poolFactory,
      event: parseAbiItem('event PoolCreated(uint256 indexed newsId, uint256 indexed poolId, address creator)'),
      args: {
        newsId: BigInt(newsId),
      },
      fromBlock: 0n,
      toBlock: 'latest',
    });

    // Extract pool IDs from events
    const poolIds = logs.map(log => log.args.poolId);

    // Fetch full pool data
    const pools = await Promise.all(
      poolIds.map(id => this.getById(id.toString()))
    );

    return pools.filter(Boolean) as Pool[];
  } catch (error) {
    console.error('[PoolService] getPoolsByNews failed:', error);
    throw new Error('Failed to fetch pools');
  }
}
```

---

## ⚠️ Error Handling

### Contract Error Types

```typescript
/**
 * CONTRACT ERROR HANDLER
 *
 * Converts contract errors to user-friendly messages.
 */
export function handleContractError(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'An unknown error occurred';
  }

  const message = error.message.toLowerCase();

  // User rejected transaction in wallet
  if (message.includes('user rejected') || message.includes('user denied')) {
    return 'Transaction was cancelled';
  }

  // Insufficient funds for gas
  if (message.includes('insufficient funds')) {
    return 'Insufficient ETH for gas fees';
  }

  // Contract revert with reason
  if (message.includes('execution reverted')) {
    const reasonMatch = message.match(/reason: (.*?)(?:\n|$)/);
    if (reasonMatch) {
      return `Contract error: ${reasonMatch[1]}`;
    }
    return 'Transaction was reverted by the contract';
  }

  // Allowance error (ERC20)
  if (message.includes('insufficient allowance')) {
    return 'Please approve USDC spending first';
  }

  // Network errors
  if (message.includes('network') || message.includes('connection')) {
    return 'Network error. Please check your connection.';
  }

  // Wrong network
  if (message.includes('chain') || message.includes('network mismatch')) {
    return 'Please switch to Base Sepolia network';
  }

  // Default
  return 'Transaction failed. Please try again.';
}
```

### Using Error Handler in Services

```typescript
import { handleContractError } from '@/lib/errors/contract-errors';

async create(input: CreateInput): Promise<Item> {
  try {
    // ... contract call
  } catch (error) {
    console.error('[Service] create failed:', error);
    throw new Error(handleContractError(error));
  }
}
```

### Store Error States

Use Zustand store for error management:

```typescript
import { useGlobalStore } from '@/store/useGlobalStore';

// In component
const { error, setError, clearError } = useGlobalStore();

// Set error
try {
  await newsService.create(input);
} catch (error) {
  setError('news', error.message);
}

// Display error
{error.news && (
  <Alert variant="destructive">
    <AlertDescription>{error.news}</AlertDescription>
  </Alert>
)}

// Clear error
clearError('news');
```

---

## 🧪 Testing

### Local Testing Setup

1. **Start local Anvil node** (optional, for faster testing):

```bash
anvil --fork-url https://sepolia.base.org
```

2. **Deploy contracts to local node**:

```bash
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
```

3. **Update `.env.local`** with local addresses

4. **Start frontend**:

```bash
npm run dev
```

### Testing Checklist

- [ ] Connect wallet (Base Sepolia testnet)
- [ ] Get test USDC from faucet
- [ ] Create NEWS (test write operation)
- [ ] View NEWS list (test read operation)
- [ ] Create POOL for NEWS
- [ ] Stake on POOL (test multi-step transaction)
- [ ] Test error scenarios:
  - [ ] Reject transaction in wallet
  - [ ] Insufficient USDC balance
  - [ ] Insufficient ETH for gas
  - [ ] Invalid input (e.g., end date in past)
- [ ] Test loading states
- [ ] Test empty states
- [ ] Test with `USE_CONTRACTS=false` (mock mode)

### Debug Tools

1. **Console Logs**: Check service console logs

```typescript
console.log('[NewsService] Contract call:', { address, function, args });
```

2. **Wagmi Dev Tools**: Add to `app/layout.tsx`

```typescript
import { WagmiDevTools } from 'wagmi/dev';

// In root layout
<WagmiProvider config={config}>
  <RainbowKitProvider>
    {children}
    {process.env.NODE_ENV === 'development' && <WagmiDevTools />}
  </RainbowKitProvider>
</WagmiProvider>
```

3. **Base Sepolia Explorer**: Track transactions

```
https://sepolia.basescan.org/tx/{txHash}
```

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] All contracts deployed to Base Sepolia
- [ ] Contract addresses in `.env.local`
- [ ] All ABIs added to `src/lib/abis/`
- [ ] All 4 service files updated (news, pool, staking, reputation)
- [ ] Local testing complete
- [ ] Error handling tested
- [ ] `NEXT_PUBLIC_USE_CONTRACTS=true` in production

### Production Environment Variables

Ensure these are set in Vercel/production:

```bash
NEXT_PUBLIC_NEWS_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_POOL_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_STAKING_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_REPUTATION_NFT_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
NEXT_PUBLIC_USE_CONTRACTS=true
NEXT_PUBLIC_WALLET_CONNECT_ID=...
```

### Post-Deployment

- [ ] Test on production URL
- [ ] Monitor errors (Sentry/error tracking)
- [ ] Check transaction success rate
- [ ] Monitor gas usage
- [ ] User feedback collection

---

## 📚 Additional Resources

### Wagmi v2 Documentation

- [Getting Started](https://wagmi.sh/react/getting-started)
- [readContract](https://wagmi.sh/react/api/actions/readContract)
- [writeContract](https://wagmi.sh/react/api/actions/writeContract)
- [waitForTransaction](https://wagmi.sh/react/api/actions/waitForTransaction)

### Viem Documentation

- [parseUnits](https://viem.sh/docs/utilities/parseUnits.html) - Convert decimals to wei
- [formatUnits](https://viem.sh/docs/utilities/formatUnits.html) - Convert wei to decimals
- [parseAbiItem](https://viem.sh/docs/abi/parseAbiItem.html) - Parse event signatures

### Base Sepolia Resources

- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
- [Base Sepolia Explorer](https://sepolia.basescan.org/)
- [USDC on Base Sepolia](https://sepolia.basescan.org/token/0x036cbd53842c5426634e7929541ec2318f3dcf7e)

---

## 🤝 Support

If you encounter issues:

1. Check console logs for detailed error messages
2. Review service file TODO comments
3. Test with `USE_CONTRACTS=false` to isolate contract issues
4. Check Base Sepolia explorer for transaction status
5. Reach out to frontend team for assistance

---

**Good luck with integration! The frontend is ready for your contracts.** 🚀
