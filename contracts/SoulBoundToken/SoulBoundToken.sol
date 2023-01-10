// edited _transfer & safeTransferFrom function of ERC721.sol openzeppelins implementation & removed the check of Ownership

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./lib/ERC721.sol";
import "./lib/ERC721URIStorage.sol";
import "./lib/Ownable.sol";

contract SoulBoundToken is ERC721, ERC721URIStorage, Ownable {
    event Attest(address indexed to, uint256 indexed tokenId);
    event Revoke(address indexed to, uint256 indexed tokenId);
    event Recoverd(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );
    uint256 public constant noOfApprovalRequired = 3;

    struct OperatorDetails {
        address operator;
        bool approvals;
    }
    struct RecoveryApproval {
        address issuedTo;
        address recipient;
        OperatorDetails[noOfApprovalRequired] Operators;
    }

    mapping(uint256 => RecoveryApproval) RecoveryApprovalData;

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

        // RecoveryApprovalData[tokenId] =  RecoveryApproval(

        // );
        // Setting up the memory recovery account for the given account
        RecoveryApprovalData[tokenId].issuedTo = to;
        RecoveryApprovalData[tokenId].recipient = address(0);
        //  RecoveryApprovalData[tokenId].Operators[i]
        for (uint256 i = 0; i < noOfApprovalRequired; ++i) {
            RecoveryApprovalData[tokenId].Operators[i] = OperatorDetails({
                operator: recoveryAccounts[i],
                approvals: false
            });
        }
        // RecoveryApprovalData[tokenId].ownerApproval = false;
    }

    function validRecoveryAccounts(uint256 tokenId)
        internal
        view
        returns (uint256 id)
    {
        for (uint256 i = 0; i < noOfApprovalRequired; i++) {
            if (
                RecoveryApprovalData[tokenId].Operators[i].operator ==
                msg.sender
            ) {
                return i;
            }
        }
        revert("Account Not Approved for this token");
    }

    function recoverAppeal(uint256 tokenId, bool approval) external {
        require(
            RecoveryApprovalData[tokenId].recipient != address(0),
            "Organistaion has not Approved Transfer yet!"
        );
        uint256 id = validRecoveryAccounts(tokenId);
        RecoveryApprovalData[tokenId].Operators[id].approvals = approval;
    }

    function recoverAppealOrganistion(uint256 tokenId, address _recipient)
        external
        onlyOwner
    {
        RecoveryApprovalData[tokenId].recipient = _recipient;
    }

    // Calling recovery account to gets the token when approval required are met
    function recoverSoulBound(uint256 tokenId) external {
        // uint256 id = validRecoveryAccounts(tokenId);
        safeTransferFrom(
            RecoveryApprovalData[tokenId].issuedTo,
            RecoveryApprovalData[tokenId].recipient,
            tokenId
        );
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
        uint256 noOfApprovals = 0;
        bool operatorApproved = false;
        if (
            msg.sender == RecoveryApprovalData[firstTokenId].issuedTo ||
            msg.sender == owner()
        ) {
            require(
                from == address(0) || to == address(0),
                "You cannot transfer SBT"
            );
            super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
        }
        // else if (msg.sender == owner()) {}
        else {
            for (uint256 i = 0; i < noOfApprovalRequired; i++) {
                if (
                    RecoveryApprovalData[firstTokenId].Operators[i].approvals ==
                    true
                ) {
                    noOfApprovals += 1;
                }

                if (
                    RecoveryApprovalData[firstTokenId].Operators[i].operator ==
                    msg.sender
                ) {
                    operatorApproved = true;
                }
            }
            if (
                RecoveryApprovalData[firstTokenId].recipient != address(0) &&
                noOfApprovalRequired == noOfApprovals &&
                operatorApproved == true
            ) {
                super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
            } else {
                revert(
                    "You don't have enough Approval to recover SBT or caller is not Recovery Account"
                );
            }
        }
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
        } else {
            emit Recoverd(from, to, firstTokenId);
        }
        super._afterTokenTransfer(from, to, firstTokenId, batchSize);
    }

    function burn(uint256 tokenId) external {
        require(
            msg.sender == ownerOf(tokenId),
            "Only token ownwer can burn this token"
        );
        _burn(tokenId);
    }
}
