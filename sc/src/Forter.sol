// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IForter.sol";
import "./ReputationNFT.sol";
import "./StakingPool.sol";
import "./Governance.sol";

contract Forter is IForter, Ownable2Step, ReentrancyGuard {
    // Contract dependencies
    ReputationNFT public reputationNFT;
    StakingPool public stakingPool;
    ForterGovernance public governance;
    IERC20 public stakingToken;

    // News and Pools
    struct News {
        address creator;
        string title;
        string description;
        string category;
        string resolutionCriteria;
        uint256 createdAt;
        uint256 resolveTime;
        bool isResolved;
        bool outcome;
        uint256 totalPools;
        uint256 totalStaked;
        // Resolution metadata
        uint256 resolvedAt;
        address resolvedBy;
        string resolutionSource;
        string resolutionNotes;
        mapping(uint256 => Pool) pools;
    }

    struct Pool {
        address creator;
        string reasoning;
        string[] evidenceLinks;
        string imageUrl;
        string imageCaption;
        bool position; // true for YES, false for NO
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
        bool position,
        uint256 creatorStake
    );

    event Staked(
        uint256 indexed newsId,
        uint256 indexed poolId,
        address indexed user,
        uint256 amount,
        bool position
    );

    event Resolved(uint256 indexed newsId, bool outcome, address resolvedBy);

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
        require(!newsItems[newsId].isResolved, "News already resolved");
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
    ) external override {
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
        news.isResolved = false;

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
        bool _position,
        uint256 _creatorStake
    ) external override validNews(newsId) onlyBeforeResolve(newsId) nonReentrant {
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
        stakingPool.stake(newsId, poolId, msg.sender, _creatorStake, _position, _position);

        // Update pool totals
        pool.totalStaked = _creatorStake;
        pool.agreeStakes = _creatorStake;
        news.totalStaked += _creatorStake;

        emit PoolCreated(newsId, poolId, msg.sender, _reasoning, _position, _creatorStake);
    }

    function stake(uint256 newsId, uint256 poolId, uint256 amount, bool userPosition)
        external
        override
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

        // Delegate to staking pool
        stakingPool.stake(newsId, poolId, msg.sender, amount, pool.position, userPosition);

        // Update pool totals
        pool.totalStaked += amount;
        if (userPosition == pool.position) {
            pool.agreeStakes += amount;
        } else {
            pool.disagreeStakes += amount;
        }
        news.totalStaked += amount;

        emit Staked(newsId, poolId, msg.sender, amount, userPosition);
    }

    function resolveNews(
        uint256 newsId,
        bool outcome,
        string memory resolutionSource,
        string memory resolutionNotes
    ) external override onlyOwner validNews(newsId) {
        News storage news = newsItems[newsId];
        require(!news.isResolved, "Already resolved");
        require(block.timestamp >= news.resolveTime, "Too early to resolve");

        news.isResolved = true;
        news.outcome = outcome;
        news.resolvedAt = block.timestamp;
        news.resolvedBy = msg.sender;
        news.resolutionSource = resolutionSource;
        news.resolutionNotes = resolutionNotes;

        // Resolve all pools and update reputations
        _resolvePoolsAndUpdateReputations(newsId, outcome);

        emit Resolved(newsId, outcome, msg.sender);
    }

    function _resolvePoolsAndUpdateReputations(uint256 newsId, bool outcome) internal {
        News storage news = newsItems[newsId];

        // Iterate through all pools and update reputations
        for (uint256 i = 0; i < news.totalPools; i++) {
            Pool storage pool = news.pools[i];

            pool.isResolved = true;
            pool.isCorrect = (pool.position == outcome);

            // Update creator's reputation
            reputationNFT.recordPrediction(pool.creator, pool.isCorrect);

            if (pool.isCorrect) {
                // Reward reputation points based on stake amount
                uint256 reputationPoints = pool.creatorStake / 1e18; // 1 point per token
                if (reputationPoints > 0) {
                    reputationNFT.increaseReputation(pool.creator, reputationPoints);
                }
            }
        }
    }

    // View functions
    function getNewsCount() external view override returns (uint256) {
        return newsCount;
    }

    function getPoolCount(uint256 newsId) external view override validNews(newsId) returns (uint256) {
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
            bool isResolved,
            bool outcome,
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
            news.isResolved,
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
            bool position,
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
        returns (bool isResolved, bool isCorrect, bool position)
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
        IERC20(token).transfer(owner(), amount);
    }

    // Emergency withdraw ETH (onlyOwner)
    function withdrawETH() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
