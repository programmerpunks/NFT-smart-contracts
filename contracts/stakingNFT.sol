// NFT Staking Contract
// User can Stake ERC721 tokens and earn ERC20 tokens
// Set reward Rate
// Owner can increase rewardable tokens in contract
// Use interfaces in your staking contract
// User should be able to earn tokens for every 24 hours
// but Rewards are set to 0 if unstaked before 7 days
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
pragma solidity ^0.8.17;

// import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
contract StakingNFTs is Ownable, ReentrancyGuard {
    /* -------------------------------------------------------------------------- */
    /*                                   EVENTS                                   */
    /* -------------------------------------------------------------------------- */
    event Staked(address indexed owner, uint256 Timestamp, uint256 tokenID);
    event UnStaked(
        address indexed receiver,
        uint256 Timestamp,
        uint256 tokenID
    );
    event ClaimedReward(
        uint256 tokenID,
        address indexed receiver,
        uint256 amount
    );
    /* -------------------------------------------------------------------------- */
    /*                               STATE VARIABLES                              */
    /* -------------------------------------------------------------------------- */

    // Interfaces for ERC20 rewardToken and ERC721 nftcollection
    IERC20 public immutable rewardTokens;
    IERC721 public immutable nftCollection;

    // Reward Tokens are cumulated every day.
    uint256 rewardPerToken = 10 ether;

    // Structure to Store Information Related to a User Staking Their thier NFT
    struct StakeInfo {
        // uint256 tokenID;
        uint256 startTime;
        uint256 claimedRewards;
        address owner;
    }

    // Mapping to store information related to a User Staking their token

    // tokenId -> Stake Information
    mapping(uint256 => StakeInfo) stakeInfos;
    // tokenId -> unclaimed Rewards
    mapping(uint256 => uint256) unclaimedReward;

    constructor(IERC721 _nftCollection, IERC20 _rewardsTokens) {
        require(
            address(_nftCollection) != address(0) &&
                address(_rewardsTokens) != address(0),
            "Token Address cannot be address 0"
        );
        nftCollection = _nftCollection;
        rewardTokens = _rewardsTokens;
    }

    function StakeTokens(uint256 _tokenId) external returns (bool) {
        require(
            nftCollection.ownerOf(_tokenId) == msg.sender,
            "caller is not the owner of this NFT"
        );
        // startTime is set to current time when Token is staked
        require(
            stakeInfos[_tokenId].startTime == 0,
            "You have already staked this token"
        );
        require(
            nftCollection.getApproved(_tokenId) == address(this),
            "Approval for this NFT token is denied"
        );

        // transfer Nft Token to this Contract
        nftCollection.safeTransferFrom(msg.sender, address(this), _tokenId);

        stakeInfos[_tokenId] = StakeInfo({
            startTime: block.timestamp,
            claimedRewards: 0,
            owner: msg.sender
        });

        emit Staked(msg.sender, block.timestamp, _tokenId);
        return true;
    }

    function unStakeTokens(uint256 _tokenId)
        external
        returns (bool isUnstaked)
    {
        require(
            stakeInfos[_tokenId].owner == msg.sender,
            "caller has not the staked this NFT"
        );
        StakeInfo memory tokenData = stakeInfos[_tokenId];
        require(tokenData.startTime >= 0, "You have not staked this token");

        uint256 dayPassed = (block.timestamp - tokenData.startTime) / 86400;

        if (dayPassed >= 7) {
            uint256 currentRewardCreated = (dayPassed * rewardPerToken) -
                // Subtract Already claimed Reward
                tokenData.claimedRewards;
            // Setting unclaimed Reward
            if (currentRewardCreated > 0) {
                unclaimedReward[_tokenId] += currentRewardCreated;
            }
        }

        // Returning the nft from StakingToken back to its original owner
        nftCollection.safeTransferFrom(address(this), msg.sender, _tokenId);
        delete stakeInfos[_tokenId];

        emit UnStaked(msg.sender, block.timestamp, _tokenId);
        return true;
    }

    function ClaimDailyRewards(uint256 _tokenId)
        external
        returns (bool Claimed)
    {
        require(
            stakeInfos[_tokenId].owner == msg.sender,
            "caller has not the staked this NFT"
        );

        StakeInfo memory tokenData = stakeInfos[_tokenId];
        require(tokenData.startTime >= 0, "You have not staked this token");

        uint256 dayPassed = (block.timestamp - tokenData.startTime) / 86400;

        // require(
        //     dayPassed >= 7,
        //     "At least 7 days should be passed to claim the reward"
        // );
        // require(
        //             rewardTokens.balanceOf(address(this)) >= currentRewardCreated,
        //             "Reward Tokens Not Available Right Now"
        //         );
        if (dayPassed >= 7) {
            uint256 currentRewardCreated = (dayPassed * rewardPerToken) -
                // Subtract Already claimed Reward
                tokenData.claimedRewards;
            stakeInfos[_tokenId].claimedRewards += currentRewardCreated;
            require(
                rewardTokens.balanceOf(address(this)) >= currentRewardCreated,
                "Reward Tokens Not Available Right Now"
            );
            rewardTokens.transfer(
                msg.sender,
                currentRewardCreated +
                    // add unclaimed previous reward
                    unclaimedReward[_tokenId]
            );

            emit ClaimedReward(
                _tokenId,
                msg.sender,
                currentRewardCreated + unclaimedReward[_tokenId]
            );
            delete unclaimedReward[_tokenId];
        } else {
            require(
                unclaimedReward[_tokenId] > 0,
                "No New Reward created or Unclaimed Reward is there to be claimed"
            );
            rewardTokens.transfer(msg.sender, unclaimedReward[_tokenId]);
        }
        return true;
    }

    function earningInfo()
        public
        view
        returns (
            uint256 StartTime,
            uint256 tokenIdStaked,
            uint256 amountClaimed,
            uint256 RewardCreated,
            uint256 dayPassed
        )
    {}
}
