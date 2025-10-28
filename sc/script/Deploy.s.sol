// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {Forter} from "../src/Forter.sol";
import {ReputationNFT} from "../src/ReputationNFT.sol";
import {ForterGovernance} from "../src/Governance.sol";
import {MockToken} from "../test/ForterTestSetup.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract DeployScript is Script {
    // Contract instances
    MockToken public token;
    ReputationNFT public reputationNft;
    ForterGovernance public governance;
    Forter public forter;
    
    // Deployment parameters
    uint256 public constant MIN_STAKE = 10 * 10**6; // 10 USDC minimum stake (6 decimals)
    uint256 public constant MAX_NEWS_DURATION = 30 days;
    uint256 public constant MIN_NEWS_DURATION = 1 days;
    uint256 public constant PROTOCOL_FEE = 50; // 0.5%
    
    function run() external {
        // Get deployer address
        address deployer = msg.sender;
        
        // Start broadcasting transactions
        vm.startBroadcast(deployer);
        
        // 1. Deploy mock token (replace with real token in production)
        token = new MockToken();
        
        // 2. Deploy Reputation NFT
        reputationNft = new ReputationNFT();
        
        // 3. Deploy Governance
        governance = new ForterGovernance(
            ERC20Votes(address(token)),
            MIN_STAKE,
            MAX_NEWS_DURATION,
            MIN_NEWS_DURATION,
            PROTOCOL_FEE,
            deployer // fee recipient
        );
        
        // 4. Deploy Forter
        forter = new Forter(
            address(token),
            address(reputationNft),
            payable(address(governance))
        );
        
        // 5. Set up governance with contract addresses
        governance.setDependencies(
            address(forter.stakingPool()),
            address(reputationNft)
        );
        
        // 6. Transfer ownership of ReputationNFT to Forter for automated reputation updates
        reputationNft.transferOwnership(address(forter));

        vm.stopBroadcast();

        // ============================================
        // DEPLOYMENT SUMMARY - COPY TO .env FILES
        // ============================================
        console.log("\n=== DEPLOYMENT COMPLETED SUCCESSFULLY ===\n");
        console.log("Token (MockToken) deployed at:", address(token));
        console.log("ReputationNFT deployed at:", address(reputationNft));
        console.log("Governance deployed at:", address(governance));
        console.log("Forter (Main Contract) deployed at:", address(forter));
        console.log("StakingPool deployed at:", address(forter.stakingPool()));
        console.log("\n=== COPY THESE TO YOUR .env FILES ===\n");
        console.log("# Smart Contract .env");
        console.log("# (Already saved in broadcast folder)\n");
        console.log("# Frontend .env");
        console.log("NEXT_PUBLIC_TOKEN_ADDRESS=%s", address(token));
        console.log("NEXT_PUBLIC_REPUTATION_NFT_ADDRESS=%s", address(reputationNft));
        console.log("NEXT_PUBLIC_GOVERNANCE_ADDRESS=%s", address(governance));
        console.log("NEXT_PUBLIC_FORTER_ADDRESS=%s", address(forter));
        console.log("NEXT_PUBLIC_STAKINGPOOL_ADDRESS=%s", address(forter.stakingPool()));
        console.log("\n=========================================\n");
    }
}
