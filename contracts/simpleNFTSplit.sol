/**
    Functionalities:
    1. Owner can set Minting Price
    2. And a wallet can have only 3 nfts
    3. And in one transaction they can mint 3 nfts
    4. And these should be dynamic, owner can change after that
    5. And owner can mint 10 nfts as guest for its team members
    6. And when a
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract simpleNFTSplit is ERC721Enumerable, Ownable {
    using Strings for uint256;

    string baseURI;
    string public baseExtension = ".json";

    uint256 public maxMintAmount = 3;
    uint256 public maxSupply = 20; //total
    uint256 public cost = 0.01 ether;
    uint256 public teamSupply = 10;

    bool public mintState = false;
    bool public revealed = false;
    string public notRevealedUri;

    // Partner to Percentage
    // mapping(address => uint256) partner;
    uint256[] percentages;
    address[] partners;

    constructor(
        string memory name_,
        string memory symbol_,
        string memory _initBaseURI,
        string memory _initNotRevealedUri,
        address[] memory _partner,
        uint256[] memory _percentages
    ) ERC721(name_, symbol_) {
        baseURI = _initBaseURI;
        notRevealedUri = _initNotRevealedUri;
        require(
            _partner.length == _percentages.length,
            "Accounts and percentages length mismatch"
        );
        require(_partner.length >= 5, "partner must be at least 5");
        uint256 totalPercentage = 0;

        //  (_partner.length);
        // (_percentages.length);

        for (uint256 i = 0; i < _partner.length; i++) {
            // assert(_percentages[i] > 0);
            // assert(_partner[i] != address(0));
            require(
                _percentages[i] > 0,
                "percentage cannot be zero for each partner"
            );
            require(_partner[i] != address(0), "Address cannot be zero");

            partners.push(_partner[i]);
            percentages.push(_percentages[i]);
            totalPercentage += _percentages[i];
        }
        require(
            totalPercentage == 100,
            "Total percentage should add upto 100%"
        );
    }

    // internal functions
    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    // external functions
    function mint(uint256 _mintAmount) external payable {
        uint256 supply = totalSupply();
        require(mintState, "Minting is paused");

        require(_mintAmount > 0, "Mint amount Cannot be zero");
        require(
            _mintAmount <= maxMintAmount,
            "Cannot mint more than max mint amount"
        );
        require(
            balanceOf(msg.sender) + _mintAmount <= maxMintAmount,
            "You cannot mint more than max NFTs"
        );
        require(
            supply + _mintAmount + teamSupply <= maxSupply,
            "Cannot mint more than max Supply"
        );

        require(msg.value >= cost * _mintAmount, "Cost Error");
        for (uint256 i = 1; i <= _mintAmount; i++) {
            _mint(msg.sender, supply + i);
        }
    }

    function gift(uint256 _mintAmount, address receiver)
        external
        payable
        onlyOwner
    {
        uint256 supply = totalSupply();
        require(mintState, "Minting is paused");
        require(teamSupply > 0, "All Gift are dispatched");
        require(_mintAmount <= teamSupply, "Cannot mint this amount as gift");
        require(_mintAmount > 0, "Mint amount Cannot be zero");
        require(
            _mintAmount <= maxMintAmount,
            "Cannot mint more than max mint amount"
        );
        require(
            balanceOf(receiver) + _mintAmount <= maxMintAmount,
            "You cannot mint more than max NFTs for this wallet"
        );
        require(
            supply + _mintAmount <= maxSupply,
            "Cannot mint more than max Supply"
        );

        require(msg.value >= cost * _mintAmount, "Cost Error");
        for (uint256 i = 1; i <= _mintAmount; i++) {
            _mint(receiver, supply + i);
            teamSupply--;
        }
    }

    // public functions

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );
        if (revealed == false) {
            return notRevealedUri;
        }

        // Only Owner Functions
        string memory currentBaseURI = _baseURI();
        return
            bytes(currentBaseURI).length > 0
                ? string(
                    abi.encodePacked(
                        currentBaseURI,
                        tokenId.toString(),
                        baseExtension
                    )
                )
                : "";
    }

    function nftsOnwedByWallet(address _owner)
        external
        view
        returns (uint256[] memory)
    {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);
        for (uint256 i; i < ownerTokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokenIds;
    }

    //only owner

    function reveal() external onlyOwner {
        revealed = true;
    }

    function setNotRevealedURI(string memory _notRevealedURI)
        external
        onlyOwner
    {
        notRevealedUri = _notRevealedURI;
    }

    function setCost(uint256 _newCost) external onlyOwner {
        cost = _newCost;
    }

    function setmaxMintAmount(uint256 _newmaxMintAmount) external onlyOwner {
        maxMintAmount = _newmaxMintAmount;
    }

    function setBaseURI(string memory _newBaseURI) external onlyOwner {
        baseURI = _newBaseURI;
    }

    function setBaseExtension(string memory _newBaseExtension)
        external
        onlyOwner
    {
        baseExtension = _newBaseExtension;
    }

    function setMintState(bool _state) external onlyOwner {
        mintState = _state;
    }

    function withdraw() external payable onlyOwner {
        require(address(this).balance > 0, "Balance of this Contract is Zero");
        uint256 currentBalance = address(this).balance;
        for (uint256 i = 0; i < partners.length; i++) {
            (bool transfer, ) = payable(partners[i]).call{
                value: (currentBalance * percentages[i]) / 100
            }("");
            require(transfer, "Withdraw unsuccessfull");
        }
    }
}
