#!/bin/bash

# Porter News Deployment Script for Monad Testnet
# MetaMask Smart Accounts Hackathon x Monad x Envio

echo "🚀 Deploying Porter News to Monad Testnet..."
echo "================================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please copy .env.example to .env and fill in the values."
    exit 1
fi

# Source environment variables
source .env

# Check required variables
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ PRIVATE_KEY not set in .env file"
    exit 1
fi

if [ -z "$MONAD_RPC_URL" ]; then
    echo "❌ MONAD_RPC_URL not set in .env file"
    exit 1
fi

echo "📋 Deployment Configuration:"
echo "   Network: Monad Testnet"
echo "   RPC URL: $MONAD_RPC_URL"
echo "   Chain ID: $CHAIN_ID"
echo ""

# Clean previous builds
echo "🧹 Cleaning previous builds..."
forge clean

# Build contracts
echo "🔨 Building contracts..."
forge build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

# Run tests (optional)
echo "🧪 Running tests..."
forge test --no-match-contract TestDeploy

if [ $? -ne 0 ]; then
    echo "⚠️  Some tests failed, but continuing deployment..."
fi

# Deploy contracts
echo "🚀 Deploying contracts to Monad Testnet..."
forge script script/Deploy.s.sol:DeployScript \
    --rpc-url "$MONAD_RPC_URL" \
    --private-key "$PRIVATE_KEY" \
    --broadcast \
    --legacy \
    -vvvv

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment completed successfully!"
    echo ""
    echo "📊 Find deployment details in:"
    echo "   - broadcast/ folder"
    echo "   - Monad Explorer: https://testnet.monadexplorer.com"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Copy contract addresses to frontend/.env.local"
    echo "   2. Update README.md with deployed addresses"
    echo "   3. Verify contracts on Monad Explorer"
else
    echo "❌ Deployment failed"
    exit 1
fi