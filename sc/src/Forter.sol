// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IForter.sol";
import "./ReputationNFT.sol";
import "./StakingPool.sol";
import "./Governance.sol";

contract Forter is Ownable2Step, ReentrancyGuard {
    // Contract dependencies
    ReputationNFT public reputationNFT;
    StakingPool public stakingPool;
    ForterGovernance public governance;
    IERC20 public stakingToken;

    // Enums for better type safety
    enum NewsStatus { Active, Resolved }
    enum Outcome { None, YES, NO }
    enum Position { YES, NO }

    // News and Pools
    struct News {
        address creator;
        string title;
        string description;
        string category;
        string resolutionCriteria;
        uint256 createdAt;
        uint256 resolveTime;
        NewsStatus status;
        Outcome outcome;
        uint256 totalPools;
        uint256 totalStaked;
        // Resolution metadata
        uint256 resolvedAt;
        address resolvedBy;
        string resolutionSource;
        string resolutionNotes;
        bool emergencyResolve;
        mapping(uint256 => Pool) pools;
    }

    struct Pool {
        address creator;
        string reasoning;
        string[] evidenceLinks;
        string imageUrl;
        string imageCaption;
        Position position;
        uint256 creatorStake;
        uint256 totalStaked;
        uint256 agreeStakes;
        uint256 disagreeStakes;
        uint256 createdAt;
        bool isResolved;
        bool isCorrect; // Did pool creator's position match news outcome?
    }

    // State variables
    uint256 public newsCount;

    // Mappings
    mapping(uint256 => News) public newsItems;
    mapping(address => uint256) public userNewsCount;
    mapping(address => uint256[]) public userNewsIds; // Track news created by user
    mapping(address => uint256[]) public userPoolNewsIds; // Track pools' newsIds by creator
    mapping(address => uint256[]) public userPoolIds; // Track pools' poolIds by creator

    // Events
    event NewsCreated(
        uint256 indexed newsId,
        address indexed creator,
        string title,
        string category,
        uint256 resolveTime
    );

    event PoolCreated(
        uint256 indexed newsId,
        uint256 indexed poolId,
        address indexed creator,
        string reasoning,
        Position position,
        uint256 creatorStake
    );

    event Staked(
        uint256 indexed newsId,
        uint256 indexed poolId,
        address indexed user,
        uint256 amount,
        bool position
    );

    event Resolved(uint256 indexed newsId, uint8 outcome, address resolvedBy);

    event EmergencyResolved(uint256 indexed newsId, uint8 outcome, address resolvedBy);

    constructor(address _stakingToken, address _reputationNFT, address payable _governance)
        Ownable(msg.sender)
    {
        require(
            _stakingToken != address(0) && _reputationNFT != address(0) && _governance != address(0),
            "Invalid address"
        );

        stakingToken = IERC20(_stakingToken);
        reputationNFT = ReputationNFT(_reputationNFT);
        governance = ForterGovernance(_governance);

        // Create staking pool
        stakingPool = new StakingPool(address(this), _stakingToken);
    }

    // Modifiers
    modifier validNews(uint256 newsId) {
        require(newsId < newsCount, "Invalid news ID");
        _;
    }

    modifier onlyBeforeResolve(uint256 newsId) {
        require(newsItems[newsId].status == NewsStatus.Active, "News already resolved");
        require(block.timestamp < newsItems[newsId].resolveTime, "Resolution time passed");
        _;
    }

    // Core Functions
    function createNews(
        string memory _title,
        string memory _description,
        string memory _category,
        string memory _resolutionCriteria,
        uint256 _resolveTime
    ) external {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");

        // Get governance parameters
        (, uint256 maxNewsDuration, uint256 minNewsDuration,,) = getGovernanceParameters();

        require(
            _resolveTime > block.timestamp + minNewsDuration && _resolveTime <= block.timestamp + maxNewsDuration,
            "Invalid resolve time"
        );

        uint256 newsId = newsCount++;
        News storage news = newsItems[newsId];

        news.creator = msg.sender;
        news.title = _title;
        news.description = _description;
        news.category = _category;
        news.resolutionCriteria = _resolutionCriteria;
        news.createdAt = block.timestamp;
        news.resolveTime = _resolveTime;
        news.status = NewsStatus.Active;
        news.outcome = Outcome.None;

        userNewsCount[msg.sender]++;
        userNewsIds[msg.sender].push(newsId);

        emit NewsCreated(newsId, msg.sender, _title, _category, _resolveTime);
    }

    function createPool(
        uint256 newsId,
        string memory _reasoning,
        string[] memory _evidenceLinks,
        string memory _imageUrl,
        string memory _imageCaption,
        Position _position,
        uint256 _creatorStake
    ) external validNews(newsId) onlyBeforeResolve(newsId) nonReentrant {
        require(bytes(_reasoning).length >= 100, "Reasoning too short");
        require(_creatorStake > 0, "Creator stake must be greater than 0");

        // Get minimum stake from governance
        (uint256 minStake,,,,) = getGovernanceParameters();
        require(_creatorStake >= minStake, "Stake below minimum");

        News storage news = newsItems[newsId];
        uint256 poolId = news.totalPools++;

        Pool storage pool = news.pools[poolId];
        pool.creator = msg.sender;
        pool.reasoning = _reasoning;
        pool.evidenceLinks = _evidenceLinks;
        pool.imageUrl = _imageUrl;
        pool.imageCaption = _imageCaption;
        pool.position = _position;
        pool.creatorStake = _creatorStake;
        pool.createdAt = block.timestamp;

        // Track pool creator
        userPoolNewsIds[msg.sender].push(newsId);
        userPoolIds[msg.sender].push(poolId);

        // Transfer creator stake to staking pool
        require(
            stakingToken.transferFrom(msg.sender, address(stakingPool), _creatorStake),
            "Stake transfer failed"
        );

        // Auto-stake creator's initial stake (creator agrees with own pool)
        // Convert Position enum to bool for staking pool compatibility
        bool positionBool = (_position == Position.YES);
        stakingPool.stake(newsId, poolId, msg.sender, _creatorStake, positionBool, positionBool);

        // Update pool totals - FIXED: Creator stake follows pool position
        pool.totalStaked = _creatorStake;
        if (positionBool) {
            // Pool YES - creator agrees with own position (agreeStakes)
            pool.agreeStakes = _creatorStake;
        } else {
            // Pool NO - creator agrees with own position (disagreeStakes)
            pool.disagreeStakes = _creatorStake;
        }
        news.totalStaked += _creatorStake;

        emit PoolCreated(newsId, poolId, msg.sender, _reasoning, _position, _creatorStake);
    }

    function stake(uint256 newsId, uint256 poolId, uint256 amount, bool userPosition)
        external
        validNews(newsId)
        onlyBeforeResolve(newsId)
        nonReentrant
    {
        require(amount > 0, "Amount must be greater than 0");

        // Get minimum stake amount from governance
        (uint256 minStake,,,,) = getGovernanceParameters();
        require(amount >= minStake, "Stake below minimum");

        News storage news = newsItems[newsId];
        require(poolId < news.totalPools, "Invalid pool ID");

        Pool storage pool = news.pools[poolId];

        // Transfer tokens to staking pool
        require(stakingToken.transferFrom(msg.sender, address(stakingPool), amount), "Transfer failed");

        // Convert Position enum to bool for StakingPool compatibility
        bool poolPositionBool = (pool.position == Position.YES);

        // FIXED: Send correct userPosition to staking pool
        stakingPool.stake(newsId, poolId, msg.sender, amount, poolPositionBool, userPosition);

        // Update pool totals - FIXED: Compare userPosition with poolPosition
        pool.totalStaked += amount;
        if (userPosition == poolPositionBool) {
            // User agrees with pool creator's position
            pool.agreeStakes += amount;
        } else {
            // User disagrees with pool creator's position
            pool.disagreeStakes += amount;
        }
        news.totalStaked += amount;

        emit Staked(newsId, poolId, msg.sender, amount, poolPositionBool);
    }

    function resolveNews(
        uint256 newsId,
        Outcome outcome,
        string memory resolutionSource,
        string memory resolutionNotes
    ) external onlyOwner validNews(newsId) {
        News storage news = newsItems[newsId];
        require(news.status == NewsStatus.Active, "Already resolved");
        require(block.timestamp >= news.resolveTime, "Too early to resolve");
        require(outcome != Outcome.None, "Invalid outcome");

        news.status = NewsStatus.Resolved;
        news.outcome = outcome;
        news.resolvedAt = block.timestamp;
        news.resolvedBy = msg.sender;
        news.resolutionSource = resolutionSource;
        news.resolutionNotes = resolutionNotes;

        // Resolve all pools, update reputations, and AUTO-DISTRIBUTE rewards
        _resolvePoolsAndDistributeRewards(newsId, outcome);

        emit Resolved(newsId, uint8(outcome), msg.sender);
    }

    function emergencyResolve(
        uint256 newsId,
        Outcome outcome,
        string memory resolutionSource,
        string memory resolutionNotes
    ) external onlyOwner validNews(newsId) {
        News storage news = newsItems[newsId];
        require(news.status == NewsStatus.Active, "Already resolved");
        require(outcome != Outcome.None, "Invalid outcome");

        news.status = NewsStatus.Resolved;
        news.outcome = outcome;
        news.resolvedAt = block.timestamp;
        news.resolvedBy = msg.sender;
        news.resolutionSource = resolutionSource;
        news.resolutionNotes = resolutionNotes;
        news.emergencyResolve = true;

        // Resolve all pools, update reputations, and AUTO-DISTRIBUTE rewards
        _resolvePoolsAndDistributeRewards(newsId, outcome);

        emit EmergencyResolved(newsId, uint8(outcome), msg.sender);
        emit Resolved(newsId, uint8(outcome), msg.sender);
    }

    function _resolvePoolsAndDistributeRewards(uint256 newsId, Outcome outcome) internal {
        News storage news = newsItems[newsId];

        // Iterate through all pools
        for (uint256 i = 0; i < news.totalPools; i++) {
            Pool storage pool = news.pools[i];

            pool.isResolved = true;

            // Check if pool position matches news outcome
            bool poolCorrect = (pool.position == Position.YES && outcome == Outcome.YES) ||
                              (pool.position == Position.NO && outcome == Outcome.NO);
            pool.isCorrect = poolCorrect;

            // Record pool result with total stake for reputation system
            reputationNFT.recordPoolWithStake(
                pool.creator,
                poolCorrect,
                pool.totalStaked
            );

            // AUTO-DISTRIBUTE REWARDS
            if (pool.totalStaked > 0) {
                _distributePoolRewards(newsId, i, poolCorrect);
            }
        }
    }

    function _distributePoolRewards(
        uint256 newsId,
        uint256 poolId,
        bool poolCorrect
    ) internal {
        Pool storage pool = newsItems[newsId].pools[poolId];

        uint256 totalPool = pool.totalStaked;
        uint256 protocolFee = (totalPool * 200) / 10000; // 2%
        uint256 remaining = totalPool - protocolFee;

        // Transfer protocol fee to governance fee recipient
        (, , , , address feeRecipient) = getGovernanceParameters();
        stakingPool.transferReward(feeRecipient, protocolFee);

        if (poolCorrect) {
            // Pool creator was CORRECT

            // 1. Creator gets 20% of remaining pool
            uint256 creatorReward = (remaining * 2000) / 10000; // 20%
            stakingPool.transferReward(pool.creator, creatorReward);
            emit CreatorRewardDistributed(newsId, poolId, pool.creator, creatorReward);

            // 2. Winning stakers (agree) get 80% of remaining pool
            uint256 stakersPool = remaining - creatorReward; // 80%
            _distributeToStakers(newsId, poolId, stakersPool, true); // true = agree winners

        } else {
            // Pool creator was WRONG

            // 1. Creator gets NOTHING

            // 2. ALL remaining pool (98%) goes to disagree stakers
            _distributeToStakers(newsId, poolId, remaining, false); // false = disagree winners
        }
    }

    function _distributeToStakers(
        uint256 newsId,
        uint256 poolId,
        uint256 rewardPool,
        bool agreeWins
    ) internal {
        Pool storage pool = newsItems[newsId].pools[poolId];

        // Get list of stakers for this pool
        address[] memory stakers = stakingPool.getPoolStakers(newsId, poolId);

        // Calculate total winning stakes (EXCLUDE creator stake from agree pool)
        uint256 winningTotal = agreeWins
            ? pool.agreeStakes - pool.creatorStake  // Agree wins, exclude creator
            : pool.disagreeStakes;                   // Disagree wins

        if (winningTotal == 0) return; // No winning stakers

        // Distribute to each winning staker
        for (uint256 i = 0; i < stakers.length; i++) {
            address staker = stakers[i];

            // Skip creator (creator already got 20% if pool correct)
            if (staker == pool.creator) continue;

            // Get staker's position and amount
            (uint256 stakeAmount, bool position, , bool isWithdrawn) =
                stakingPool.getUserStake(newsId, poolId, staker);

            if (isWithdrawn || stakeAmount == 0) continue;

            // Check if this staker is a winner
            bool poolPositionBool = (pool.position == Position.YES);
            bool stakerWon = (position == poolPositionBool && agreeWins) ||
                            (position != poolPositionBool && !agreeWins);

            if (stakerWon) {
                // Calculate proportional reward
                uint256 stakerReward = (rewardPool * stakeAmount) / winningTotal;

                // Mark as claimed and transfer
                stakingPool.markStakeAsDistributed(newsId, poolId, staker);
                stakingPool.transferReward(staker, stakerReward);

                emit StakerRewardDistributed(newsId, poolId, staker, stakerReward);
            }
        }
    }

    // New events
    event CreatorRewardDistributed(
        uint256 indexed newsId,
        uint256 indexed poolId,
        address indexed creator,
        uint256 amount
    );

    event StakerRewardDistributed(
        uint256 indexed newsId,
        uint256 indexed poolId,
        address indexed staker,
        uint256 amount
    );

    // View functions
    function getNewsCount() external view returns (uint256) {
        return newsCount;
    }

    function getPoolCount(uint256 newsId) external view validNews(newsId) returns (uint256) {
        return newsItems[newsId].totalPools;
    }

    function getNewsInfo(uint256 newsId)
        external
        view
        validNews(newsId)
        returns (
            address creator,
            string memory title,
            string memory description,
            string memory category,
            string memory resolutionCriteria,
            uint256 createdAt,
            uint256 resolveTime,
            NewsStatus status,
            Outcome outcome,
            uint256 totalPools,
            uint256 totalStaked
        )
    {
        News storage news = newsItems[newsId];
        return (
            news.creator,
            news.title,
            news.description,
            news.category,
            news.resolutionCriteria,
            news.createdAt,
            news.resolveTime,
            news.status,
            news.outcome,
            news.totalPools,
            news.totalStaked
        );
    }

    function getNewsResolutionInfo(uint256 newsId)
        external
        view
        validNews(newsId)
        returns (
            uint256 resolvedAt,
            address resolvedBy,
            string memory resolutionSource,
            string memory resolutionNotes
        )
    {
        News storage news = newsItems[newsId];
        return (news.resolvedAt, news.resolvedBy, news.resolutionSource, news.resolutionNotes);
    }

    function getPoolInfo(uint256 newsId, uint256 poolId)
        external
        view
        validNews(newsId)
        returns (
            address creator,
            string memory reasoning,
            string[] memory evidenceLinks,
            string memory imageUrl,
            string memory imageCaption,
            Position position,
            uint256 creatorStake,
            uint256 totalStaked,
            uint256 agreeStakes,
            uint256 disagreeStakes,
            uint256 createdAt,
            bool isResolved,
            bool isCorrect
        )
    {
        require(poolId < newsItems[newsId].totalPools, "Invalid pool ID");
        Pool storage pool = newsItems[newsId].pools[poolId];
        return (
            pool.creator,
            pool.reasoning,
            pool.evidenceLinks,
            pool.imageUrl,
            pool.imageCaption,
            pool.position,
            pool.creatorStake,
            pool.totalStaked,
            pool.agreeStakes,
            pool.disagreeStakes,
            pool.createdAt,
            pool.isResolved,
            pool.isCorrect
        );
    }

    // CRITICAL: Frontend needs this for news detail page!
    function getPoolsByNewsId(uint256 newsId, uint256 offset, uint256 limit)
        external
        view
        validNews(newsId)
        returns (uint256[] memory poolIds, uint256 total)
    {
        News storage news = newsItems[newsId];
        total = news.totalPools;

        uint256 end = offset + limit > total ? total : offset + limit;
        uint256 length = end > offset ? end - offset : 0;

        poolIds = new uint256[](length);
        for (uint256 i = 0; i < length; i++) {
            poolIds[i] = offset + i;
        }

        return (poolIds, total);
    }

    // Get pools created by a user
    function getPoolsByCreator(address creator) external view returns (uint256[] memory newsIds, uint256[] memory poolIds) {
        return (userPoolNewsIds[creator], userPoolIds[creator]);
    }

    // Get news created by a user
    function getNewsByCreator(address creator) external view returns (uint256[] memory) {
        return userNewsIds[creator];
    }

    // Get user's stake on a pool (delegates to StakingPool)
    function getUserStake(uint256 newsId, uint256 poolId, address user)
        external
        view
        returns (uint256 amount, bool position, uint256 timestamp, bool isWithdrawn)
    {
        return stakingPool.getUserStake(newsId, poolId, user);
    }

    // Get pool outcome for reward calculation
    function getPoolOutcome(uint256 newsId, uint256 poolId)
        external
        view
        validNews(newsId)
        returns (bool isResolved, bool isCorrect, Position position)
    {
        require(poolId < newsItems[newsId].totalPools, "Invalid pool ID");
        Pool storage pool = newsItems[newsId].pools[poolId];
        return (pool.isResolved, pool.isCorrect, pool.position);
    }

    function getGovernanceParameters()
        public
        view
        returns (
            uint256 minStakeAmount,
            uint256 maxNewsDuration,
            uint256 minNewsDuration,
            uint256 protocolFee,
            address feeRecipient
        )
    {
        return (
            governance.minStakeAmount(),
            governance.maxNewsDuration(),
            governance.minNewsDuration(),
            governance.protocolFee(),
            governance.feeRecipient()
        );
    }

    // Fallback function to receive ETH
    receive() external payable {}

    // Emergency withdraw any ERC20 tokens (onlyOwner)
    function withdrawToken(address token, uint256 amount) external onlyOwner {
        bool success = IERC20(token).transfer(owner(), amount);
        require(success, "Transfer failed");
    }

    // Emergency withdraw ETH (onlyOwner)
    function withdrawETH() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
