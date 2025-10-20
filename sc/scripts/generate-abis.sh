#!/bin/bash
# Script untuk generate ABI dari smart contract ke frontend
# Usage: ./scripts/generate-abis.sh

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}   Forter ABI Generator${NC}"
echo -e "${BLUE}================================${NC}\n"

# Check if we're in the sc directory
if [ ! -f "foundry.toml" ]; then
    echo -e "${RED}Error: foundry.toml not found. Please run this script from the sc directory.${NC}"
    exit 1
fi

# Build contracts first
echo -e "${YELLOW}Step 1: Building contracts...${NC}"
forge build
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Build failed. Please fix compilation errors first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Build successful${NC}\n"

# Create frontend abis directory if it doesn't exist
FRONTEND_ABI_DIR="../frontend/src/abis"
echo -e "${YELLOW}Step 2: Creating ABI directory...${NC}"
mkdir -p "$FRONTEND_ABI_DIR"
echo -e "${GREEN}✓ Directory ready: $FRONTEND_ABI_DIR${NC}\n"

# Function to extract ABI using jq
extract_abi() {
    local contract_path=$1
    local contract_name=$2
    local output_file=$3

    echo -e "${BLUE}Processing: ${contract_name}${NC}"

    if [ ! -f "out/${contract_path}/${contract_name}.json" ]; then
        echo -e "${RED}  ✗ Source file not found: out/${contract_path}/${contract_name}.json${NC}"
        return 1
    fi

    # Check if jq is available
    if command -v jq &> /dev/null; then
        # Use jq for clean JSON extraction
        cat "out/${contract_path}/${contract_name}.json" | jq '.abi' > "$output_file"
        echo -e "${GREEN}  ✓ Generated: ${output_file}${NC}"
    else
        # Fallback: Use node to extract ABI (works on WSL)
        node -e "
            const fs = require('fs');
            const artifact = JSON.parse(fs.readFileSync('out/${contract_path}/${contract_name}.json', 'utf8'));
            fs.writeFileSync('${output_file}', JSON.stringify(artifact.abi, null, 2));
        " 2>/dev/null

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}  ✓ Generated: ${output_file}${NC}"
        else
            echo -e "${RED}  ✗ Failed to extract ABI. Install jq or node.${NC}"
            return 1
        fi
    fi
}

# Extract ABIs for all contracts
echo -e "${YELLOW}Step 3: Extracting ABIs...${NC}\n"

extract_abi "Forter.sol" "Forter" "${FRONTEND_ABI_DIR}/Forter.json"
extract_abi "ReputationNFT.sol" "ReputationNFT" "${FRONTEND_ABI_DIR}/ReputationNFT.json"
extract_abi "StakingPool.sol" "StakingPool" "${FRONTEND_ABI_DIR}/StakingPool.json"
extract_abi "Governance.sol" "ForterGovernance" "${FRONTEND_ABI_DIR}/ForterGovernance.json"
extract_abi "ForterTestSetup.sol" "MockToken" "${FRONTEND_ABI_DIR}/MockToken.json"

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✓ All ABIs generated successfully!${NC}"
echo -e "${GREEN}================================${NC}\n"

# Show file sizes
echo -e "${BLUE}Generated files:${NC}"
ls -lh "$FRONTEND_ABI_DIR"/*.json | awk '{print "  " $9 " (" $5 ")"}'

echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Check the generated ABI files in: ${FRONTEND_ABI_DIR}"
echo -e "  2. Update contract addresses in frontend/src/config/contracts.ts"
echo -e "  3. Test the frontend integration"
echo ""
