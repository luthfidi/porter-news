// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ForterTestSetup.sol";

contract ForterTest is ForterTestSetup {
    function testCreateNews() public {
        uint256 initialCount = forter.getNewsCount();
        uint256 resolveTime = block.timestamp + 7 days;

        vm.prank(user1);
        forter.createNews(
            "Test News Title",
            "Test News Description with enough characters",
            "Crypto",
            "BTC will hit $100k",
            resolveTime
        );

        assertEq(forter.getNewsCount(), initialCount + 1);

        (
            address creator,
            string memory title,
            string memory description,
            string memory category,
            string memory resolutionCriteria,
            uint256 createdAt,
            uint256 newsResolveTime,
            bool isResolved,
            bool outcome,
            uint256 totalPools,
            uint256 totalStaked
        ) = forter.getNewsInfo(initialCount);

        assertEq(creator, user1);
        assertEq(title, "Test News Title");
        assertEq(category, "Crypto");
        assertEq(newsResolveTime, resolveTime);
        assertFalse(isResolved);
        assertFalse(outcome);
        assertEq(totalPools, 0);
        assertEq(totalStaked, 0);
        assertTrue(createdAt > 0);
        assertTrue(bytes(description).length > 0);
        assertTrue(bytes(resolutionCriteria).length > 0);
    }

    function testCreatePool() public {
        uint256 newsId = _createNews();

        string[] memory evidence = new string[](2);
        evidence[0] = "https://example.com/evidence1";
        evidence[1] = "https://example.com/evidence2";

        vm.prank(user2);
        forter.createPool(
            newsId,
            "This is a test reasoning with more than 100 characters to satisfy the minimum length requirement for the reasoning field.",
            evidence,
            "https://example.com/image.jpg",
            "Chart showing trend",
            true,
            MIN_STAKE
        );

        assertEq(forter.getPoolCount(newsId), 1);

        (
            address creator,
            string memory reasoning,
            string[] memory evidenceLinks,
            string memory imageUrl,
            string memory imageCaption,
            bool position,
            uint256 creatorStake,
            uint256 totalStaked,
            uint256 agreeStakes,
            uint256 disagreeStakes,
            uint256 createdAt,
            bool isResolved,
            bool isCorrect
        ) = forter.getPoolInfo(newsId, 0);

        assertEq(creator, user2);
        assertTrue(bytes(reasoning).length >= 100);
        assertEq(evidenceLinks.length, 2);
        assertEq(imageUrl, "https://example.com/image.jpg");
        assertEq(imageCaption, "Chart showing trend");
        assertTrue(position);
        assertEq(creatorStake, MIN_STAKE);
        assertEq(totalStaked, MIN_STAKE);
        assertEq(agreeStakes, MIN_STAKE);
        assertEq(disagreeStakes, 0);
        assertTrue(createdAt > 0);
        assertFalse(isResolved);
        assertFalse(isCorrect);
    }

    function testStakeTokens() public {
        uint256 newsId = _createNews();
        uint256 poolId = _createPool(newsId, user2);

        uint256 stakeAmount = 1000 * 10**18;

        vm.prank(user1);
        forter.stake(newsId, poolId, stakeAmount, true); // User agrees with pool (YES position)

        (uint256 amount, bool position, uint256 timestamp, bool isWithdrawn) =
            forter.getUserStake(newsId, poolId, user1);

        assertEq(amount, stakeAmount);
        assertTrue(position); // User agrees with pool
        assertTrue(timestamp > 0);
        assertFalse(isWithdrawn);
    }

    function testResolveNews() public {
        uint256 newsId = _createNews();
        uint256 poolId = _createPool(newsId, user2);

        // Stake on the pool
        uint256 stakeAmount = 1000 * 10**18;
        vm.prank(user1);
        forter.stake(newsId, poolId, stakeAmount, true);

        // Fast forward time to after resolution
        vm.warp(block.timestamp + 8 days);

        // Resolve the news
        vm.prank(owner);
        forter.resolveNews(newsId, true, "https://coingecko.com", "BTC reached $100k");

        // Check if news is resolved
        (,,,,,,, bool isResolved, bool outcome,,) = forter.getNewsInfo(newsId);
        assertTrue(isResolved);
        assertTrue(outcome);

        // Check resolution info
        (uint256 resolvedAt, address resolvedBy, string memory resolutionSource, string memory resolutionNotes) =
            forter.getNewsResolutionInfo(newsId);

        assertTrue(resolvedAt > 0);
        assertEq(resolvedBy, owner);
        assertEq(resolutionSource, "https://coingecko.com");
        assertEq(resolutionNotes, "BTC reached $100k");

        // Check pool is resolved
        (,,,,,,,,,,, bool poolIsResolved, bool poolIsCorrect) = forter.getPoolInfo(newsId, poolId);
        assertTrue(poolIsResolved);
        assertTrue(poolIsCorrect); // Pool position was YES, outcome was YES
    }

    function testGetPoolsByNewsId() public {
        uint256 newsId = _createNews();

        // Create 3 pools
        _createPool(newsId, user1);
        _createPool(newsId, user2);
        _createPool(newsId, user3);

        (uint256[] memory poolIds, uint256 total) = forter.getPoolsByNewsId(newsId, 0, 10);

        assertEq(total, 3);
        assertEq(poolIds.length, 3);
        assertEq(poolIds[0], 0);
        assertEq(poolIds[1], 1);
        assertEq(poolIds[2], 2);
    }

    function testGetPoolsByCreator() public {
        uint256 newsId = _createNews();

        // User2 creates 2 pools
        _createPool(newsId, user2);
        _createPool(newsId, user2);

        (uint256[] memory newsIds, uint256[] memory poolIds) = forter.getPoolsByCreator(user2);

        assertEq(newsIds.length, 2);
        assertEq(poolIds.length, 2);
        assertEq(newsIds[0], newsId);
        assertEq(newsIds[1], newsId);
        assertEq(poolIds[0], 0);
        assertEq(poolIds[1], 1);
    }

    function testStakePositionTracking() public {
        uint256 newsId = _createNews();
        uint256 poolId = _createPool(newsId, user2); // Pool position: YES

        uint256 agreeAmount = 500 * 10**18;
        uint256 disagreeAmount = 300 * 10**18;

        // User1 agrees with pool (stakes YES)
        vm.prank(user1);
        forter.stake(newsId, poolId, agreeAmount, true);

        // User3 disagrees with pool (stakes NO)
        vm.prank(user3);
        forter.stake(newsId, poolId, disagreeAmount, false);

        // Check pool totals
        (,,,,,,, uint256 totalStaked, uint256 agreeStakes, uint256 disagreeStakes,,,) =
            forter.getPoolInfo(newsId, poolId);

        assertEq(totalStaked, MIN_STAKE + agreeAmount + disagreeAmount);
        assertEq(agreeStakes, MIN_STAKE + agreeAmount); // Creator + user1
        assertEq(disagreeStakes, disagreeAmount); // user3
    }
}
