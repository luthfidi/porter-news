# 🚀 Forter Smart Contract - Quick Start

## 📌 TLDR - Copy Paste Commands

### First Time Setup
```bash
cd sc

# Make scripts executable
chmod +x scripts/*.sh COMMANDS.sh

# Copy and edit .env
cp .env.example .env
nano .env  # Fill in your PRIVATE_KEY and BASESCAN_API_KEY
```

### Fix Current ABI Issue ⚡
```bash
# Your ABIs are malformed (table format instead of JSON)
# Run this to fix:
./scripts/fix-abis.sh

# This will regenerate proper JSON ABIs from the build artifacts
```

### Development Workflow
```bash
# 1. Build & Test
forge build
forge test

# 2. Generate ABIs after any code change
./scripts/generate-abis.sh

# 3. Start frontend (in another terminal)
cd ../frontend
npm run dev
```

### After Deployment
```bash
# Update frontend with new addresses AND ABIs
./scripts/update-frontend.sh sepolia

# Or just regenerate ABIs
./scripts/generate-abis.sh
```

### Interactive Menu
```bash
# Run interactive menu for all commands
./scripts/menu.sh
```

---

## 📚 Understanding the ABI Issue

### ❌ What Went Wrong

You used:
```bash
forge inspect Forter abi > ../frontend/src/abis/Forter.json
```

This outputs **ASCII table format** (for humans to read):
```
╭─────────────╮
| Type   ...  |
│ function... │
╰─────────────╯
```

### ✅ What's Correct

Use build artifacts from `out/` folder:
```bash
cat out/Forter.sol/Forter.json | jq '.abi' > ../frontend/src/abis/Forter.json
```

This outputs **proper JSON array**:
```json
[
  {
    "type": "function",
    "name": "createNews",
    "inputs": [...],
    ...
  }
]
```

### 🔧 Quick Fix

```bash
# Option 1: Use the fix script (recommended)
./scripts/fix-abis.sh

# Option 2: Use the generate script
./scripts/generate-abis.sh

# Option 3: Full update (if you just deployed)
./scripts/update-frontend.sh sepolia
```

---

## 📂 Scripts Overview

| Script | What It Does | When to Use |
|--------|-------------|-------------|
| `generate-abis.sh` | Generate ABIs from build | After code changes |
| `fix-abis.sh` | Fix malformed ABIs | When ABI import errors occur |
| `update-frontend.sh` | ABIs + Addresses | After deployment |
| `menu.sh` | Interactive menu | For all operations |

---

## 🎯 Common Scenarios

### Scenario 1: Modified Smart Contract Code
```bash
# 1. Test your changes
forge test

# 2. Build
forge build

# 3. Update frontend ABIs
./scripts/generate-abis.sh

# 4. Test frontend
cd ../frontend && npm run dev
```

### Scenario 2: Just Deployed to Testnet
```bash
# Update everything (ABIs + contract addresses)
./scripts/update-frontend.sh sepolia

# Check the updated file
cat ../frontend/src/config/contracts.ts
```

### Scenario 3: ABI Import Error in Frontend
```bash
# You see: "const assertions can only be applied to..."
# This means ABIs are malformed

# Fix it:
./scripts/fix-abis.sh

# Restart frontend dev server
cd ../frontend
npm run dev
```

### Scenario 4: Fresh Clone / New Setup
```bash
# 1. Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# 2. Setup environment
cd sc
cp .env.example .env
nano .env  # Add PRIVATE_KEY, BASESCAN_API_KEY

# 3. Install dependencies
forge install

# 4. Build
forge build

# 5. Test
forge test

# 6. Generate ABIs
./scripts/generate-abis.sh

# 7. Deploy
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast

# 8. Update frontend
./scripts/update-frontend.sh sepolia
```

---

## 🐛 Troubleshooting

### "jq: command not found"
```bash
# Install jq
sudo apt update && sudo apt install jq

# Or script will auto-fallback to node
```

### "Permission denied"
```bash
chmod +x scripts/*.sh COMMANDS.sh
```

### TypeScript error: "A 'const' assertions can only be applied to..."
```bash
# This means your ABIs are malformed (table format)
./scripts/fix-abis.sh
```

### "Cannot find module '../abis/Forter.json'"
```bash
# ABIs not generated yet
./scripts/generate-abis.sh
```

### Contract addresses are wrong/outdated
```bash
# After redeployment
./scripts/update-frontend.sh sepolia

# Or manually edit
nano ../frontend/src/config/contracts.ts
```

---

## 📋 Complete Command Reference

### Build & Test
```bash
forge clean                    # Clean build artifacts
forge build                    # Build contracts
forge build --sizes            # Build with size report
forge test                     # Run all tests
forge test -vv                 # Tests with details
forge test -vvv                # Tests with traces
forge test --gas-report        # Tests with gas report
forge coverage                 # Coverage report
forge fmt                      # Format code
```

### ABI Generation
```bash
./scripts/generate-abis.sh     # Generate ABIs (recommended)
./scripts/fix-abis.sh          # Fix malformed ABIs
./scripts/update-frontend.sh   # Full update (ABIs + addresses)
```

### Deployment
```bash
# Base Sepolia
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  -vvvv

# Base Mainnet
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $BASE_MAINNET_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  -vvvv
```

### Post-Deployment
```bash
# Transfer ReputationNFT ownership
cast send $REPUTATION_NFT_ADDRESS \
  "transferOwnership(address)" $PORTER_ADDRESS \
  --private-key $PRIVATE_KEY \
  --rpc-url $BASE_SEPOLIA_RPC_URL

# Setup Governance
cast send $GOVERNANCE_ADDRESS \
  "setDependencies(address,address)" \
  $STAKING_POOL_ADDRESS $REPUTATION_NFT_ADDRESS \
  --private-key $PRIVATE_KEY \
  --rpc-url $BASE_SEPOLIA_RPC_URL
```

---

## 🔗 Useful Links

- **Foundry Book**: https://book.getfoundry.sh/
- **Base Docs**: https://docs.base.org/
- **Base Sepolia Faucet**: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- **BaseScan (Sepolia)**: https://sepolia.basescan.org
- **BaseScan (Mainnet)**: https://basescan.org

---

## 💡 Tips

1. **Always test on Sepolia first** before mainnet deployment
2. **Run `forge test` before every deployment**
3. **Keep `.env` file secure** - never commit it
4. **Use `./scripts/menu.sh`** for interactive experience
5. **After code changes, run `./scripts/generate-abis.sh`** immediately
6. **Check contract sizes** with `forge build --sizes` (must be < 24KB)

---

## 🎓 Learning Resources

### New to Foundry?
```bash
# Read the book
https://book.getfoundry.sh/

# Try the tutorial
forge init my-project
cd my-project
forge test
```

### New to Base?
```bash
# Check Base documentation
https://docs.base.org/

# Get testnet ETH
https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
```

---

## ✅ Checklist

Before deployment:
- [ ] All tests passing (`forge test`)
- [ ] Code formatted (`forge fmt`)
- [ ] Contracts under 24KB (`forge build --sizes`)
- [ ] `.env` file configured
- [ ] Testnet ETH in wallet
- [ ] ABIs generated (`./scripts/generate-abis.sh`)

After deployment:
- [ ] Contracts verified on BaseScan
- [ ] Post-deployment setup complete
- [ ] Frontend addresses updated (`./scripts/update-frontend.sh`)
- [ ] Frontend ABIs regenerated
- [ ] Integration tested on frontend

---

**Need help?** Check `scripts/README.md` or `DEPLOY.md` for more details.
