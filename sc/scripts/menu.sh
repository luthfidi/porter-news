#!/bin/bash
# Forter Smart Contract - Interactive Menu
# Usage: ./scripts/menu.sh

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Show banner
show_banner() {
    clear
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║   FORTER SMART CONTRACT COMMANDS      ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""
}

# Function to show menu
show_menu() {
    echo -e "${YELLOW}Build & Test:${NC}"
    echo "  1)  Clean build artifacts"
    echo "  2)  Build contracts"
    echo "  3)  Build with size report"
    echo "  4)  Run all tests"
    echo "  5)  Run tests with details (-vv)"
    echo "  6)  Run tests with gas report"
    echo "  7)  Format code"
    echo ""
    echo -e "${YELLOW}ABI Management:${NC}"
    echo "  8)  Generate ABIs for frontend ⭐"
    echo "  9)  Fix malformed ABIs"
    echo "  10) Update frontend (ABIs + Addresses) ⭐"
    echo ""
    echo -e "${YELLOW}Deployment:${NC}"
    echo "  11) Deploy to Base Sepolia"
    echo "  12) Deploy to Base Mainnet (PRODUCTION)"
    echo "  13) Post-deployment setup"
    echo ""
    echo -e "${YELLOW}Analysis:${NC}"
    echo "  14) Check contract sizes"
    echo "  15) Run coverage"
    echo ""
    echo "  0)  Exit"
    echo ""
}

# Main loop
while true; do
    show_banner
    show_menu
    read -p "Enter choice: " choice
    echo ""

    case $choice in
        1)
            echo -e "${YELLOW}Cleaning build artifacts...${NC}"
            forge clean
            echo -e "${GREEN}✓ Clean complete${NC}\n"
            read -p "Press Enter to continue..."
            ;;
        2)
            echo -e "${YELLOW}Building contracts...${NC}"
            forge build
            echo -e "${GREEN}✓ Build complete${NC}\n"
            read -p "Press Enter to continue..."
            ;;
        3)
            echo -e "${YELLOW}Building with size report...${NC}"
            forge build --sizes
            echo -e "${GREEN}✓ Build complete${NC}\n"
            read -p "Press Enter to continue..."
            ;;
        4)
            echo -e "${YELLOW}Running all tests...${NC}"
            forge test
            read -p "Press Enter to continue..."
            ;;
        5)
            echo -e "${YELLOW}Running tests with details...${NC}"
            forge test -vv
            read -p "Press Enter to continue..."
            ;;
        6)
            echo -e "${YELLOW}Running tests with gas report...${NC}"
            forge test --gas-report
            read -p "Press Enter to continue..."
            ;;
        7)
            echo -e "${YELLOW}Formatting code...${NC}"
            forge fmt
            echo -e "${GREEN}✓ Format complete${NC}\n"
            read -p "Press Enter to continue..."
            ;;
        8)
            echo -e "${YELLOW}Generating ABIs for frontend...${NC}"
            ./scripts/generate-abis.sh
            read -p "Press Enter to continue..."
            ;;
        9)
            echo -e "${YELLOW}Fixing malformed ABIs...${NC}"
            ./scripts/fix-abis.sh
            read -p "Press Enter to continue..."
            ;;
        10)
            echo -e "${YELLOW}Updating frontend (ABIs + Addresses)...${NC}"
            read -p "Enter network (sepolia/mainnet) [default: sepolia]: " network
            network=${network:-sepolia}
            ./scripts/update-frontend.sh "$network"
            read -p "Press Enter to continue..."
            ;;
        11)
            echo -e "${YELLOW}Deploying to Base Sepolia...${NC}"
            if [ ! -f .env ]; then
                echo -e "${RED}Error: .env file not found. Copy .env.example to .env and fill in your values.${NC}\n"
                read -p "Press Enter to continue..."
                continue
            fi
            source .env
            forge script script/Deploy.s.sol:DeployScript \
                --rpc-url $BASE_SEPOLIA_RPC_URL \
                --private-key $PRIVATE_KEY \
                --broadcast \
                --verify \
                -vvvv
            read -p "Press Enter to continue..."
            ;;
        12)
            echo -e "${RED}⚠️  WARNING: Deploying to MAINNET!${NC}"
            read -p "Are you sure? Type 'DEPLOY TO MAINNET' to confirm: " confirm
            if [ "$confirm" = "DEPLOY TO MAINNET" ]; then
                echo -e "${YELLOW}Deploying to Base Mainnet...${NC}"
                if [ ! -f .env ]; then
                    echo -e "${RED}Error: .env file not found.${NC}\n"
                    read -p "Press Enter to continue..."
                    continue
                fi
                source .env
                forge script script/Deploy.s.sol:DeployScript \
                    --rpc-url $BASE_MAINNET_RPC_URL \
                    --private-key $PRIVATE_KEY \
                    --broadcast \
                    --verify \
                    -vvvv
            else
                echo -e "${YELLOW}Deployment cancelled.${NC}\n"
            fi
            read -p "Press Enter to continue..."
            ;;
        13)
            echo -e "${YELLOW}Post-deployment setup...${NC}"
            if [ ! -f .env ]; then
                echo -e "${RED}Error: .env file not found.${NC}\n"
                read -p "Press Enter to continue..."
                continue
            fi
            source .env

            echo ""
            echo -e "${BLUE}Required post-deployment steps:${NC}"
            echo ""
            echo "1. Transfer ReputationNFT ownership to Forter:"
            echo -e "${GREEN}cast send $REPUTATION_NFT_ADDRESS \"transferOwnership(address)\" $FORTER_ADDRESS --private-key \$PRIVATE_KEY --rpc-url \$BASE_SEPOLIA_RPC_URL${NC}"
            echo ""
            echo "2. Setup Governance dependencies:"
            echo -e "${GREEN}cast send $GOVERNANCE_ADDRESS \"setDependencies(address,address)\" $STAKING_POOL_ADDRESS $REPUTATION_NFT_ADDRESS --private-key \$PRIVATE_KEY --rpc-url \$BASE_SEPOLIA_RPC_URL${NC}"
            echo ""
            read -p "Execute these commands now? (y/n): " execute
            if [ "$execute" = "y" ]; then
                echo -e "${YELLOW}Transferring ReputationNFT ownership...${NC}"
                cast send $REPUTATION_NFT_ADDRESS "transferOwnership(address)" $FORTER_ADDRESS --private-key $PRIVATE_KEY --rpc-url $BASE_SEPOLIA_RPC_URL

                echo -e "${YELLOW}Setting up Governance dependencies...${NC}"
                cast send $GOVERNANCE_ADDRESS "setDependencies(address,address)" $STAKING_POOL_ADDRESS $REPUTATION_NFT_ADDRESS --private-key $PRIVATE_KEY --rpc-url $BASE_SEPOLIA_RPC_URL

                echo -e "${GREEN}✓ Post-deployment setup complete${NC}\n"
            fi
            read -p "Press Enter to continue..."
            ;;
        14)
            echo -e "${YELLOW}Checking contract sizes...${NC}"
            forge build --sizes | grep -E "Contract|Forter|ReputationNFT|StakingPool|Governance"
            echo ""
            read -p "Press Enter to continue..."
            ;;
        15)
            echo -e "${YELLOW}Running coverage...${NC}"
            forge coverage
            read -p "Press Enter to continue..."
            ;;
        0)
            echo -e "${GREEN}Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option. Please try again.${NC}\n"
            read -p "Press Enter to continue..."
            ;;
    esac
done
