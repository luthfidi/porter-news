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

        // Record 2 correct pools at $100 each = 200 points (1.5x multiplier) = Analyst tier
        reputationNFT.recordPoolWithStake(user1, true, 100e6); // +100 × 1.5x = 150 points
        reputationNFT.recordPoolWithStake(user1, true, 100e6); // +100 × 1.5x = 150 points
        (,,,, uint256 tier1, string memory tierName1,) = reputationNFT.getUserReputation(user1);
        assertEq(tier1, 1); // Analyst (300 points, 2 pools)
        assertEq(tierName1, "Analyst");

        // Add 3 more correct pools at $500 = 600 total points = Expert tier (need 5 pools)
        reputationNFT.recordPoolWithStake(user1, true, 500e6); // +100 × 2.0x = 200 points
        reputationNFT.recordPoolWithStake(user1, true, 500e6); // +100 × 2.0x = 200 points
        reputationNFT.recordPoolWithStake(user1, true, 500e6); // +100 × 2.0x = 200 points
        (,,,, uint256 tier2, string memory tierName2,) = reputationNFT.getUserReputation(user1);
        assertEq(tier2, 2); // Expert (900 points, 5 pools - meets min requirement)
        assertEq(tierName2, "Expert");

        // Add 7 more correct pools at $1000 = 1750+ points, 12 pools = Master tier
        reputationNFT.recordPoolWithStake(user1, true, 1000e6); // +100 × 2.5x = 250 points
        reputationNFT.recordPoolWithStake(user1, true, 1000e6);
        reputationNFT.recordPoolWithStake(user1, true, 1000e6);
        reputationNFT.recordPoolWithStake(user1, true, 1000e6);
        reputationNFT.recordPoolWithStake(user1, true, 1000e6);
        reputationNFT.recordPoolWithStake(user1, true, 1000e6);
        reputationNFT.recordPoolWithStake(user1, true, 1000e6);
        (,,,, uint256 tier3, string memory tierName3,) = reputationNFT.getUserReputation(user1);
        assertEq(tier3, 3); // Master (2650 points, 12 pools - meets min 10 pools)
        assertEq(tierName3, "Master");

        vm.stopPrank();
    }

    function testRecordPrediction() public {
        vm.startPrank(address(forter));

        // Record correct prediction with stake weight
        reputationNFT.recordPoolWithStake(user1, true, 100e6); // $100 pool

        // Check stats
        (,, uint256 totalPreds, uint256 correctPreds,, string memory tierName,) = reputationNFT.getUserReputation(user1);
        assertEq(totalPreds, 1);
        assertEq(correctPreds, 1);
        assertEq(tierName, "Novice"); // 100 points (1 correct × 1.5x) = still Novice (<200)

        vm.stopPrank();
    }
}
