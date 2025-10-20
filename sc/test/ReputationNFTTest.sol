// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ForterTestSetup.sol";

contract ReputationNFTTest is ForterTestSetup {
    function testIncreaseReputation() public {
        uint256 initialBalance = reputationNFT.balanceOf(user1);

        // Increase reputation (will mint NFT if first time)
        vm.prank(address(forter));
        reputationNFT.increaseReputation(user1, 100);

        // Should have minted an NFT
        assertEq(reputationNFT.balanceOf(user1), initialBalance + 1);

        // Check reputation score
        (uint256 score,,,,,,) = reputationNFT.getUserReputation(user1);
        assertEq(score, 100);
    }

    function testIncreaseReputationMultipleTimes() public {
        // First increase
        vm.prank(address(forter));
        reputationNFT.increaseReputation(user1, 100);

        // Second increase
        vm.prank(address(forter));
        reputationNFT.increaseReputation(user1, 50);

        // Check reputation score
        (uint256 score,,,,,,) = reputationNFT.getUserReputation(user1);
        assertEq(score, 150);
    }

    function testReputationTiers() public {
        vm.startPrank(address(forter));

        // Increase reputation to 100 (Analyst tier)
        reputationNFT.increaseReputation(user1, 150);
        (,,,, uint256 tier1, string memory tierName1,) = reputationNFT.getUserReputation(user1);
        assertEq(tier1, 1); // Analyst
        assertEq(tierName1, "Analyst");

        // Increase to 600 (Expert tier)
        reputationNFT.increaseReputation(user1, 450);
        (,,,, uint256 tier2, string memory tierName2,) = reputationNFT.getUserReputation(user1);
        assertEq(tier2, 2); // Expert
        assertEq(tierName2, "Expert");

        // Increase to 1200 (Master tier)
        reputationNFT.increaseReputation(user1, 600);
        (,,,, uint256 tier3, string memory tierName3,) = reputationNFT.getUserReputation(user1);
        assertEq(tier3, 3); // Master
        assertEq(tierName3, "Master");

        vm.stopPrank();
    }

    function testRecordPrediction() public {
        vm.startPrank(address(forter));

        // Record correct prediction
        reputationNFT.recordPrediction(user1, true);

        // Check stats
        (,, uint256 totalPreds, uint256 correctPreds,, string memory tierName,) = reputationNFT.getUserReputation(user1);
        assertEq(totalPreds, 1);
        assertEq(correctPreds, 1);
        assertEq(tierName, "Novice");

        vm.stopPrank();
    }
}
