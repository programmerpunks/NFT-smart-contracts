const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Simple NFT mint with ERC20 Tokens functionality", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContract() {
    // Contracts are deployed using the first signer/account by default
    const [
      owner,
      account1,
      account2,
      account3,
      account4,
      account5,
      account6,
      account7,
      account8,
      account9,
    ] = await ethers.getSigners();

    const Erc20Tokens = await ethers.getContractFactory("ERC20Tokens");
    const erc20Tokens = await Erc20Tokens.deploy("TestTokens", "$TT");

    const SimpleNFT = await ethers.getContractFactory("simpleNftWithTokens");
    const simpleNFT = await SimpleNFT.deploy(
      "Test",
      "test",
      "ipfs://URI/",
      "ipfs://notRevealedUri/",
      [
        account1.address.toString(),
        account2.address.toString(),
        account3.address.toString(),
        account4.address.toString(),
        account5.address.toString(),
      ],
      [20, 20, 20, 20, 20],
      erc20Tokens.address
    );

    await simpleNFT.setMintState(true);

    return {
      simpleNFT,
      owner,
      erc20Tokens,
      account1,
      account2,
      account3,
      account4,
      account5,
      account6,
      account7,
    };
  }

  describe("Constructor", () => {
    async function deployContract1() {
      // Contracts are deployed using the first signer/account by default
      const [owner, account1, account2, account3, account4, account5] =
        await ethers.getSigners();

      const Erc20Tokens = await ethers.getContractFactory("ERC20Tokens");
      const erc20Tokens = await Erc20Tokens.deploy("TestTokens", "$TT");
      const SimpleNFT = await ethers.getContractFactory("simpleNftWithTokens");
      const simpleNFT = await SimpleNFT.deploy(
        "Test",
        "test",
        "ipfs://URI/",
        "ipfs://notRevealedUri/",
        [
          account1.address.toString(),
          account2.address.toString(),
          account3.address.toString(),
          account4.address.toString(),
          account5.address.toString(),
        ],
        [20, 20, 20, 20, 19],
        erc20Tokens.address
      );
    }
    async function deployContract2() {
      // Contracts are deployed using the first signer/account by default
      const [owner, account1, account2, account3, account4, account5] =
        await ethers.getSigners();
      const Erc20Tokens = await ethers.getContractFactory("ERC20Tokens");
      const erc20Tokens = await Erc20Tokens.deploy("TestTokens", "$TT");
      const SimpleNFT = await ethers.getContractFactory("simpleNftWithTokens");
      const simpleNFT = await SimpleNFT.deploy(
        "Test",
        "test",
        "ipfs://URI/",
        "ipfs://notRevealedUri/",
        [
          account1.address.toString(),
          account2.address.toString(),
          ethers.constants.AddressZero,
          account4.address.toString(),
          account5.address.toString(),
        ],
        [20, 20, 20, 20, 20],
        erc20Tokens.address
      );
    }

    async function deployContract3() {
      // Contracts are deployed using the first signer/account by default
      const [owner, account1, account2, account3, account4, account5] =
        await ethers.getSigners();

      const Erc20Tokens = await ethers.getContractFactory("ERC20Tokens");
      const erc20Tokens = await Erc20Tokens.deploy("TestTokens", "$TT");
      const SimpleNFT = await ethers.getContractFactory("simpleNftWithTokens");
      const simpleNFT = await SimpleNFT.deploy(
        "Test",
        "test",
        "ipfs://URI/",
        "ipfs://notRevealedUri/",
        [
          account1.address.toString(),
          account2.address.toString(),
          account3.address.toString(),
          account4.address.toString(),
          account5.address.toString(),
        ],
        [20, 20, 20, 0, 20],
        erc20Tokens.address
      );
    }

    async function deployContract4() {
      // Contracts are deployed using the first signer/account by default
      const [owner, account1, account2, account3, account4, account5] =
        await ethers.getSigners();

      const Erc20Tokens = await ethers.getContractFactory("ERC20Tokens");
      const erc20Tokens = await Erc20Tokens.deploy("TestTokens", "$TT");
      const SimpleNFT = await ethers.getContractFactory("simpleNftWithTokens");
      const simpleNFT = await SimpleNFT.deploy(
        "Test",
        "test",
        "ipfs://URI/",
        "ipfs://notRevealedUri/",
        [
          account1.address.toString(),
          account2.address.toString(),
          account3.address.toString(),
          account4.address.toString(),
          account5.address.toString(),
        ],
        [20, 20, 20, 0],
        erc20Tokens.address
      );
    }
    async function deployContract5() {
      // Contracts are deployed using the first signer/account by default
      const [owner, account1, account2, account3, account4, account5] =
        await ethers.getSigners();

      const Erc20Tokens = await ethers.getContractFactory("ERC20Tokens");
      const erc20Tokens = await Erc20Tokens.deploy("TestTokens", "$TT");
      const SimpleNFT = await ethers.getContractFactory("simpleNftWithTokens");
      const simpleNFT = await SimpleNFT.deploy(
        "Test",
        "test",
        "ipfs://URI/",
        "ipfs://notRevealedUri/",
        [
          account1.address.toString(),
          account2.address.toString(),
          account3.address.toString(),
          account4.address.toString(),
        ],
        [20, 20, 20, 0],
        erc20Tokens.address
      );
    }
    it("Should Revert when Total percentage don't add upto 100%", async function () {
      await expect(loadFixture(deployContract1)).to.be.revertedWith(
        "Total percentage should add upto 100%"
      );
    });
    it("Should Revert when Address cannot  be zero", async function () {
      await expect(loadFixture(deployContract2)).to.be.revertedWith(
        "Address cannot be zero"
      );
    });
    it("Should Revert when percentage cannot be zero for each partner", async function () {
      await expect(loadFixture(deployContract3)).to.be.revertedWith(
        "percentage cannot be zero for each partner"
      );
    });
    it("Should Revert when percentage cannot be zero for each partner", async function () {
      await expect(loadFixture(deployContract4)).to.be.revertedWith(
        "Accounts and percentages length mismatch"
      );
    });
    it("Should Revert when percentage cannot be zero for each partner", async function () {
      await expect(loadFixture(deployContract5)).to.be.revertedWith(
        "partner must be at least 5"
      );
    });
  });
  describe("Deployment", function () {
    // it("Should Revert when Total percentage don't add upto 100%", async function () {
    //   await expect(loadFixture(deployContract)).to.be.revertedWith(
    //     "Total percentage should add upto 100%"
    //   );
    // });

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

      it("Should revert with the error if a account that is NOT owner tries to gift", async function () {
        const { simpleNFT, owner, account1, account3 } = await loadFixture(
          deployContract
        );

        await expect(
          simpleNFT.connect(account1).gift(3, account3.address, {
            value: ethers.utils.parseEther("0.03"),
          })
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("Should revert with the error if a account that is NOT owner setMintState", async function () {
        const { simpleNFT, owner, account1, account3 } = await loadFixture(
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
        const { simpleNFT, erc20Tokens, owner, account1 } = await loadFixture(
          deployContract
        );
        await erc20Tokens.transfer(
          account1.address,
          ethers.utils.parseEther("0.05")
        );

        const balanceofTokens = await erc20Tokens.balanceOf(account1.address);
        console.log(
          "############################balanceofTokens",
          balanceofTokens
        );
        await erc20Tokens
          .connect(account1)
          .approve(simpleNFT.address, ethers.utils.parseEther("0.05"));
        const allowancee = await erc20Tokens.allowance(
          account1.address,
          simpleNFT.address
        );
        console.log("###############################allowancee:", allowancee);
        const minting = await simpleNFT.connect(account1).mint(3);
        console.log("minting: " + minting);
        await expect(simpleNFT.connect(account1).mint(1)).to.be.revertedWith(
          "You cannot mint more than max NFTs"
        );
      });

      it("Should revert with the error if mint more than max Supply Boundry for user", async function () {
        const {
          simpleNFT,
          owner,
          erc20Tokens,
          account1,
          account2,
          account3,
          account4,
          account5,
          account6,
          account7,
        } = await loadFixture(deployContract);

        // await erc20Tokens.transfer(
        //   owner.address,
        //   ethers.utils.parseEther("0.05")
        // );
        await erc20Tokens.transfer(
          account1.address,
          ethers.utils.parseEther("0.05")
        );

        await erc20Tokens.transfer(
          account2.address,
          ethers.utils.parseEther("0.05")
        );

        await erc20Tokens.transfer(
          account3.address,
          ethers.utils.parseEther("0.05")
        );

        await erc20Tokens.transfer(
          account4.address,
          ethers.utils.parseEther("0.05")
        );

        await erc20Tokens.transfer(
          account5.address,
          ethers.utils.parseEther("0.05")
        );

        await erc20Tokens.transfer(
          account6.address,
          ethers.utils.parseEther("0.05")
        );

        await erc20Tokens.transfer(
          account7.address,
          ethers.utils.parseEther("0.05")
        );

        await erc20Tokens
          .connect(owner)
          .approve(simpleNFT.address, ethers.utils.parseEther("1"));

        await erc20Tokens
          .connect(account1)
          .approve(simpleNFT.address, ethers.utils.parseEther("0.05"));

        await erc20Tokens
          .connect(account2)
          .approve(simpleNFT.address, ethers.utils.parseEther("0.05"));

        await erc20Tokens
          .connect(account3)
          .approve(simpleNFT.address, ethers.utils.parseEther("0.05"));
        await erc20Tokens
          .connect(account4)
          .approve(simpleNFT.address, ethers.utils.parseEther("0.05"));
        await erc20Tokens
          .connect(account5)
          .approve(simpleNFT.address, ethers.utils.parseEther("0.05"));
        await erc20Tokens
          .connect(account6)
          .approve(simpleNFT.address, ethers.utils.parseEther("0.05"));
        await erc20Tokens
          .connect(account7)
          .approve(simpleNFT.address, ethers.utils.parseEther("0.05"));
        await simpleNFT.connect(owner).mint(3);
        await simpleNFT.connect(account1).mint(3);
        await simpleNFT.connect(account2).mint(3);
        // mint 9
        await expect(simpleNFT.connect(account3).mint(2)).to.be.revertedWith(
          "Cannot mint more than max Supply"
        );

        await simpleNFT.connect(owner).gift(1, account3.address);

        await simpleNFT.connect(owner).gift(2, account3.address);
        // mint 9 gift 3
        await expect(
          simpleNFT.connect(owner).gift(1, account3.address)
        ).to.be.revertedWith(
          "You cannot mint more than max NFTs for this wallet"
        );

        await simpleNFT.connect(owner).gift(3, account4.address);
        // mint 9 gift 6
        await expect(
          simpleNFT.connect(owner).gift(1, account4.address)
        ).to.be.revertedWith(
          "You cannot mint more than max NFTs for this wallet"
        );
        await simpleNFT.connect(owner).gift(3, account5.address);
        // mint 9 gift 9
        await expect(
          simpleNFT.connect(owner).gift(3, account6.address)
        ).to.be.revertedWith("Cannot mint this amount as gift");

        await simpleNFT.connect(owner).gift(1, account6.address);
        // mint 9 gift 10
        await simpleNFT.connect(account6).mint(1);
        // mint 10 gift 10
        await expect(simpleNFT.connect(account7).mint(1)).to.be.revertedWith(
          "Cannot mint more than max Supply"
        );
      });

      it("Should revert with the error if cost is not equal to set cost ", async function () {
        const { simpleNFT, erc20Tokens, owner, account1, account2, account3 } =
          await loadFixture(deployContract);

        await erc20Tokens.transfer(
          account3.address,
          ethers.utils.parseEther("0.009")
        );

        const balanceOfaccount3before = BigInt(
          await ethers.provider.getBalance(account3.address)
        );
        console.log("balanceOfaccount3before", balanceOfaccount3before);

        await erc20Tokens
          .connect(account3)
          .approve(simpleNFT.address, ethers.utils.parseEther("0.009"));

        await expect(simpleNFT.connect(account3).mint(1)).to.be.revertedWith(
          "Not enough Allowed Token to NFTs Contract"
        );
        const balanceOfaccount3After = BigInt(
          await ethers.provider.getBalance(account3.address)
        );
        console.log("balanceOfaccount3After", balanceOfaccount3After);

        await erc20Tokens.transfer(
          account3.address,
          ethers.utils.parseEther("0.01")
        );
        // more approval but less balance
        await erc20Tokens
          .connect(account3)
          .approve(simpleNFT.address, ethers.utils.parseEther("0.020"));

        await expect(simpleNFT.connect(account3).mint(2)).to.be.revertedWith(
          "Not enough Tokens"
        );

        await erc20Tokens.transfer(
          account3.address,
          ethers.utils.parseEther("0.01")
        );
        await erc20Tokens
          .connect(account3)
          .approve(simpleNFT.address, ethers.utils.parseEther("0.029"));

        await expect(simpleNFT.connect(account3).mint(3)).to.be.revertedWith(
          "Not enough Allowed Token to NFTs Contract"
        );

        await erc20Tokens
          .connect(account3)
          .approve(simpleNFT.address, ethers.utils.parseEther("0.03"));
        await expect(simpleNFT.connect(account3).mint(3)).to.be.revertedWith(
          "Not enough Tokens"
        );

        await erc20Tokens.transfer(
          account3.address,
          ethers.utils.parseEther("0.001")
        );
        await simpleNFT.connect(account3).mint(3);
        const mintedTokens = await simpleNFT.nftsOnwedByWallet(
          account3.address
        );
        console.log("mintedTokens:" + mintedTokens);
        expect(mintedTokens.toString()).to.equal("1,2,3");
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
      it("Should revert with the if Balance of contract is not widhdrawn 1", async function () {
        const { simpleNFT, erc20Tokens, owner, account1, account2, account3 } =
          await loadFixture(deployContract);

        const balanceOfaccount2before = BigInt(
          await ethers.provider.getBalance(account2.address)
        );
        console.log("balanceOfaccount2before", balanceOfaccount2before);

        await erc20Tokens.transfer(
          account2.address,
          ethers.utils.parseEther("0.02")
        );
        // more approval but less balance
        await erc20Tokens
          .connect(account2)
          .approve(simpleNFT.address, ethers.utils.parseEther("0.020"));

        await simpleNFT.connect(account2).mint(2);

        expect(
          // BigInt(await ethers.provider.getBalance(simpleNFT.address))
          await erc20Tokens.balanceOf(simpleNFT.address)
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
          // BigInt(await ethers.provider.getBalance(simpleNFT.address)
          await erc20Tokens.balanceOf(simpleNFT.address)
        ).to.equal(BigInt(0));
      });
      //FIXME: set this
      it("Should revert with the if Balance of contract is not widhdrawn", async function () {
        const {
          simpleNFT,
          owner,
          erc20Tokens,
          account1,
          account2,
          account3,
          account4,
          account5,
          account6,
          account7,
          account8,
          account9,
        } = await loadFixture(deployContract);

        const balanceOfaccount1before = BigInt(
          await erc20Tokens.balanceOf(account1.address)
          // ethers.provider.getBalance(account1.address)
        );
        console.log("balanceOfaccount1before", balanceOfaccount1before);

        await erc20Tokens.transfer(
          account5.address,
          ethers.utils.parseEther("0.01")
        );
        await erc20Tokens
          .connect(account5)
          .approve(simpleNFT.address, ethers.utils.parseEther("0.010"));

        await erc20Tokens.transfer(
          account4.address,
          ethers.utils.parseEther("0.03")
        );
        await erc20Tokens
          .connect(account4)
          .approve(simpleNFT.address, ethers.utils.parseEther("0.030"));

        await erc20Tokens.transfer(
          account6.address,
          ethers.utils.parseEther("0.03")
        );
        await erc20Tokens
          .connect(account6)
          .approve(simpleNFT.address, ethers.utils.parseEther("0.030"));

        await erc20Tokens.transfer(
          account7.address,
          ethers.utils.parseEther("0.03")
        );
        await erc20Tokens
          .connect(account7)
          .approve(simpleNFT.address, ethers.utils.parseEther("0.030"));

        await simpleNFT.connect(account6).mint(3);
        await simpleNFT.connect(account7).mint(3);
        await simpleNFT.connect(account4).mint(3);
        await simpleNFT.connect(account5).mint(1);

        const balanceOfaccount4before = BigInt(
          await erc20Tokens.balanceOf(account4.address)
        );
        const balanceOfaccount5before = BigInt(
          await erc20Tokens.balanceOf(account5.address)
        );

        await simpleNFT.connect(owner).withdraw();
        const balanceOfaccount1After = BigInt(
          await erc20Tokens.balanceOf(account1.address)
        );
        console.log("balanceOfaccount1After", balanceOfaccount1After);

        expect(
          balanceOfaccount1before +
            BigInt(0.2 * ethers.utils.parseEther("0.10"))
        ).to.equal(balanceOfaccount1After);

        expect(
          balanceOfaccount1before +
            BigInt(0.2 * ethers.utils.parseEther("0.10"))
        ).to.equal(await erc20Tokens.balanceOf(account2.address));

        expect(
          balanceOfaccount1before +
            BigInt(0.2 * ethers.utils.parseEther("0.10"))
        ).to.equal(await erc20Tokens.balanceOf(account3.address));

        expect(
          balanceOfaccount4before +
            BigInt(0.2 * ethers.utils.parseEther("0.10"))
        ).to.equal(await erc20Tokens.balanceOf(account4.address));

        expect(
          balanceOfaccount5before +
            BigInt(0.2 * ethers.utils.parseEther("0.10"))
        ).to.equal(await erc20Tokens.balanceOf(account5.address));
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

      it("Should revert when non onwer tries to reveal", async function () {
        const { simpleNFT, owner, account1, account2, account3 } =
          await loadFixture(deployContract);
        await expect(simpleNFT.connect(account1).reveal()).to.be.revertedWith(
          "Ownable: caller is not the owner"
        );
      });
      it("Should revert when non owner tries setBaseURI ", async function () {
        const { simpleNFT, owner, account1, account2, account3 } =
          await loadFixture(deployContract);
        await expect(
          simpleNFT.connect(account1).setBaseURI("ipfs://baseUR/")
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("Should revert if setBaseURI is not set:", async function () {
        const { simpleNFT, erc20Tokens, owner, account1, account2, account3 } =
          await loadFixture(deployContract);
        await simpleNFT.connect(owner).setBaseURI("ipfs://baseURI/");

        await erc20Tokens
          .connect(owner)
          .approve(simpleNFT.address, ethers.utils.parseEther("0.020"));

        await simpleNFT.gift(1, account1.address);
        await simpleNFT.reveal();
        expect(await simpleNFT.tokenURI(1)).to.equal("ipfs://baseURI/1.json");
      });

      it("Should revert if setNotRevealedURI is called by non owner:", async function () {
        const { simpleNFT, owner, account1, account2, account3 } =
          await loadFixture(deployContract);
        await expect(
          simpleNFT.connect(account1).setNotRevealedURI("ipfs://baseURI/")
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("Should revert if setNotRevealedURI is called by non owner:", async function () {
        const { simpleNFT, owner, account1, account2, account3 } =
          await loadFixture(deployContract);
        await expect(
          simpleNFT.connect(account1).setNotRevealedURI("ipfs://baseURI/")
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("Should revert if setNotRevealedURI is called by non owner:", async function () {
        const { simpleNFT, owner, account1, account2, account3 } =
          await loadFixture(deployContract);
        await simpleNFT
          .connect(owner)
          .setNotRevealedURI("ipfs://setNotRevealedURItest/");
        expect(await simpleNFT.notRevealedUri()).to.equal(
          "ipfs://setNotRevealedURItest/"
        );
      });

      it("Should revert with the URI is not Correct", async function () {
        const { simpleNFT, erc20Tokens, owner, account1, account2, account3 } =
          await loadFixture(deployContract);

        await erc20Tokens.transfer(
          owner.address,
          ethers.utils.parseEther("0.03")
        );
        // more approval but less balance
        await erc20Tokens
          .connect(owner)
          .approve(simpleNFT.address, ethers.utils.parseEther("0.030"));

        await simpleNFT.connect(owner).mint(3);
        const tokenurii = await simpleNFT.tokenURI(1);
        console.log("tokenurii", tokenurii);

        expect(await simpleNFT.tokenURI(1)).to.equal("ipfs://notRevealedUri/");

        await simpleNFT.reveal();
        expect(await simpleNFT.tokenURI(1)).to.equal("ipfs://URI/1.json");
        expect(await simpleNFT.tokenURI(2)).to.equal("ipfs://URI/2.json");
      });
    });

    describe("Testing Token Ids with nftsOnwedByWallet function", function () {
      it("Should revert with the if Wrong Token id", async function () {
        const { simpleNFT, erc20Tokens, owner, account1, account2, account3 } =
          await loadFixture(deployContract);

        await erc20Tokens
          .connect(owner)
          .approve(simpleNFT.address, ethers.utils.parseEther("0.030"));
        await simpleNFT.connect(owner).mint(3);

        const ownerTokens = await simpleNFT
          .connect(owner)
          .nftsOnwedByWallet(owner.address);

        console.log("MY tokens: ", [
          ethers.BigNumber.from("1"),
          ethers.BigNumber.from("2"),
          ethers.BigNumber.from("3"),
        ]);

        console.log("ownerTokens", ...ownerTokens);

        await erc20Tokens.transfer(
          account1.address,
          ethers.utils.parseEther("0.03")
        );
        // more approval but less balance
        await erc20Tokens
          .connect(account1)
          .approve(simpleNFT.address, ethers.utils.parseEther("0.030"));

        await simpleNFT.connect(account1).mint(3);

        const account1Tokens = await simpleNFT
          .connect(account1)
          .nftsOnwedByWallet(account1.address);

        console.log("account1Tokens: ", account1Tokens);
        await erc20Tokens.transfer(
          account2.address,
          ethers.utils.parseEther("0.03")
        );
        // more approval but less balance
        await erc20Tokens
          .connect(account2)
          .approve(simpleNFT.address, ethers.utils.parseEther("0.030"));

        await simpleNFT.connect(account2).mint(3);

        const account2Tokens = await simpleNFT
          .connect(account2)
          .nftsOnwedByWallet(account2.address);

        console.log("account2Tokens: ", account2Tokens);

        await erc20Tokens.transfer(
          account3.address,
          ethers.utils.parseEther("0.01")
        );
        // more approval but less balance
        await erc20Tokens
          .connect(account3)
          .approve(simpleNFT.address, ethers.utils.parseEther("0.010"));

        await simpleNFT.connect(account3).mint(1);

        const account3Tokens = await simpleNFT
          .connect(account3)
          .nftsOnwedByWallet(account3.address);

        console.log("account3Tokens: ", account3Tokens);

        await erc20Tokens.transfer(
          account3.address,
          ethers.utils.parseEther("0.02")
        );
        // more approval but less balance
        await erc20Tokens
          .connect(account3)
          .approve(simpleNFT.address, ethers.utils.parseEther("0.020"));

        await expect(simpleNFT.connect(account3).mint(2)).to.be.revertedWith(
          "Cannot mint more than max Supply"
        );
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

    describe("Testing of Reveal Functionality", function () {
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
  describe("Testing of gift function ", function () {
    it("Validation", async function () {
      const { simpleNFT, owner, account1, account2, account3, account4 } =
        await loadFixture(deployContract);

      await expect(
        simpleNFT.connect(account1).gift(3, account3.address, {
          value: ethers.utils.parseEther("0.03"),
        })
      ).to.be.revertedWith("Ownable: caller is not the owner");
      await simpleNFT.setMintState(false);
      await expect(
        simpleNFT.gift(3, account3.address, {
          value: ethers.utils.parseEther("0.03"),
        })
      ).to.be.revertedWith("Minting is paused");
    });
    it("Should revert error when all gift are dispatched", async () => {
      //All Gift are dispatched
      const {
        simpleNFT,
        owner,
        erc20Tokens,
        account1,
        account2,
        account3,
        account4,
      } = await loadFixture(deployContract);

      await erc20Tokens
        .connect(owner)
        .approve(simpleNFT.address, ethers.utils.parseEther("1"));

      await simpleNFT.gift(3, account1.address);
      await simpleNFT.gift(3, account2.address);
      await simpleNFT.gift(3, account3.address);
      await simpleNFT.gift(1, account4.address);
      await expect(simpleNFT.gift(3, account4.address)).to.be.revertedWith(
        "All Gift are dispatched"
      );
    });
    it("Gift amount should be greater than zero", async () => {
      const { simpleNFT, account4 } = await loadFixture(deployContract);
      await expect(simpleNFT.gift(0, account4.address)).to.be.revertedWith(
        "Mint amount Cannot be zero"
      );
    });
    it("Gift amount should be greater than maxMintamount", async () => {
      const { simpleNFT, account4 } = await loadFixture(deployContract);
      await expect(simpleNFT.gift(4, account4.address)).to.be.revertedWith(
        "Cannot mint more than max mint amount"
      );
    });
    it("Gift amount cost Error", async () => {
      const { simpleNFT, erc20Tokens, owner, account1, account4 } =
        await loadFixture(deployContract);

      const balOfOwner = await erc20Tokens.balanceOf(owner.address);
      await erc20Tokens
        .connect(owner)
        .approve(simpleNFT.address, ethers.utils.parseEther("0.01"));

      await erc20Tokens.connect(owner).transfer(account1.address, balOfOwner);

      await expect(simpleNFT.gift(1, account4.address)).to.be.revertedWith(
        "Not enough Tokens"
      );
    });
    it("Gift:Cannot mint more than max Supply", async () => {
      const {
        simpleNFT,
        erc20Tokens,
        owner,
        account1,
        account2,
        account3,
        account4,
        account5,
        account6,
        account7,
      } = await loadFixture(deployContract);

      await erc20Tokens.transfer(
        account1.address,
        ethers.utils.parseEther("0.03")
      );
      await erc20Tokens
        .connect(account1)
        .approve(simpleNFT.address, ethers.utils.parseEther("0.030"));

      await erc20Tokens.transfer(
        account2.address,
        ethers.utils.parseEther("0.03")
      );
      await erc20Tokens
        .connect(account2)
        .approve(simpleNFT.address, ethers.utils.parseEther("0.030"));

      await erc20Tokens.transfer(
        account3.address,
        ethers.utils.parseEther("0.03")
      );
      await erc20Tokens
        .connect(account3)
        .approve(simpleNFT.address, ethers.utils.parseEther("0.030"));

      await erc20Tokens
        .connect(owner)
        .approve(simpleNFT.address, ethers.utils.parseEther("1"));

      await simpleNFT.gift(3, account4.address);
      await simpleNFT.gift(3, account5.address);
      await simpleNFT.gift(2, account6.address);
      //mint 0 gift 9
      await simpleNFT.mint(3);
      await simpleNFT.connect(account1).mint(3);
      await simpleNFT.connect(account2).mint(3);
      simpleNFT.connect(account3).mint(1);

      // mint 10, gift 8
      await expect(simpleNFT.gift(3, account7.address)).to.be.revertedWith(
        "Cannot mint this amount as gift"
      );
    });
  });
});
