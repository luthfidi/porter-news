// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Import Forter contract to use its enums
// Note: Interface cannot redeclare enums from implementation
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
        uint8 _position, // Note: Interface uses uint8, implementation uses Position enum
        uint256 _creatorStake
    ) external;

    function stake(uint256 newsId, uint256 poolId, uint256 amount, bool userPosition) external;

    function resolveNews(
        uint256 newsId,
        uint8 outcome,
        string memory resolutionSource,
        string memory resolutionNotes
    ) external;

    function emergencyResolve(
        uint256 newsId,
        uint8 outcome,
        string memory resolutionSource,
        string memory resolutionNotes
    ) external;

    // View functions
    function getNewsCount() external view returns (uint256);

    function getPoolCount(uint256 newsId) external view returns (uint256);
}
