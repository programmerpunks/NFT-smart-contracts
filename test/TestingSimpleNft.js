const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Simple NFT sol", function () {
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

  describe("Minting", function () {
    describe("Validations", function () {
      it("Should revert with the error if minting is paused", async function () {
        const { simpleNFT, owner, account1 } = await loadFixture(
          deployContract
        );
        await simpleNFT.setMintState(false);
        const mintState = await simpleNFT.mintState();
        console.log("MintState value:", mintState);
        await expect(simpleNFT.connect(account1).mint(1)).to.be.revertedWith(
          "Minting is paused"
        );
      });

      it("Should revert with the error if a account that is NOT owner tries to pause", async function () {
        const { simpleNFT, owner, account1 } = await loadFixture(
          deployContract
        );

        await expect(
          simpleNFT.connect(account1).setMintState(false)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("Should revert with the error if mint amount is zero", async function () {
        const { simpleNFT, owner, account1 } = await loadFixture(
          deployContract
        );

        await expect(simpleNFT.connect(account1).mint(0)).to.be.revertedWith(
          "Mint amount Cannot be zero"
        );
        await expect(simpleNFT.connect(account1).mint(4)).to.be.revertedWith(
          "Cannot mint more than max mint amount"
        );
      });

      it("Should revert with the error if already minted max NFTs User", async function () {
        const { simpleNFT, owner, account1 } = await loadFixture(
          deployContract
        );

        const minting = await simpleNFT.connect(account1).mint(3, {
          value: ethers.utils.parseEther("0.03"),
        });
        console.log("minting: " + minting);
        await expect(
          simpleNFT.connect(account1).mint(1, {
            value: ethers.utils.parseEther("0.01"),
          })
        ).to.be.revertedWith("You cannot mint more than max NFTs");
      });

      it("Should revert with the error if mint more than max Supply Boundry", async function () {
        const { simpleNFT, owner, account1, account2, account3 } =
          await loadFixture(deployContract);

        await simpleNFT.connect(owner).mint(3, {
          value: ethers.utils.parseEther("0.03"),
        });

        await simpleNFT.connect(account1).mint(3, {
          value: ethers.utils.parseEther("0.03"),
        });
        await simpleNFT.connect(account2).mint(3, {
          value: ethers.utils.parseEther("0.03"),
        });

        await expect(
          simpleNFT.connect(account3).mint(2, {
            value: ethers.utils.parseEther("0.02"),
          })
        ).to.be.revertedWith("Cannot mint more than max Supply");
      });

      it("Should revert with the error if cost is not equal to set cost ", async function () {
        const { simpleNFT, owner, account1, account2, account3 } =
          await loadFixture(deployContract);

        await expect(
          simpleNFT.connect(account3).mint(1, {
            value: ethers.utils.parseEther("0.009"),
          })
        ).to.be.revertedWith("Cost Error");
        await expect(
          simpleNFT.connect(account3).mint(2, {
            value: ethers.utils.parseEther("0.019"),
          })
        ).to.be.revertedWith("Cost Error");
        await expect(
          simpleNFT.connect(account3).mint(3, {
            value: ethers.utils.parseEther("0.029"),
          })
        ).to.be.revertedWith("Cost Error");
      });
    });
  });
  describe("WithDraw ", function () {
    describe("Validations", function () {
      it("Should revert with the error if caller is not owner of contract", async function () {
        const { simpleNFT, owner, account1, account2, account3 } =
          await loadFixture(deployContract);

        await expect(simpleNFT.connect(account3).withdraw()).to.be.revertedWith(
          "Ownable: caller is not the owner"
        );
      });
      it("Should revert with the if balance of contract is zero", async function () {
        const { simpleNFT, owner, account1, account2, account3 } =
          await loadFixture(deployContract);
        await expect(simpleNFT.connect(owner).withdraw()).to.be.revertedWith(
          "Balance of this Contract is Zero"
        );
      });
    });

    describe("Transfer", function () {
      it("Should revert with the if Balance of contract is not widhdrawn", async function () {
        const { simpleNFT, owner, account1, account2, account3 } =
          await loadFixture(deployContract);

        const balanceOfaccount2before = BigInt(
          await ethers.provider.getBalance(account2.address)
        );
        console.log("balanceOfaccount2before", balanceOfaccount2before);

        await simpleNFT.connect(account2).mint(2, {
          value: ethers.utils.parseEther("0.02"),
        });

        expect(
          BigInt(await ethers.provider.getBalance(simpleNFT.address))
        ).to.equal(ethers.utils.parseEther("0.02"));

        const balanceOfaccount2After = BigInt(
          await ethers.provider.getBalance(simpleNFT.address)
        );
        console.log("balanceOfaccount2After", balanceOfaccount2After);

        const balanceOfOwnerBefore = BigInt(
          await ethers.provider.getBalance(owner.address)
        );
        console.log("balanceOfOwnerBefore:", balanceOfOwnerBefore);
        const widhdrawn = await simpleNFT.withdraw();

        const balanceOfOwnerAfter = BigInt(
          await ethers.provider.getBalance(owner.address)
        );
        console.log("balanceOfOwnerAfter:", balanceOfOwnerAfter);

        expect(
          BigInt(await ethers.provider.getBalance(simpleNFT.address))
        ).to.equal(BigInt(0));
      });
    });
  });

  describe("function tokenURI ", function () {
    describe("Validations", function () {
      it("Should revert with the error for nonexistent token", async function () {
        const { simpleNFT, owner, account1 } = await loadFixture(
          deployContract
        );

        await expect(
          simpleNFT.connect(account1).tokenURI(1)
        ).to.be.revertedWith("ERC721Metadata: URI query for nonexistent token");
      });
      it("Should revert with the URI is not Correct", async function () {
        const { simpleNFT, owner, account1, account2, account3 } =
          await loadFixture(deployContract);
        await simpleNFT.connect(owner).mint(3, {
          value: ethers.utils.parseEther("0.03"),
        });
        const tokenurii = await simpleNFT.tokenURI(1);
        console.log("tokenurii", tokenurii);

        expect(await simpleNFT.tokenURI(1)).to.equal("ipfs://URI/1.json");
      });
    });

    describe("Testing Token Ids with nftsOnwedByWallet function", function () {
      it("Should revert with the if Wrong Token id", async function () {
        const { simpleNFT, owner, account1, account2, account3 } =
          await loadFixture(deployContract);
        await simpleNFT.connect(owner).mint(3, {
          value: ethers.utils.parseEther("0.03"),
        });

        const ownerTokens = await simpleNFT
          .connect(owner)
          .nftsOnwedByWallet(owner.address);

        console.log("MY tokens: ", [
          ethers.BigNumber.from("1"),
          ethers.BigNumber.from("2"),
          ethers.BigNumber.from("3"),
        ]);

        console.log("ownerTokens", ...ownerTokens);
        // expect(ownerTokens).to.equal([
        //   ethers.BigNumber.from("1"),
        //   ethers.BigNumber.from("2"),
        //   ethers.BigNumber.from("3"),
        // ]);
        await simpleNFT.connect(account1).mint(3, {
          value: ethers.utils.parseEther("0.03"),
        });

        const account1Tokens = await simpleNFT
          .connect(account1)
          .nftsOnwedByWallet(account1.address);

        console.log("account1Tokens: ", account1Tokens);
        await simpleNFT.connect(account2).mint(3, {
          value: ethers.utils.parseEther("0.03"),
        });

        const account2Tokens = await simpleNFT
          .connect(account2)
          .nftsOnwedByWallet(account2.address);

        console.log("account1Tokens: ", account2Tokens);

        await simpleNFT.connect(account3).mint(1, {
          value: ethers.utils.parseEther("0.01"),
        });

        const account3Tokens = await simpleNFT
          .connect(account3)
          .nftsOnwedByWallet(account3.address);

        console.log("account1Tokens: ", account3Tokens);

        await expect(
          simpleNFT.connect(account3).mint(2, {
            value: ethers.utils.parseEther("0.02"),
          })
        ).to.be.revertedWith("Cannot mint more than max Supply");
      });
    });

    describe("Testing of cost function", function () {
      it("validation of OnlyOwner", async function () {
        const { simpleNFT, owner, account1, account2, account3 } =
          await loadFixture(deployContract);
        await expect(
          simpleNFT.connect(account2).setCost(ethers.utils.parseEther("1"))
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
      it("Should revert with the if cost is not set", async function () {
        const { simpleNFT, owner, account1, account2, account3 } =
          await loadFixture(deployContract);

        await simpleNFT.connect(owner).setCost(ethers.utils.parseEther("1"));
        expect(await simpleNFT.cost()).to.equal(ethers.utils.parseEther("1"));
      });
    });

    describe("Testing of setmaxMintAmount function", function () {
      it("validation of OnlyOwner", async function () {
        const { simpleNFT, owner, account1, account2, account3 } =
          await loadFixture(deployContract);
        await expect(
          simpleNFT.connect(account2).setmaxMintAmount(5)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
      it("Should revert with the if maxmint amount is not updated", async function () {
        const { simpleNFT, owner, account1, account2, account3 } =
          await loadFixture(deployContract);

        await simpleNFT.connect(owner).setmaxMintAmount(1);

        await expect(simpleNFT.connect(account2).mint(2)).to.be.revertedWith(
          "Cannot mint more than max mint amount"
        );

        expect(await simpleNFT.maxMintAmount()).to.equal(1);
      });
    });
    describe("Testing of setmaxMintAmount function", function () {
      it("validation of OnlyOwner", async function () {
        const { simpleNFT, owner, account1, account2, account3 } =
          await loadFixture(deployContract);
        await expect(
          simpleNFT.connect(account2).setBaseURI("ipfs://none")
        ).to.be.revertedWith("Ownable: caller is not the owner");

        await expect(
          simpleNFT.connect(account2).setBaseExtension("ipfs://none")
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("Error if setBaseExtension is not set", async function () {
        const { simpleNFT, owner, account1, account2, account3 } =
          await loadFixture(deployContract);
        const setbaseExtension = await simpleNFT
          .connect(owner)
          .setBaseExtension(".png");
        const val = await simpleNFT.baseExtension();
        expect(val).to.equal(".png");
      });
    });
  });
});
