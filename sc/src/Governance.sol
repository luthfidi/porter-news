// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract ForterGovernance is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    Ownable2Step
{
    // Protocol parameters
    uint256 public minStakeAmount;
    uint256 public maxNewsDuration;
    uint256 public minNewsDuration;
    uint256 public protocolFee;
    address public feeRecipient;

    // Contract references
    address public stakingPool;
    address public reputationNFT;
    
    // Events
    event ParametersUpdated(
        uint256 minStakeAmount,
        uint256 maxNewsDuration,
        uint256 minNewsDuration,
        uint256 protocolFee,
        address feeRecipient
    );
    
    constructor(
        ERC20Votes _token,
        uint256 _minStakeAmount,
        uint256 _maxNewsDuration,
        uint256 _minNewsDuration,
        uint256 _protocolFee,
        address _feeRecipient
    )
        Governor("ForterGovernor")
        GovernorSettings(
            1, /* 1 block */
            45818, /* 1 week */
            100e18 /* 100 tokens */
        )
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4) // 4%
        Ownable(msg.sender)
    {
        _updateParameters(
            _minStakeAmount,
            _maxNewsDuration,
            _minNewsDuration,
            _protocolFee,
            _feeRecipient
        );
    }
    
    // Update protocol parameters (only callable through governance)
    function updateParameters(
        uint256 _minStakeAmount,
        uint256 _maxNewsDuration,
        uint256 _minNewsDuration,
        uint256 _protocolFee,
        address _feeRecipient
    ) external onlyGovernance {
        _updateParameters(
            _minStakeAmount,
            _maxNewsDuration,
            _minNewsDuration,
            _protocolFee,
            _feeRecipient
        );
    }
    
    function _updateParameters(
        uint256 _minStakeAmount,
        uint256 _maxNewsDuration,
        uint256 _minNewsDuration,
        uint256 _protocolFee,
        address _feeRecipient
    ) internal {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        require(_maxNewsDuration > _minNewsDuration, "Invalid duration range");
        require(_protocolFee <= 1000, "Fee too high"); // Max 10%
        
        minStakeAmount = _minStakeAmount;
        maxNewsDuration = _maxNewsDuration;
        minNewsDuration = _minNewsDuration;
        protocolFee = _protocolFee;
        feeRecipient = _feeRecipient;
        
        emit ParametersUpdated(
            _minStakeAmount,
            _maxNewsDuration,
            _minNewsDuration,
            _protocolFee,
            _feeRecipient
        );
    }
    
    // Set contract dependencies (only callable once, by owner during initialization)
    function setDependencies(
        address _stakingPool,
        address _reputationNFT
    ) external onlyOwner {
        require(stakingPool == address(0) && reputationNFT == address(0), "Already set");
        require(_stakingPool != address(0) && _reputationNFT != address(0), "Invalid address");

        stakingPool = _stakingPool;
        reputationNFT = _reputationNFT;
    }
    
    // The following functions are overrides required by Solidity
    function votingDelay() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingDelay();
    }

    function votingPeriod() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(Governor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function proposalThreshold() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.proposalThreshold();
    }
}
