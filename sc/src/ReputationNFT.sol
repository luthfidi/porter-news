// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ReputationNFT is ERC721, Ownable {
    // Token ID counter
    uint256 private _tokenIdCounter;

    // Reputation levels with corresponding token URIs
    struct ReputationTier {
        string name;
        string tokenURI;
        uint256 minScore;
    }

    // User reputation data
    struct UserReputation {
        uint256 reputationPoints; // Point-based score with stake weight
        uint256 lastUpdated;
        uint256 totalPredictions;
        uint256 correctPredictions;
        uint256 totalStakeInPools; // Track total stake across all pools
    }

    // Pool records for stake weight calculation
    struct PoolRecord {
        bool isCorrect;
        uint256 poolTotalStake;
        uint256 timestamp;
    }

    // Mappings
    mapping(address => UserReputation) public userReputations;
    mapping(address => PoolRecord[]) public userPoolHistory; // Track pool history for each user
    mapping(uint256 => ReputationTier) public reputationTiers;
    mapping(address => uint256) public userToTokenId;
    mapping(uint256 => address) public tokenIdToUser;

    // Events
    event ReputationUpdated(address indexed user, uint256 newScore, uint256 tokenId);
    event TierAdded(uint256 tierId, string name, uint256 minScore);
    event ReputationIncreased(address indexed user, uint256 points, uint256 newScore);
    event PredictionRecorded(address indexed user, bool correct);

    constructor() ERC721("ForterReputation", "FRTREP") Ownable(msg.sender) {
        // Initialize with point-based tiers (with stake weight multipliers)
        _addTier(0, "Novice", 0, "ipfs://QmNovice/metadata.json");
        _addTier(1, "Analyst", 200, "ipfs://QmAnalyst/metadata.json");
        _addTier(2, "Expert", 500, "ipfs://QmExpert/metadata.json");
        _addTier(3, "Master", 1000, "ipfs://QmMaster/metadata.json");
        _addTier(4, "Legend", 5000, "ipfs://QmLegend/metadata.json");
    }

    // Internal function to add a tier
    function _addTier(
        uint256 tierId,
        string memory name,
        uint256 minScore,
        string memory uri
    ) internal {
        reputationTiers[tierId] = ReputationTier({
            name: name,
            tokenURI: uri,
            minScore: minScore
        });

        emit TierAdded(tierId, name, minScore);
    }

    // Add a new tier (only owner)
    function addTier(
        uint256 tierId,
        string memory name,
        uint256 minScore,
        string memory uri
    ) external onlyOwner {
        _addTier(tierId, name, minScore, uri);
    }

    // Update tier URI (only owner)
    function updateTierURI(uint256 tierId, string memory newURI) external onlyOwner {
        require(bytes(reputationTiers[tierId].name).length > 0, "Tier does not exist");
        reputationTiers[tierId].tokenURI = newURI;
    }

    // DEPRECATED: Use recordPoolWithStake instead
    // Kept for backwards compatibility
    function increaseReputation(address user, uint256 points) external onlyOwner {
        UserReputation storage rep = userReputations[user];
        rep.reputationPoints += points;
        rep.lastUpdated = block.timestamp;

        // Mint NFT if first time
        if (userToTokenId[user] == 0) {
            _mintNFT(user);
        }

        emit ReputationIncreased(user, points, rep.reputationPoints);
        emit ReputationUpdated(user, rep.reputationPoints, userToTokenId[user]);
    }

    // Record pool result with stake weight (called by Forter contract on resolution)
    function recordPoolWithStake(
        address user,
        bool correct,
        uint256 poolTotalStake
    ) external onlyOwner {
        UserReputation storage rep = userReputations[user];

        // Record prediction
        rep.totalPredictions++;
        if (correct) {
            rep.correctPredictions++;
        }

        // Add to pool history
        userPoolHistory[user].push(PoolRecord({
            isCorrect: correct,
            poolTotalStake: poolTotalStake,
            timestamp: block.timestamp
        }));

        // Calculate and update reputation points
        _updateReputationPoints(user);

        rep.lastUpdated = block.timestamp;

        // Mint NFT if first pool
        if (userToTokenId[user] == 0) {
            _mintNFT(user);
        }

        emit PredictionRecorded(user, correct);
    }

    // Internal function to calculate reputation points with stake weight
    function _updateReputationPoints(address user) internal {
        UserReputation storage rep = userReputations[user];
        PoolRecord[] memory pools = userPoolHistory[user];

        int256 totalPoints = 0;

        for (uint256 i = 0; i < pools.length; i++) {
            // Base points: +100 if correct, -30 if wrong
            int256 basePoints = pools[i].isCorrect ? int256(100) : int256(-30);

            // Stake multiplier (1.0x to 3.0x based on pool total stake)
            uint256 stakeMultiplier = _getStakeMultiplier(pools[i].poolTotalStake);

            // Apply multiplier (stakeMultiplier is in basis points: 100 = 1.0x)
            // forge-lint: disable-next-line(unsafe-typecast)
            totalPoints += (basePoints * int256(stakeMultiplier)) / 100;
        }

        // Prevent negative total
        // forge-lint: disable-next-line(unsafe-typecast)
        rep.reputationPoints = totalPoints > 0 ? uint256(totalPoints) : 0;
    }

    // Get stake weight multiplier based on pool size
    function _getStakeMultiplier(uint256 poolTotalStake) internal pure returns (uint256) {
        // Assuming 6 decimals for USDC
        uint256 stakeInUSDC = poolTotalStake / 1e6;

        if (stakeInUSDC >= 5000) return 300; // 3.0x for $5000+
        if (stakeInUSDC >= 1000) return 250; // 2.5x for $1000-$4999
        if (stakeInUSDC >= 500) return 200;  // 2.0x for $500-$999
        if (stakeInUSDC >= 100) return 150;  // 1.5x for $100-$499
        return 100; // 1.0x for <$100
    }

    // Mint NFT to user
    function _mintNFT(address user) internal {
        require(userToTokenId[user] == 0, "User already has NFT");

        uint256 tokenId = _tokenIdCounter++;
        _safeMint(user, tokenId);

        userToTokenId[user] = tokenId;
        tokenIdToUser[tokenId] = user;
    }

    // Get user reputation data
    function getUserReputation(address user)
        external
        view
        returns (
            uint256 reputationPoints,
            uint256 lastUpdated,
            uint256 totalPredictions,
            uint256 correctPredictions,
            uint256 tier,
            string memory tierName,
            uint256 accuracy
        )
    {
        UserReputation memory rep = userReputations[user];
        uint256 userTier = _calculateTier(rep.reputationPoints, rep.totalPredictions);
        string memory name = reputationTiers[userTier].name;

        uint256 acc = rep.totalPredictions > 0
            ? (rep.correctPredictions * 100) / rep.totalPredictions
            : 0;

        return (
            rep.reputationPoints,
            rep.lastUpdated,
            rep.totalPredictions,
            rep.correctPredictions,
            userTier,
            name,
            acc
        );
    }

    // Calculate user's tier based on points and minimum pool requirements
    function _calculateTier(uint256 points, uint256 totalPools) internal view returns (uint256) {
        // Tier 0: Novice (no requirements)
        if (points < reputationTiers[1].minScore || totalPools == 0) return 0;

        // Tier 1: Analyst (200+ points)
        if (points < reputationTiers[2].minScore) return 1;

        // Tier 2: Expert (500+ points, min 5 pools)
        if (points < reputationTiers[3].minScore) {
            return totalPools >= 5 ? 2 : 1;
        }

        // Tier 3: Master (1000+ points, min 10 pools)
        if (points < reputationTiers[4].minScore) {
            return totalPools >= 10 ? 3 : 2;
        }

        // Tier 4: Legend (5000+ points, min 20 pools)
        return totalPools >= 20 ? 4 : 3;
    }

    // Get user's current tier
    function getUserTier(address user) external view returns (uint256, string memory) {
        UserReputation memory rep = userReputations[user];
        uint256 tier = _calculateTier(rep.reputationPoints, rep.totalPredictions);
        return (tier, reputationTiers[tier].name);
    }

    // Override tokenURI to return dynamic metadata based on tier
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        address user = tokenIdToUser[tokenId];
        UserReputation memory rep = userReputations[user];
        uint256 tier = _calculateTier(rep.reputationPoints, rep.totalPredictions);

        return reputationTiers[tier].tokenURI;
    }

    // Override transfer functions to make token soulbound (non-transferable)
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);

        // Allow minting (from == address(0))
        // Block transfers (from != address(0) && to != address(0))
        if (from != address(0) && to != address(0)) {
            revert("Reputation NFT is soulbound and cannot be transferred");
        }

        return super._update(to, tokenId, auth);
    }

    // Get tier info
    function getTierInfo(uint256 tierId)
        external
        view
        returns (
            string memory name,
            string memory uri,
            uint256 minScore
        )
    {
        ReputationTier memory tier = reputationTiers[tierId];
        return (tier.name, tier.tokenURI, tier.minScore);
    }

    // Check if user has NFT
    function hasNFT(address user) external view returns (bool) {
        return userToTokenId[user] != 0;
    }

    // Get total minted NFTs
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }
}
