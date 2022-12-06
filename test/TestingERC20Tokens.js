const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ERC20 TOKENS CONTRACT TESTING", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContract() {
    // Contracts are deployed using the first signer/account by default
    const [owner, account1, account2] = await ethers.getSigners();

    const Erc20Tokens = await ethers.getContractFactory("ERC20Tokens");
    const erc20Tokens = await Erc20Tokens.deploy("TestTokens", "$TT");

    return {
      erc20Tokens,
      owner,
      account1,
      account2,
    };
  }

  // describe("Constructor", () => {});
  describe("Constructor", function () {
    it("Should have totalSupply equal to 50000", async function () {
      const { erc20Tokens, owner } = await loadFixture(deployContract);
      expect(await erc20Tokens.totalSupply()).to.equal(
        ethers.utils.parseEther("50000")
      );
      expect(await erc20Tokens.balanceOf(owner.address)).to.equal(
        ethers.utils.parseEther("50000")
      );
    });
  });
});
