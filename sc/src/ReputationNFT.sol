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
        uint256 score;
        uint256 lastUpdated;
        uint256 totalPredictions;
        uint256 correctPredictions;
    }

    // Mappings
    mapping(address => UserReputation) public userReputations;
    mapping(uint256 => ReputationTier) public reputationTiers;
    mapping(address => uint256) public userToTokenId;
    mapping(uint256 => address) public tokenIdToUser;

    // Events
    event ReputationUpdated(address indexed user, uint256 newScore, uint256 tokenId);
    event TierAdded(uint256 tierId, string name, uint256 minScore);
    event ReputationIncreased(address indexed user, uint256 points, uint256 newScore);
    event PredictionRecorded(address indexed user, bool correct);

    constructor() ERC721("ForterReputation", "FRTREP") Ownable(msg.sender) {
        // Initialize with default tiers
        _addTier(0, "Novice", 0, "ipfs://QmNovice/metadata.json");
        _addTier(1, "Analyst", 100, "ipfs://QmAnalyst/metadata.json");
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

    // Increase user reputation (called by Forter contract)
    function increaseReputation(address user, uint256 points) external onlyOwner {
        UserReputation storage rep = userReputations[user];
        rep.score += points;
        rep.lastUpdated = block.timestamp;

        // Mint NFT if first time
        if (userToTokenId[user] == 0) {
            _mintNFT(user);
        }

        emit ReputationIncreased(user, points, rep.score);
        emit ReputationUpdated(user, rep.score, userToTokenId[user]);
    }

    // Record a prediction (called by Forter contract on resolution)
    function recordPrediction(address user, bool correct) external onlyOwner {
        UserReputation storage rep = userReputations[user];
        rep.totalPredictions++;

        if (correct) {
            rep.correctPredictions++;
        }

        rep.lastUpdated = block.timestamp;

        emit PredictionRecorded(user, correct);
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
            uint256 score,
            uint256 lastUpdated,
            uint256 totalPredictions,
            uint256 correctPredictions,
            uint256 tier,
            string memory tierName,
            uint256 accuracy
        )
    {
        UserReputation memory rep = userReputations[user];
        uint256 userTier = _calculateTier(rep.score);
        string memory name = reputationTiers[userTier].name;

        uint256 acc = rep.totalPredictions > 0
            ? (rep.correctPredictions * 100) / rep.totalPredictions
            : 0;

        return (
            rep.score,
            rep.lastUpdated,
            rep.totalPredictions,
            rep.correctPredictions,
            userTier,
            name,
            acc
        );
    }

    // Calculate user's tier based on score
    function _calculateTier(uint256 score) internal view returns (uint256) {
        // Start from highest tier and work down
        if (score >= reputationTiers[4].minScore) return 4; // Legend
        if (score >= reputationTiers[3].minScore) return 3; // Master
        if (score >= reputationTiers[2].minScore) return 2; // Expert
        if (score >= reputationTiers[1].minScore) return 1; // Analyst
        return 0; // Novice
    }

    // Get user's current tier
    function getUserTier(address user) external view returns (uint256, string memory) {
        uint256 score = userReputations[user].score;
        uint256 tier = _calculateTier(score);
        return (tier, reputationTiers[tier].name);
    }

    // Override tokenURI to return dynamic metadata based on tier
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        address user = tokenIdToUser[tokenId];
        uint256 score = userReputations[user].score;
        uint256 tier = _calculateTier(score);

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
