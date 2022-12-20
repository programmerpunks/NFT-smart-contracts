const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StakingNFT contract", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContract() {
    // Contracts are deployed using the first signer/account by default
    const [owner, account1, account2, account3] = await ethers.getSigners();

    const SimpleNFT = await ethers.getContractFactory("simpleNFT");
    const simpleNFT = await SimpleNFT.deploy("Test", "test", "ipfs://URI/");

    await simpleNFT.setMintState(true);

    return { simpleNFT, owner, account1, account2, account3 };
  }

  describe("Deployment", function () {
    it("Should set the right owner of Contract", async function () {
      const { simpleNFT, owner } = await loadFixture(deployContract);

      expect(await simpleNFT.owner()).to.equal(owner.address);
    });

    it("Should have totalSupply equal to zero", async function () {
      const { simpleNFT, owner } = await loadFixture(deployContract);

      expect(await simpleNFT.totalSupply()).to.equal(0);
    });
  });
});

// TODO: no rewarding tokenss.... and claim
//
