const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

describe("BAYC Contract:", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContract() {
    // Contracts are deployed using the first signer/account by default
    const [owner, account1, account2, account3, account4, account5] =
      await ethers.getSigners();

    const BaycContract = await ethers.getContractFactory("BoredApeYachtClub");
    const baycContract = await BaycContract.deploy(
      "BoredApeYachtClub",
      "BAYC",
      100,
      time.latest()
    );
    await baycContract.setBaseURI("ipfs://URI/");
    return {
      baycContract,
      owner,
      account1,
      account2,
      account3,
      account4,
      account5,
    };
  }
  async function deployContract2() {
    // Contracts are deployed using the first signer/account by default
    const [owner, account1] = await ethers.getSigners();

    const BaycContract = await ethers.getContractFactory("BoredApeYachtClub");
    const baycContract = await BaycContract.deploy(
      "BoredApeYachtClub",
      "BAYC",
      100,
      time.latest()
    );
    await baycContract.flipSaleState();

    return {
      baycContract,
      owner,
      account1,
    };
  }
  describe("setBaseURI", function () {
    it("Should return when baseuri not set", async function () {
      const { baycContract, owner, account1, account2, account3 } =
        await loadFixture(deployContract2);
      await baycContract.mintApe(2, { value: ethers.utils.parseEther("0.16") });
      let currtime = await time.latest();
      let unlockTime = currtime + 9 * 86400;
      await time.increaseTo(unlockTime);

      expect(await baycContract.tokenURI(1)).to.equal("");
    });

    it("validation of OnlyOwner", async function () {
      const { baycContract, owner, account1, account2, account3 } =
        await loadFixture(deployContract);
      await expect(
        baycContract.connect(account2).setBaseURI("ipfs://none")
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await expect(
        baycContract.connect(account2).setBaseExtension("ipfs://none")
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await expect(
        baycContract.connect(account2).flipSaleState()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Returns error if setBaseURI is not set correctly", async function () {
      const { baycContract, owner, account1, account2, account3 } =
        await loadFixture(deployContract);
      await baycContract.connect(owner).setBaseURI("ipfs://setBaseURI/");
      await baycContract.flipSaleState();
      await baycContract.mintApe(1, { value: ethers.utils.parseEther("0.08") });
      let currtime = await time.latest();
      let unlockTime = currtime + 9 * 86400;
      await time.increaseTo(unlockTime);
      expect(await baycContract.tokenURI(0)).to.equal(
        "ipfs://setBaseURI/0.json"
      );

      await expect(
        baycContract.connect(account2).setBaseExtension("ipfs://none")
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("Error if setBaseExtension is not set", async function () {
      const { baycContract, owner, account1, account2, account3 } =
        await loadFixture(deployContract);
      const setbaseExtension = await baycContract
        .connect(owner)
        .setBaseExtension(".png");
      const val = await baycContract.baseExtension();
      expect(val).to.equal(".png");
    });
  });
  describe("Deployment", function () {
    it("Should set the right owner of Contract", async function () {
      const { baycContract, owner } = await loadFixture(deployContract);

      expect(await baycContract.owner()).to.equal(owner.address);
    });

    it("Should have totalSupply equal to zero", async function () {
      const { baycContract, owner } = await loadFixture(deployContract);

      expect(await baycContract.totalSupply()).to.equal(0);
    });
  });
  describe("Minting", function () {
    it("Should Revert as saleIsActive is not true", async function () {
      const { baycContract, owner, account1 } = await loadFixture(
        deployContract
      );

      await expect(
        baycContract.connect(account1).mintApe(10)
      ).to.be.revertedWith("Sale must be active to mint Ape");
    });

    it("Should Revert as you can mint 20 tokens at a time", async function () {
      const { baycContract, owner, account1 } = await loadFixture(
        deployContract
      );

      await baycContract.flipSaleState();
      await expect(
        baycContract.connect(account1).mintApe(21)
      ).to.be.revertedWith("Can only mint 20 tokens at a time");
    });
    it("Should Revert if  token ids are not correct", async function () {
      const { baycContract, owner, account1 } = await loadFixture(
        deployContract
      );
      await baycContract.flipSaleState();

      await baycContract.connect(account1).mintApe(20, {
        value: ethers.utils.parseEther("1.6"),
      });
      const tokens = await baycContract.nftsOnwedByWallet(account1.address);
      console.log("Bayc Nfts", tokens);
      for (let i = 0; i < tokens.length; i++) {
        console.log("Token[i]", tokens[i]);
        expect(tokens[i]).to.equal(i);
      }
    });
  });
  describe("function tokenURI ", function () {
    describe("Validations", function () {
      it("Should revert with the error for nonexistent token", async function () {
        const { baycContract, owner, account1 } = await loadFixture(
          deployContract
        );

        await expect(
          baycContract.connect(account1).tokenURI(1)
        ).to.be.revertedWith("ERC721Metadata: URI query for nonexistent token");
      });
      it("Should revert with the URI is not Correct", async function () {
        const { baycContract, owner, account1, account2, account3 } =
          await loadFixture(deployContract);
        await baycContract.flipSaleState();
        await baycContract.connect(owner).mintApe(3, {
          value: ethers.utils.parseEther("0.24"),
        });
        const tokenurii = await baycContract.tokenURI(1);
        console.log("tokenurii", tokenurii);
        // expect(await baycContract.tokenURI(1)).to.equal("");
        expect(await baycContract.tokenURI(1)).to.equal("1");

        let currtime = await time.latest();
        let unlockTime = currtime + 9 * 86400;
        await time.increaseTo(unlockTime);
        expect(await baycContract.tokenURI(1)).to.equal("ipfs://URI/1.json");
      });
    });
  });

  describe("WithDraw ", function () {
    describe("Validations", function () {
      it("Should revert with the error if caller is not owner of contract", async function () {
        const { baycContract, owner, account1, account2, account3 } =
          await loadFixture(deployContract);

        await expect(
          baycContract.connect(account3).withdraw()
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
      it("Should revert with the if balance of contract is zero", async function () {
        const { baycContract, owner, account1, account2, account3 } =
          await loadFixture(deployContract);
        await expect(baycContract.connect(owner).withdraw()).to.be.revertedWith(
          "Balance of this Contract is Zero"
        );
      });
    });

    describe("Transfer", function () {
      it("Should revert with the if Balance of contract is not withdrawn", async function () {
        const { baycContract, owner, account1, account2, account3 } =
          await loadFixture(deployContract);

        const balanceOfaccount2before = BigInt(
          await ethers.provider.getBalance(account2.address)
        );
        console.log("balanceOfaccount2before", balanceOfaccount2before);
        await baycContract.flipSaleState();
        await baycContract.connect(account2).mintApe(2, {
          value: ethers.utils.parseEther("0.16"),
        });

        expect(
          BigInt(await ethers.provider.getBalance(baycContract.address))
        ).to.equal(ethers.utils.parseEther("0.16"));

        const balanceOfaccount2After = BigInt(
          await ethers.provider.getBalance(baycContract.address)
        );
        console.log("balanceOfaccount2After", balanceOfaccount2After);

        const balanceOfOwnerBefore = BigInt(
          await ethers.provider.getBalance(owner.address)
        );
        console.log("balanceOfOwnerBefore:", balanceOfOwnerBefore);
        const widhdrawn = await baycContract.withdraw();

        const balanceOfOwnerAfter = BigInt(
          await ethers.provider.getBalance(owner.address)
        );
        console.log("balanceOfOwnerAfter:", balanceOfOwnerAfter);

        expect(
          BigInt(await ethers.provider.getBalance(baycContract.address))
        ).to.equal(BigInt(0));
      });
    });
  });
  describe("reserveApes ", function () {
    describe("Validations", function () {
      it("Should revert with the Reserve/mint Ape more than max Supply", async function () {
        const {
          baycContract,
          owner,
          account1,
          account2,
          account3,
          account4,
          account5,
        } = await loadFixture(deployContract);

        await baycContract.flipSaleState();

        await baycContract
          .connect(account1)
          .mintApe(20, { value: ethers.utils.parseEther("1.6") });
        await baycContract
          .connect(account2)
          .mintApe(20, { value: ethers.utils.parseEther("1.6") });
        await baycContract
          .connect(account3)
          .mintApe(20, { value: ethers.utils.parseEther("1.6") });
        await baycContract
          .connect(account4)
          .mintApe(20, { value: ethers.utils.parseEther("1.6") });

        await expect(baycContract.reserveApes()).to.be.revertedWith(
          "Reserve would exceed max supply of Apes"
        );
        await baycContract
          .connect(account4)
          .mintApe(10, { value: ethers.utils.parseEther("0.8") });

        await expect(
          baycContract.mintApe(11, { value: ethers.utils.parseEther("0.88") })
        ).to.be.revertedWith("Purchase would exceed max supply of Apes");
      });
      it("Ether value sent is not correct", async function () {
        const { baycContract, account1 } = await loadFixture(deployContract);

        await baycContract.flipSaleState();

        await expect(
          baycContract
            .connect(account1)
            .mintApe(20, { value: ethers.utils.parseEther("1.5") })
        ).to.be.revertedWith("Ether value sent is not correct");
      });
    });
    describe("Validations", function () {
      it("Should revert with the ReserveApe more with correct tokenId", async function () {
        const {
          baycContract,
          owner,
          account1,
          account2,
          account3,
          account4,
          account5,
        } = await loadFixture(deployContract);
        await expect(
          baycContract.connect(account1).reserveApes()
        ).to.be.rejectedWith("Ownable: caller is not the owner");
      });
      it("Should revert with the ReserveApe more with correct tokenId", async function () {
        const { baycContract, owner } = await loadFixture(deployContract);
        await baycContract.reserveApes();
        const tokens = await baycContract.nftsOnwedByWallet(owner.address);
        for (let i = 0; i < tokens.length; i++) {
          expect(i).to.equal(tokens[i]);
        }
      });
    });
  });
  describe("Max Supply & mint Boundries", function () {
    it("Should set if mint more than ", async function () {
      const {
        baycContract,
        owner,
        account1,
        account2,
        account3,
        account4,
        account5,
      } = await loadFixture(deployContract);
      await baycContract.flipSaleState();
      await baycContract.mintApe(20, { value: ethers.utils.parseEther("1.6") });
      await baycContract
        .connect(account1)
        .mintApe(20, { value: ethers.utils.parseEther("1.6") });
      await baycContract
        .connect(account2)
        .mintApe(20, { value: ethers.utils.parseEther("1.6") });
      await baycContract
        .connect(account3)
        .mintApe(20, { value: ethers.utils.parseEther("1.6") });
      await baycContract
        .connect(account4)
        .mintApe(20, { value: ethers.utils.parseEther("1.6") });
      await expect(
        baycContract
          .connect(account5)
          .mintApe(20, { value: ethers.utils.parseEther("1.6") })
      ).to.be.revertedWith("Purchase would exceed max supply of Apes");
    });
  });

  describe("setRevealTimestamp Function", function () {
    it("Validation only owner ", async function () {
      const {
        baycContract,
        owner,
        account1,
        account2,
        account3,
        account4,
        account5,
      } = await loadFixture(deployContract);

      await expect(
        baycContract.mintApe(20, { value: ethers.utils.parseEther("1.6") })
      ).to.be.revertedWith("Sale must be active to mint Ape");

      await baycContract.flipSaleState();
      await baycContract.flipSaleState();
      await expect(
        baycContract.mintApe(20, { value: ethers.utils.parseEther("1.6") })
      ).to.be.revertedWith("Sale must be active to mint Ape");

      await baycContract.flipSaleState();
      await baycContract.mintApe(20, { value: ethers.utils.parseEther("1.6") });
      await baycContract
        .connect(account1)
        .mintApe(20, { value: ethers.utils.parseEther("1.6") });
      expect(await baycContract.tokenURI(0)).to.equal("0");
      let currtime = await time.latest();
      let unlockTime = currtime + 20 * 86400;

      await expect(
        baycContract.connect(account1).setRevealTimestamp(unlockTime)
      ).to.be.revertedWith("Ownable: caller is not the owner");
      await baycContract.setRevealTimestamp(unlockTime);
      expect(await baycContract.tokenURI(0)).to.equal("0");

      await time.increaseTo(unlockTime);
      expect(await baycContract.tokenURI(0)).to.equal("ipfs://URI/0.json");
    });
  });
});
