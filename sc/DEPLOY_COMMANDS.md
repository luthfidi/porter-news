# 🚀 Quick Deploy Commands

## Deploy to Monad

```bash
cd sc

forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  -vvvv
```

## After Deployment

### 1. Generate ABIs

```bash
chmod +x scripts/generate-abis.sh
./scripts/generate-abis.sh
```

### 2. Copy Addresses

The deployment will output something like:

```
=== COPY THESE TO YOUR .env FILES ===

NEXT_PUBLIC_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_REPUTATION_NFT_ADDRESS=0x...
NEXT_PUBLIC_GOVERNANCE_ADDRESS=0x...
NEXT_PUBLIC_PORTER_ADDRESS=0x...
NEXT_PUBLIC_STAKINGPOOL_ADDRESS=0x...
```

Copy these to `frontend/.env.local`

### 3. Verify on Basescan

Visit: https://sepolia.basescan.org/

Search for your contract addresses to ensure they're verified.

---

## Troubleshooting

### If deployment fails:

```bash
# Check gas price
cast gas-price --rpc-url $BASE_SEPOLIA_RPC_URL

# Check balance
cast balance $YOUR_ADDRESS --rpc-url $BASE_SEPOLIA_RPC_URL
```

### If verification fails:

Foundry will automatically retry, but if it still fails:

```bash
forge verify-contract <CONTRACT_ADDRESS> \
  src/Forter.sol:Forter \
  --chain-id 84532 \
  --etherscan-api-key $BASESCAN_API_KEY
```

---

## Additional Commands

### Check deployment history

```bash
cat broadcast/Deploy.s.sol/84532/run-latest.json
```

### Test contracts after deployment

```bash
forge test --fork-url $BASE_SEPOLIA_RPC_URL
```

### Get StakingPool address from Forter

```bash
cast call $PORTER_ADDRESS "stakingPool()(address)" --rpc-url $BASE_SEPOLIA_RPC_URL
```
