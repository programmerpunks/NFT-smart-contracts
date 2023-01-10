const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SoulBoundToken Contract", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContract() {
    // Contracts are deployed using the first signer/account by default
    const [owner, account1, account2, account3, account4, account5, account6] =
      await ethers.getSigners();

    const SoulBoundToken = await ethers.getContractFactory("SoulBoundToken");
    const soulBoundToken = await SoulBoundToken.deploy();

    return {
      soulBoundToken,
      owner,
      account1,
      account2,
      account3,
      account4,
      account5,
      account6,
    };
  }

  describe("Deployment", function () {
    it("Should set the right owner of Contract", async function () {
      const { soulBoundToken, owner } = await loadFixture(deployContract);

      expect(await soulBoundToken.owner()).to.equal(owner.address);
    });
  });
  describe("Safemint Function Testing", function () {
    it("Only Owner can mint ", async function () {
      const {
        soulBoundToken,
        owner,
        account1,
        account2,
        account3,
        account4,
        account5,
        account6,
      } = await loadFixture(deployContract);
      await expect(
        soulBoundToken
          .connect(account1)
          .safeMint(account1.address, 1, "ipfs://URI/1", [
            "" + account2.address,
            "" + account3.address,
            "" + account4.address,
          ])
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("Should revert with the error if minting is paused", async function () {
      const {
        soulBoundToken,
        owner,
        account1,
        account2,
        account3,
        account4,
        account5,
        account6,
      } = await loadFixture(deployContract);

      await soulBoundToken.safeMint(account1.address, 1, "ipfs://URI/1", [
        "" + account2.address,
        "" + account3.address,
        "" + account4.address,
      ]);
    });

    describe("Safemint Function Testing", function () {
      it("Only Owner can mint ", async function () {
        const {
          soulBoundToken,
          owner,
          account1,
          account2,
          account3,
          account4,
        } = await loadFixture(deployContract);
        await expect(
          soulBoundToken
            .connect(owner)
            .safeMint(account1.address, 1, "ipfs://URI/1", [
              "" + account2.address,
              "" + account3.address,
            ])
        ).to.be.revertedWith("recoveryAccounts not equal to required number");
      });
    });

    describe("recoverAppeal Functionality Testing", function () {
      it("Validation of Non-Recovery account trying to appeal", async function () {
        const {
          soulBoundToken,
          owner,
          account1,
          account2,
          account3,
          account4,
          account5,
          account6,
        } = await loadFixture(deployContract);

        await soulBoundToken.safeMint(account1.address, 1, "ipfs://URI/1", [
          "" + account2.address,
          "" + account3.address,
          "" + account4.address,
        ]);

        await expect(
          soulBoundToken
            .connect(account1)
            .recoverAppealOrganistion(1, account5.address)
        ).to.be.revertedWith("Ownable: caller is not the owner");

        await expect(
          soulBoundToken.connect(account5).recoverAppeal(1, true)
        ).to.be.revertedWith("Organistaion has not Approved Transfer yet!");

        await soulBoundToken
          .connect(owner)
          .recoverAppealOrganistion(1, account5.address);

        await expect(
          soulBoundToken.connect(account5).recoverAppeal(1, true)
        ).to.be.revertedWith("Account Not Approved for this token");

        await soulBoundToken.connect(account4).recoverAppeal(1, true);
      });
      describe("recoverSoulBound Function", function () {
        it("recoverSoulBound Validations ", async function () {
          const {
            soulBoundToken,
            owner,
            account1,
            account2,
            account3,
            account4,
            account5,
            account6,
          } = await loadFixture(deployContract);

          await soulBoundToken.safeMint(account1.address, 1, "ipfs://URI/1", [
            "" + account2.address,
            "" + account3.address,
            "" + account4.address,
          ]);

          await soulBoundToken
            .connect(owner)
            .recoverAppealOrganistion(1, account5.address);
          await soulBoundToken.connect(account4).recoverAppeal(1, true);
          await soulBoundToken.connect(account3).recoverAppeal(1, true);

          await expect(
            soulBoundToken.connect(account1).recoverSoulBound(1)
          ).to.be.revertedWith("You cannot transfer SBT");

          await expect(
            soulBoundToken.connect(account2).recoverSoulBound(1)
          ).to.be.revertedWith(
            "You don't have enough Approval to recover SBT or caller is not Recovery Account"
          );
          // "You don't have enough Approval to recover SBT"

          // await soulBoundToken.connect(account2).recoverAppeal(1, true);
          // await soulBoundToken.connect(owner).recoverAppealOwner(1, true);

          // await soulBoundToken.connect(account3).recoverSoulBound(1);
          // expect(soulBoundToken.ownerOf(1)).to.equal(account2.address);
        });
        it("recoverSoulBound function testing", async function () {
          const {
            soulBoundToken,
            owner,
            account1,
            account2,
            account3,
            account4,
            account5,
          } = await loadFixture(deployContract);

          await soulBoundToken.safeMint(account1.address, 1, "ipfs://URI/1", [
            "" + account2.address,
            "" + account3.address,
            "" + account4.address,
          ]);
          await soulBoundToken
            .connect(owner)
            .recoverAppealOrganistion(1, account5.address);
          await soulBoundToken.connect(account4).recoverAppeal(1, true);
          await soulBoundToken.connect(account3).recoverAppeal(1, true);

          await expect(
            soulBoundToken.connect(account5).recoverSoulBound(1)
          ).to.be.revertedWith(
            "You don't have enough Approval to recover SBT or caller is not Recovery Account"
          );

          await soulBoundToken.connect(account2).recoverAppeal(1, true);

          await soulBoundToken.connect(account4).recoverSoulBound(1);

          expect(await soulBoundToken.ownerOf(1)).to.equal(account5.address);
        });
      });
      describe("Burning Token", async function () {
        it("should Revert when Non Owner Tries to Burn & other Testing", async function () {
          const {
            soulBoundToken,
            owner,
            account1,
            account2,
            account3,
            account4,
            account5,
          } = await loadFixture(deployContract);

          await soulBoundToken.safeMint(account1.address, 1, "ipfs://URI/1", [
            "" + account2.address,
            "" + account3.address,
            "" + account4.address,
          ]);
          await expect(
            soulBoundToken.connect(owner).burn(1)
          ).to.be.revertedWith("Only token ownwer can burn this token");

          await soulBoundToken.connect(account1).burn(1);

          await expect(
            soulBoundToken.connect(account1).tokenURI(1)
          ).to.be.revertedWith("ERC721: invalid token ID");
        });
      });
    });
  });
});
