// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IForter {
    // Core functions
    function createNews(
        string memory _title,
        string memory _description,
        string memory _category,
        string memory _resolutionCriteria,
        uint256 _resolveTime
    ) external;

    function createPool(
        uint256 newsId,
        string memory _reasoning,
        string[] memory _evidenceLinks,
        string memory _imageUrl,
        string memory _imageCaption,
        bool _position,
        uint256 _creatorStake
    ) external;

    function stake(uint256 newsId, uint256 poolId, uint256 amount, bool userPosition) external;

    function resolveNews(
        uint256 newsId,
        bool outcome,
        string memory resolutionSource,
        string memory resolutionNotes
    ) external;

    // View functions
    function getNewsCount() external view returns (uint256);

    function getPoolCount(uint256 newsId) external view returns (uint256);
}
