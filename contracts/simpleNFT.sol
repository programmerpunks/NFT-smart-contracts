/**
    Functionalities:
    1. Owner can set Minting Price
    2. And a wallet can have only 3 nfts
    3. And in one transaction they can mint 3 nfts
    4. And these should be dynamic, owner can change after that
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract simpleNFT is ERC721Enumerable, Ownable {
    using Strings for uint256;

    string baseURI;
    string public baseExtension = ".json";

    uint256 public maxMintAmount = 3;
    uint256 public maxSupply = 10; //total
    uint256 public cost = 0.01 ether;

    bool public mintState = false;

    constructor(
        string memory name_,
        string memory symbol_,
        string memory _initBaseURI
    ) ERC721(name_, symbol_) {
        setBaseURI(_initBaseURI);
    }

    // internal functions
    //remove
    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    // public functions
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
            supply + _mintAmount <= maxSupply,
            "Cannot mint more than max Supply"
        );

        require(msg.value >= cost * _mintAmount, "Cost Error");
        for (uint256 i = 1; i <= _mintAmount; i++) {
            _mint(msg.sender, supply + i);
        }
    }

    // remove & Base URi
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
    function setCost(uint256 _newCost) public onlyOwner {
        cost = _newCost;
    }

    function setmaxMintAmount(uint256 _newmaxMintAmount) public onlyOwner {
        maxMintAmount = _newmaxMintAmount;
    }

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }

    function setBaseExtension(string memory _newBaseExtension)
        public
        onlyOwner
    {
        baseExtension = _newBaseExtension;
    }

    function setMintState(bool _state) public onlyOwner {
        mintState = _state;
    }

    function withdraw() public payable onlyOwner {
        require(address(this).balance > 0, "Balance of this Contract is Zero");
        (bool transfer, ) = payable(owner()).call{value: address(this).balance}(
            ""
        );
        require(transfer, "Withdraw unsuccessfull");
    }
}
