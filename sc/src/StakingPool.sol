// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IForter.sol";

contract StakingPool is ReentrancyGuard, Ownable {
    IForter public forter;
    IERC20 public stakingToken;

    // Staking data structures
    struct Stake {
        uint256 amount;
        uint256 timestamp;
        bool position; // true = agree with pool, false = disagree
        bool isWithdrawn;
    }

    struct StakeRecord {
        uint256 newsId;
        uint256 poolId;
        uint256 amount;
        bool position;
        uint256 timestamp;
    }

    // Mappings
    mapping(uint256 => mapping(uint256 => mapping(address => Stake))) public stakes; // newsId => poolId => user => Stake
    mapping(uint256 => mapping(uint256 => uint256)) public totalStaked; // newsId => poolId => amount
    mapping(uint256 => mapping(uint256 => uint256)) public agreeStakes; // newsId => poolId => agree amount
    mapping(uint256 => mapping(uint256 => uint256)) public disagreeStakes; // newsId => poolId => disagree amount
    mapping(address => uint256) public userTotalStaked;

    // Staker tracking
    mapping(uint256 => mapping(uint256 => address[])) public poolStakers; // newsId => poolId => stakers
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) public hasStaked; // newsId => poolId => user => bool
    mapping(address => StakeRecord[]) public userStakeHistory;

    // Reward tracking (for auto-distribute)
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) public rewardDistributed; // newsId => poolId => user => distributed

    // Events
    event Staked(
        uint256 indexed newsId,
        uint256 indexed poolId,
        address indexed user,
        uint256 amount,
        bool position
    );
    event Withdrawn(uint256 indexed newsId, uint256 indexed poolId, address indexed user, uint256 amount);
    event RewardClaimed(
        uint256 indexed newsId,
        uint256 indexed poolId,
        address indexed user,
        uint256 reward
    );

    constructor(address _forter, address _stakingToken) Ownable(msg.sender) {
        require(_forter != address(0) && _stakingToken != address(0), "Invalid addresses");
        forter = IForter(_forter);
        stakingToken = IERC20(_stakingToken);
    }

    // Stake tokens on a pool with position (agree/disagree)
    // NOTE: This function is only callable by Forter contract
    // Forter contract already transferred tokens to this contract before calling
    function stake(
        uint256 newsId,
        uint256 poolId,
        address user,
        uint256 amount,
        bool poolPosition,
        bool userPosition
    ) external onlyOwner {
        require(amount > 0, "Cannot stake 0");
        require(user != address(0), "Invalid user address");

        // Update stake records
        Stake storage userStake = stakes[newsId][poolId][user];

        if (userStake.amount == 0) {
            // First stake for this user on this pool
            userStake.position = userPosition;
        } else {
            // Additional stake - must be same position
            require(userStake.position == userPosition, "Cannot change position");
        }

        userStake.amount += amount;
        userStake.timestamp = block.timestamp;

        // Update totals
        totalStaked[newsId][poolId] += amount;
        userTotalStaked[user] += amount;

        // Track agree/disagree separately
        if (userPosition == poolPosition) {
            // User agrees with pool creator's position
            agreeStakes[newsId][poolId] += amount;
        } else {
            // User disagrees with pool creator's position
            disagreeStakes[newsId][poolId] += amount;
        }

        // Track staker
        if (!hasStaked[newsId][poolId][user]) {
            poolStakers[newsId][poolId].push(user);
            hasStaked[newsId][poolId][user] = true;
        }

        // Add to user history
        userStakeHistory[user].push(
            StakeRecord({
                newsId: newsId,
                poolId: poolId,
                amount: amount,
                position: userPosition,
                timestamp: block.timestamp
            })
        );

        emit Staked(newsId, poolId, user, amount, userPosition);
    }

    // Withdraw staked tokens (before resolution)
    function withdraw(uint256 newsId, uint256 poolId) external nonReentrant {
        Stake storage userStake = stakes[newsId][poolId][msg.sender];
        require(userStake.amount > 0, "No stake found");
        require(!userStake.isWithdrawn, "Already withdrawn");

        uint256 amount = userStake.amount;
        bool position = userStake.position;

        // Reset stake
        userStake.amount = 0;
        userStake.isWithdrawn = true;

        // Update totals
        totalStaked[newsId][poolId] -= amount;
        userTotalStaked[msg.sender] -= amount;

        // Update agree/disagree totals
        // Note: We need pool position from Forter
        // For now, we track based on user position
        if (position) {
            agreeStakes[newsId][poolId] -= amount;
        } else {
            disagreeStakes[newsId][poolId] -= amount;
        }

        // Transfer tokens back to user
        require(stakingToken.transfer(msg.sender, amount), "Withdrawal failed");

        emit Withdrawn(newsId, poolId, msg.sender, amount);
    }

    // Emergency withdraw without rewards (in case of issues)
    function emergencyWithdraw(uint256 newsId, uint256 poolId) external nonReentrant {
        Stake storage userStake = stakes[newsId][poolId][msg.sender];
        uint256 amount = userStake.amount;
        require(amount > 0, "No stake found");

        bool position = userStake.position;

        // Reset stake
        userStake.amount = 0;
        userStake.isWithdrawn = true;

        // Update totals
        totalStaked[newsId][poolId] -= amount;
        userTotalStaked[msg.sender] -= amount;

        // Update agree/disagree totals
        if (position) {
            agreeStakes[newsId][poolId] -= amount;
        } else {
            disagreeStakes[newsId][poolId] -= amount;
        }

        // Transfer tokens back to user
        require(stakingToken.transfer(msg.sender, amount), "Withdrawal failed");

        emit Withdrawn(newsId, poolId, msg.sender, amount);
    }

    // NOTE: Manual claim functions removed - using auto-distribute instead
    // Rewards are automatically distributed when news is resolved

    // View functions
    function getUserStake(uint256 newsId, uint256 poolId, address user)
        external
        view
        returns (
            uint256 amount,
            bool position,
            uint256 timestamp,
            bool isWithdrawn
        )
    {
        Stake storage userStakeData = stakes[newsId][poolId][user];
        return (userStakeData.amount, userStakeData.position, userStakeData.timestamp, userStakeData.isWithdrawn);
    }

    function getTotalStaked(uint256 newsId, uint256 poolId) external view returns (uint256) {
        return totalStaked[newsId][poolId];
    }

    function getPoolStakers(uint256 newsId, uint256 poolId) external view returns (address[] memory) {
        return poolStakers[newsId][poolId];
    }

    function getUserStakeHistory(address user) external view returns (StakeRecord[] memory) {
        return userStakeHistory[user];
    }

    function getPoolStakeStats(uint256 newsId, uint256 poolId)
        external
        view
        returns (
            uint256 total,
            uint256 agree,
            uint256 disagree,
            uint256 stakerCount
        )
    {
        return (
            totalStaked[newsId][poolId],
            agreeStakes[newsId][poolId],
            disagreeStakes[newsId][poolId],
            poolStakers[newsId][poolId].length
        );
    }

    // Called by Forter contract to mark stake as distributed (auto-distribute)
    function markStakeAsDistributed(
        uint256 newsId,
        uint256 poolId,
        address user
    ) external onlyOwner {
        require(!rewardDistributed[newsId][poolId][user], "Already distributed");

        Stake storage userStake = stakes[newsId][poolId][user];
        userStake.isWithdrawn = true; // Mark as distributed
        rewardDistributed[newsId][poolId][user] = true;
    }

    // Transfer tokens to recipient (called by Forter during auto-distribute)
    function transferReward(address recipient, uint256 amount) external onlyOwner {
        require(stakingToken.transfer(recipient, amount), "Transfer failed");
    }
}
