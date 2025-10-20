# 🚀 Forter News - Deployment Guide

Complete guide for deploying smart contracts and updating frontend configuration.

---

## 📋 Prerequisites

Before deploying, ensure you have:

1. **Environment Variables Set** (in `sc/.env`):
   ```bash
   PRIVATE_KEY=your_private_key_here
   BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
   BASESCAN_API_KEY=your_basescan_api_key
   ```

2. **Foundry Installed**:
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

3. **Testnet ETH**: Get Base Sepolia ETH from [faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)

---

## 🔧 Step 1: Deploy Smart Contracts

Navigate to smart contract directory:
```bash
cd sc
```

### Deploy to Base Sepolia Testnet

Run the deployment script:
```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  -vvvv
```

**What this does:**
1. Deploys MockToken (USDC mock for testing)
2. Deploys ReputationNFT contract
3. Deploys ForterGovernance contract
4. Deploys Forter main contract
5. StakingPool is auto-deployed by Forter constructor
6. Sets up all dependencies and ownership transfers
7. Verifies all contracts on Basescan

### Expected Output

The script will output something like:
```
=== DEPLOYMENT COMPLETED SUCCESSFULLY ===

Token (MockToken) deployed at: 0x...
ReputationNFT deployed at: 0x...
Governance deployed at: 0x...
Forter (Main Contract) deployed at: 0x...
StakingPool deployed at: 0x...

=== COPY THESE TO YOUR .env FILES ===

# Frontend .env
NEXT_PUBLIC_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_REPUTATION_NFT_ADDRESS=0x...
NEXT_PUBLIC_GOVERNANCE_ADDRESS=0x...
NEXT_PUBLIC_FORTER_ADDRESS=0x...
NEXT_PUBLIC_STAKINGPOOL_ADDRESS=0x...
```

**📝 IMPORTANT: Copy these addresses! You'll need them in the next steps.**

---

## 📤 Step 2: Export Contract ABIs

Generate TypeScript ABI files for frontend integration:

```bash
cd sc
chmod +x scripts/generate-abis.sh
./scripts/generate-abis.sh
```

**What this does:**
- Extracts ABIs from `out/` folder (Forge build output)
- Converts to TypeScript format
- Copies to `frontend/src/abis/` directory
- Generates type-safe contract interfaces

**Verify ABIs were generated:**
```bash
ls -la ../frontend/src/abis/
```

You should see:
- `Forter.json`
- `StakingPool.json`
- `ReputationNFT.json`
- `Governance.json`
- `MockToken.json`

---

## 🔄 Step 3: Update Frontend Configuration

### 3.1 Update .env File

Navigate to frontend directory:
```bash
cd ../frontend
```

Copy the example env file (if not already done):
```bash
cp .env.example .env.local
```

Edit `.env.local` and update the contract addresses from Step 1:
```bash
# Smart Contract Integration
NEXT_PUBLIC_USE_CONTRACTS=true

# Contract Addresses (Base Sepolia Testnet)
NEXT_PUBLIC_TOKEN_ADDRESS=0xYOUR_TOKEN_ADDRESS
NEXT_PUBLIC_REPUTATION_NFT_ADDRESS=0xYOUR_REPUTATION_ADDRESS
NEXT_PUBLIC_GOVERNANCE_ADDRESS=0xYOUR_GOVERNANCE_ADDRESS
NEXT_PUBLIC_FORTER_ADDRESS=0xYOUR_FORTER_ADDRESS
NEXT_PUBLIC_STAKINGPOOL_ADDRESS=0xYOUR_STAKINGPOOL_ADDRESS
```

### 3.2 Update contracts.ts Config (Optional)

If you have a `frontend/src/config/contracts.ts` file, update it with the new addresses:

```typescript
export const contracts = {
  forter: {
    address: '0xYOUR_FORTER_ADDRESS' as Address,
    abi: ForterABI,
  },
  stakingPool: {
    address: '0xYOUR_STAKINGPOOL_ADDRESS' as Address,
    abi: StakingPoolABI,
  },
  // ... other contracts
} as const;
```

---

## ✅ Step 4: Verify Deployment

### 4.1 Check Contracts on Basescan

Visit [Base Sepolia Explorer](https://sepolia.basescan.org/) and search for your contract addresses to verify:
- ✅ Contracts are verified (green checkmark)
- ✅ Ownership is correctly transferred
- ✅ Initial state is correct

### 4.2 Test Frontend Integration

Start the development server:
```bash
cd frontend
pnpm install  # if first time
pnpm dev
```

Visit `http://localhost:3000` and test:
1. ✅ Wallet connection works
2. ✅ Contract reads work (view functions)
3. ✅ Contract writes work (create news, create pool, stake)
4. ✅ No console errors related to contract addresses

---

## 🐛 Troubleshooting

### Issue: "Contract not found" error

**Solution:** Make sure you copied the correct addresses from deployment output.

### Issue: ABIs not found in frontend

**Solution:**
```bash
cd sc
./scripts/generate-abis.sh
```

### Issue: "Insufficient funds" when deploying

**Solution:** Get more Base Sepolia ETH from [faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)

### Issue: Verification failed on Basescan

**Solution:**
1. Check your `BASESCAN_API_KEY` is correct
2. Manually verify using Foundry:
   ```bash
   forge verify-contract <CONTRACT_ADDRESS> src/Forter.sol:Forter \
     --chain-id 84532 \
     --etherscan-api-key $BASESCAN_API_KEY \
     --constructor-args $(cast abi-encode "constructor(address,address,address)" $TOKEN $REPUTATION $GOVERNANCE)
   ```

---

## 📚 Additional Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [Base Docs](https://docs.base.org/)
- [Basescan Testnet](https://sepolia.basescan.org/)
- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)

---

## 🎯 Quick Reference Commands

```bash
# Deploy contracts
cd sc
forge script script/Deploy.s.sol:DeployScript --rpc-url $BASE_SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify -vvvv

# Generate ABIs
./scripts/generate-abis.sh

# Update frontend .env
cd ../frontend
# Edit .env.local with new addresses

# Start frontend
pnpm dev
```

---

## 📝 Post-Deployment Checklist

- [ ] All 5 contracts deployed successfully
- [ ] All contracts verified on Basescan
- [ ] ABIs generated and copied to frontend
- [ ] `.env.local` updated with all 5 contract addresses
- [ ] Frontend connects to wallet successfully
- [ ] Can read data from contracts (view functions)
- [ ] Can write data to contracts (transactions)
- [ ] No console errors

---

**Need help?** Check the main [README.md](./README.md) or open an issue on GitHub.
