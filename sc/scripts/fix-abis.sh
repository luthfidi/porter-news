#!/bin/bash
# Script untuk fix ABI yang sudah di-generate dengan format salah
# Usage: ./scripts/fix-abis.sh

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}   Fix Malformed ABIs${NC}"
echo -e "${BLUE}================================${NC}\n"

FRONTEND_ABI_DIR="../frontend/src/abis"

# Check if frontend abis directory exists
if [ ! -d "$FRONTEND_ABI_DIR" ]; then
    echo -e "${RED}Error: Frontend ABI directory not found: $FRONTEND_ABI_DIR${NC}"
    exit 1
fi

# Check if ABIs exist and are malformed (contain ASCII table characters)
echo -e "${YELLOW}Checking for malformed ABIs...${NC}\n"

MALFORMED=0
for file in "$FRONTEND_ABI_DIR"/*.json; do
    if [ -f "$file" ]; then
        if grep -q "╭\|╰\|│\|├\|┤" "$file" 2>/dev/null; then
            echo -e "${RED}✗ Malformed: $(basename $file)${NC}"
            ((MALFORMED++))
        else
            # Check if it's valid JSON
            if jq empty "$file" 2>/dev/null || node -e "JSON.parse(require('fs').readFileSync('$file', 'utf8'))" 2>/dev/null; then
                echo -e "${GREEN}✓ Valid: $(basename $file)${NC}"
            else
                echo -e "${YELLOW}? Unknown format: $(basename $file)${NC}"
                ((MALFORMED++))
            fi
        fi
    fi
done

echo ""

if [ $MALFORMED -eq 0 ]; then
    echo -e "${GREEN}All ABIs are valid! No fix needed.${NC}"
    exit 0
fi

echo -e "${YELLOW}Found $MALFORMED malformed ABI file(s).${NC}"
echo -e "${YELLOW}Regenerating ABIs from source...${NC}\n"

# Rebuild contracts first
echo -e "${BLUE}Step 1: Rebuilding contracts...${NC}"
if [ ! -f "foundry.toml" ]; then
    echo -e "${RED}Error: Must run from sc/ directory${NC}"
    exit 1
fi

forge build
echo -e "${GREEN}✓ Build complete${NC}\n"

# Regenerate ABIs
echo -e "${BLUE}Step 2: Regenerating ABIs...${NC}\n"

regenerate_abi() {
    local contract_path=$1
    local contract_name=$2
    local output_file=$3

    echo -e "  Fixing: ${contract_name}"

    if [ ! -f "out/${contract_path}/${contract_name}.json" ]; then
        echo -e "${RED}    ✗ Source not found${NC}"
        return 1
    fi

    # Try jq first
    if command -v jq &> /dev/null; then
        cat "out/${contract_path}/${contract_name}.json" | jq '.abi' > "$output_file"
        echo -e "${GREEN}    ✓ Regenerated${NC}"
    else
        # Fallback to node
        node -e "
            const fs = require('fs');
            const artifact = JSON.parse(fs.readFileSync('out/${contract_path}/${contract_name}.json', 'utf8'));
            fs.writeFileSync('${output_file}', JSON.stringify(artifact.abi, null, 2));
        " 2>/dev/null

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}    ✓ Regenerated${NC}"
        else
            echo -e "${RED}    ✗ Failed${NC}"
            return 1
        fi
    fi
}

regenerate_abi "Forter.sol" "Forter" "${FRONTEND_ABI_DIR}/Forter.json"
regenerate_abi "ReputationNFT.sol" "ReputationNFT" "${FRONTEND_ABI_DIR}/ReputationNFT.json"
regenerate_abi "StakingPool.sol" "StakingPool" "${FRONTEND_ABI_DIR}/StakingPool.json"
regenerate_abi "Governance.sol" "ForterGovernance" "${FRONTEND_ABI_DIR}/ForterGovernance.json"
regenerate_abi "ForterTestSetup.sol" "MockToken" "${FRONTEND_ABI_DIR}/MockToken.json"

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✓ ABIs fixed successfully!${NC}"
echo -e "${GREEN}================================${NC}\n"

# Verify the fix
echo -e "${BLUE}Verifying fixed ABIs...${NC}\n"

ALL_VALID=1
for file in "$FRONTEND_ABI_DIR"/*.json; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        if jq empty "$file" 2>/dev/null || node -e "JSON.parse(require('fs').readFileSync('$file', 'utf8'))" 2>/dev/null; then
            echo -e "${GREEN}✓ ${filename} - Valid JSON${NC}"
        else
            echo -e "${RED}✗ ${filename} - Still invalid${NC}"
            ALL_VALID=0
        fi
    fi
done

echo ""

if [ $ALL_VALID -eq 1 ]; then
    echo -e "${GREEN}All ABIs are now valid!${NC}"
    echo -e "${YELLOW}You can now restart your frontend dev server.${NC}"
else
    echo -e "${RED}Some ABIs are still invalid. Please check manually.${NC}"
    exit 1
fi
