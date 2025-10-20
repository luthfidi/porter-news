# Smart Contract Scripts

Scripts untuk memudahkan workflow development dan deployment.

## 📁 Available Scripts

### 1. `generate-abis.sh`

Generate ABI files dari smart contract ke frontend.

**Usage:**

```bash
# Dari folder sc/
./scripts/generate-abis.sh
```

**What it does:**

- Build smart contracts dengan `forge build`
- Extract ABI dari folder `out/` ke `../frontend/src/abis/`
- Generate ABI untuk semua contract: Forter, ReputationNFT, StakingPool, ForterGovernance, MockToken
- Support 2 methods: `jq` (preferred) atau `node` (fallback)

**Output:**

```
../frontend/src/abis/
  ├── Forter.json
  ├── ReputationNFT.json
  ├── StakingPool.json
  ├── ForterGovernance.json
  └── MockToken.json
```

---

### 2. `update-frontend.sh`

Full update frontend: ABI + Contract Addresses.

**Usage:**

```bash
# Update untuk Monad (default)
./scripts/update-frontend.sh

# Update untuk Monad (explicit)
./scripts/update-frontend.sh sepolia

# Update untuk Base Mainnet
./scripts/update-frontend.sh mainnet
```

**What it does:**

- Generate ABIs (call `generate-abis.sh`)
- Extract deployed contract addresses dari `broadcast/` folder
- Auto-update `frontend/src/config/contracts.ts` dengan addresses baru
- Remove `as const` dari ABI untuk fix TypeScript error

**Requirements:**

- Must have deployment broadcast file:
  - Sepolia: `broadcast/Deploy.s.sol/84532/run-latest.json`
  - Mainnet: `broadcast/Deploy.s.sol/8453/run-latest.json`

---

## 🚀 Quick Start

### First Time Setup

```bash
# 1. Make scripts executable
cd sc
chmod +x scripts/*.sh

# 2. Generate ABIs after build
./scripts/generate-abis.sh
```

### After Deployment

```bash
# 1. Deploy contracts
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast

# 2. Update frontend with new addresses + ABIs
./scripts/update-frontend.sh sepolia

# 3. Done! Frontend ready to use
cd ../frontend
npm run dev
```

### After Code Changes

```bash
# Just regenerate ABIs
./scripts/generate-abis.sh

# Or full update (if you redeployed)
./scripts/update-frontend.sh
```

---

## 🔧 Troubleshooting

### "jq: command not found"

**Option 1: Install jq (recommended)**

```bash
# WSL/Ubuntu
sudo apt update && sudo apt install jq

# macOS
brew install jq
```

**Option 2: Use node fallback**
Script akan otomatis pakai node jika jq tidak tersedia.

### "Permission denied"

```bash
chmod +x scripts/*.sh
```

### "ABI import error in TypeScript"

Cek file JSON yang di-generate. Harus berupa array `[{...}]`, BUKAN table format.

**Correct format:**

```json
[
  {
    "type": "function",
    "name": "createNews",
    ...
  }
]
```

**Wrong format:**

```
╭─────────╮
| Type    |
╰─────────╯
```

### "Cannot find deployed addresses"

Pastikan kamu sudah deploy dan ada file:

```
broadcast/Deploy.s.sol/<CHAIN_ID>/run-latest.json
```

Kalau tidak ada, update manual di `frontend/src/config/contracts.ts`.

---

## 📝 Manual ABI Generation (Alternative)

Jika script tidak work, bisa manual:

```bash
# Install jq first
sudo apt install jq

# Generate each ABI
cat out/Forter.sol/Forter.json | jq '.abi' > ../frontend/src/abis/Forter.json
cat out/ReputationNFT.sol/ReputationNFT.json | jq '.abi' > ../frontend/src/abis/ReputationNFT.json
cat out/StakingPool.sol/StakingPool.json | jq '.abi' > ../frontend/src/abis/StakingPool.json
cat out/Governance.sol/ForterGovernance.json | jq '.abi' > ../frontend/src/abis/ForterGovernance.json
cat out/ForterTestSetup.sol/MockToken.json | jq '.abi' > ../frontend/src/abis/MockToken.json
```

---

## 🎯 Integration with Development Workflow

### Recommended Workflow

```bash
# 1. Modify smart contracts
nano src/Forter.sol

# 2. Test changes
forge test

# 3. If tests pass, regenerate ABIs
./scripts/generate-abis.sh

# 4. Test frontend integration
cd ../frontend
npm run dev

# 5. If all good, deploy to testnet
cd ../sc
forge script script/Deploy.s.sol:DeployScript --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast

# 6. Update frontend with new deployment
./scripts/update-frontend.sh sepolia

# 7. Final frontend test
cd ../frontend
npm run dev
```

### CI/CD Integration

Add to `.github/workflows/deploy.yml`:

```yaml
- name: Generate ABIs
  run: |
    cd sc
    ./scripts/generate-abis.sh

- name: Update Frontend
  run: |
    cd sc
    ./scripts/update-frontend.sh sepolia
```

---

## 📚 Additional Resources

- [Foundry Book - Artifacts](https://book.getfoundry.sh/reference/forge/forge-build#artifacts)
- [jq Manual](https://stedolan.github.io/jq/manual/)
- [Wagmi - Contract ABIs](https://wagmi.sh/react/api/hooks/useContractRead)
