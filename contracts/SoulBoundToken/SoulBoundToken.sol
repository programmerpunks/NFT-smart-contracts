// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SoulBoundToken is ERC721, ERC721URIStorage, Ownable {
    event Attest(address indexed to, uint256 indexed tokenId);
    event Revoke(address indexed to, uint256 indexed tokenId);
    event Recoverd(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );

    struct OperatorDetails {
        address operator;
        bool approvals;
    }
    struct RecoveryApproval {
        address issuedTo;
        OperatorDetails[3] Operators;
        bool ownerApproval;
    }

    mapping(uint256 => RecoveryApproval) RecoveryApprovalData;
    uint256 noOfApprovalRequired;

    constructor() ERC721("SoulBoundToken", "SBT") {}

    function safeMint(
        address to,
        uint256 tokenId,
        string memory uri,
        address[] memory recoveryAccounts
    ) public onlyOwner {
        require(
            recoveryAccounts.length == noOfApprovalRequired,
            "recoveryAccounts not equal to required number"
        );

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        // Setting up the memory recovery account for the given account
        RecoveryApprovalData[tokenId].issuedTo = to;
        for (uint256 i = 0; i <= noOfApprovalRequired; i++) {
            RecoveryApprovalData[tokenId].Operators[i] = OperatorDetails({
                operator: recoveryAccounts[i],
                approvals: false
            });
        }
        RecoveryApprovalData[tokenId].ownerApproval = false;
    }

    function validRecoveryAccounts(uint256 tokenId)
        internal
        view
        returns (uint256 id)
    {
        for (uint256 i = 0; i <= noOfApprovalRequired; i++) {
            if (
                RecoveryApprovalData[tokenId].Operators[i].operator ==
                msg.sender
            ) {
                return id;
            }
        }
        revert("Account Not Approved for this token");
    }

    function recoverAppeal(uint256 tokenId, bool approval) external {
        uint256 id = validRecoveryAccounts(tokenId);
        RecoveryApprovalData[tokenId].Operators[id].approvals = approval;
    }

    function recoverAppealOwner(uint256 tokenId, bool approval)
        external
        onlyOwner
    {
        RecoveryApprovalData[tokenId].ownerApproval = approval;
    }

    // Calling recovery account to gets the token when approval required are met
    function recoverSoulBound(uint256 tokenId) external onlyOwner {
        uint256 id = validRecoveryAccounts(tokenId);
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal virtual override {
        require(from == address(0) || to == address(0), "You cannot transfer");
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal virtual override {
        if (from == address(0)) {
            emit Attest(to, firstTokenId);
        } else if (to == address(0)) {
            emit Revoke(to, firstTokenId);
        } else if (from != address(0)) {
            emit Recoverd(from, to, firstTokenId);
        }
        super._afterTokenTransfer(from, to, firstTokenId, batchSize);
    }

    function burn(uint256 tokenId) external {
        require(
            msg.sender == ownerOf(tokenId),
            "Only token ownwer can burn this token."
        );
        _burn(tokenId);
    }
}
