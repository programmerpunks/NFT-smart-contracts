const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber, utils } = require("ethers");

describe("Mayc Contract:", function () {
  // We define a fixture to reuse the same setup in every
  async function deployContract() {
    // Contracts are deployed using the first signer/account by default
    const [owner, account1, account2, account3, account4, account5] =
      await ethers.getSigners();

    const BaycContract = await ethers.getContractFactory("BoredApeYachtClub");
    const baycContract = await BaycContract.deploy(
      "BoredApeYachtClub",
      "BAYC",
      1000,
      time.latest()
    );
    await baycContract.setBaseURI("ipfs://URI/");
    await baycContract.flipSaleState();

    const BaccContract = await ethers.getContractFactory(
      "BoredApeChemistryClub"
    );
    const baccContract = await BaccContract.deploy(
      "ipfs://BoredApeChemistryClub/"
    );

    const MaycContract = await ethers.getContractFactory("MutantApeYachtClub");
    const maycContract = await MaycContract.deploy(
      "MutantApeYachtClub",
      "MAYC",
      baycContract.address,
      baccContract.address
    );

    await baccContract.setMutationContractAddress(maycContract.address);
    return {
      baccContract,
      baycContract,
      maycContract,
      owner,
      account1,
      account2,
      account3,
      account4,
      account5,
    };
  }
  describe("Deployment", function () {
    it("Should set the right owner of Contract", async function () {
      const { maycContract, owner } = await loadFixture(deployContract);

      expect(await maycContract.owner()).to.equal(owner.address);
    });

    it("Should have totalSupply equal to zero", async function () {
      const { maycContract, owner } = await loadFixture(deployContract);

      expect(await maycContract.totalSupply()).to.equal(0);
    });
  });
  describe("startPublicSale Function", function () {
    it("Should Revert Public sale has already begun", async function () {
      const { maycContract, owner } = await loadFixture(deployContract);

      await maycContract.startPublicSale(
        2 * 86400,
        ethers.utils.parseEther("0.01")
      );
      await expect(
        maycContract.startPublicSale(2 * 86400, ethers.utils.parseEther("0.01"))
      ).to.be.revertedWith("Public sale has already begun");
    });

    it("Should be called by only owner", async function () {
      const { maycContract, owner, account1 } = await loadFixture(
        deployContract
      );
      await expect(
        maycContract
          .connect(account1)
          .startPublicSale(2 * 86400, ethers.utils.parseEther("0.01"))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("pausePublicSale Function", function () {
    it("Should Revert Public sale is not active", async function () {
      const { maycContract, owner } = await loadFixture(deployContract);

      await expect(maycContract.pausePublicSale()).to.be.revertedWith(
        "Public sale is not active"
      );
    });

    it("Non owner cannot  pause Public Sale", async function () {
      const { maycContract, owner, account1 } = await loadFixture(
        deployContract
      );
      await maycContract
        .connect(owner)
        .startPublicSale(2 * 86400, ethers.utils.parseEther("0.01"));

      await expect(
        maycContract.connect(account1).pausePublicSale()
        //   await maycContract.connect(account1).publicSaleActive()
        //   // "false"
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("Should pause Public Sale", async function () {
      const { maycContract, owner, account1 } = await loadFixture(
        deployContract
      );
      await maycContract
        .connect(owner)
        .startPublicSale(2 * 86400, ethers.utils.parseEther("0.01"));

      await maycContract.pausePublicSale();
      expect(await maycContract.connect(owner).publicSaleActive()).to.equal(
        false
      );
    });
  });

  describe("getRemainingSaleTime Function", function () {
    it("Should Revert Public sale is not active", async function () {
      const { maycContract, owner } = await loadFixture(deployContract);

      await expect(maycContract.getRemainingSaleTime()).to.be.revertedWith(
        "Public sale hasn't started yet"
      );
    });

    it("testing of all uses of function", async function () {
      const { maycContract, owner, account1 } = await loadFixture(
        deployContract
      );

      await maycContract
        .connect(owner)
        .startPublicSale(2 * 86400, ethers.utils.parseEther("0.01"));
      // increase Time by 10 sec
      let currtime = await time.latest();
      let unlockTime = currtime + 10;
      await time.increaseTo(unlockTime);
      // 2* 86400 = 172880
      // 10 sec passed = 172790
      expect(await maycContract.getRemainingSaleTime()).to.equal(172790);

      // increase Time by 3 days
      currtime = await time.latest();
      unlockTime = currtime + 3 * 86400;
      await time.increaseTo(unlockTime);
      // await time.increase(time.latest() + 2 * 86400);
      expect(await maycContract.getRemainingSaleTime()).to.equal(0);
    });
  });

  describe("mintMutants", function () {
    it("Revert mintMutants ", async function () {
      const { maycContract, owner } = await loadFixture(deployContract);
      await expect(
        maycContract.mintMutants(1, { value: ethers.utils.parseEther("0.01") })
      ).to.be.revertedWith("Public sale is not active");
    });
    it("Revert mintMutants ", async function () {
      const { maycContract, owner } = await loadFixture(deployContract);
      await expect(
        maycContract.mintMutants(1, { value: ethers.utils.parseEther("0.01") })
      ).to.be.revertedWith("Public sale is not active");

      await maycContract.startPublicSale(
        2 * 86400,
        ethers.utils.parseEther("0.01")
      );

      await maycContract.mintMutants(1, {
        value: ethers.utils.parseEther("0.01"),
      });
      await maycContract.mintMutants(1, {
        value: ethers.utils.parseEther("0.02"),
      });

      await expect(
        maycContract.mintMutants(21, {
          value: ethers.utils.parseEther("21"),
        })
      ).to.be.revertedWith("Requested number exceeds maximum");

      // let currtime = await time.latest();
      // let unlockTime = currtime + 9 * 86400;
      // await time.increaseTo(unlockTime);
      // await maycContract.setStartingIndices();

      await maycContract.mintMutants(1, {
        value: ethers.utils.parseEther("0.01"),
      });

      await maycContract.mintMutants(1, {
        value: ethers.utils.parseEther("0.01"),
      });
    });
    it("Boundry Testing ", async function () {
      const { maycContract, owner } = await loadFixture(deployContract);
      await expect(
        maycContract.mintMutants(1, { value: ethers.utils.parseEther("0.01") })
      ).to.be.revertedWith("Public sale is not active");

      // await maycContract.startPublicSale(
      //   2 * 86400,
      //   ethers.utils.parseEther("0.01")
      // );

      // await maycContract.mintMutants(1, {
      //   value: ethers.utils.parseEther("0.01"),
      // });
    });
  });

  describe("mutateApeWithSerum ", function () {
    it("Revert Serum Mutation is not active ", async function () {
      const { baccContract, maycContract, baycContract, owner, account1 } =
        await loadFixture(deployContract);
      await expect(maycContract.mutateApeWithSerum(1, 1)).to.be.revertedWith(
        "Serum Mutation is not active"
      );
      // active serum Mutation
      await maycContract.toggleSerumMutationActive();

      // mint Apes and then mutate
      await baycContract
        .connect(account1)
        .mintApe(1, { value: ethers.utils.parseEther("0.08") });
      // mutating token Id 0
      await expect(maycContract.mutateApeWithSerum(1, 0)).to.be.revertedWith(
        "Must own the ape you're attempting to mutate"
      );

      await baccContract.mintBatch([0, 1, 69], [10, 10, 10]);
      await baccContract.safeBatchTransferFrom(
        owner.address,
        account1.address,
        [0, 1, 69],
        [10, 10, 10],
        []
      );
      await maycContract.connect(account1).mutateApeWithSerum(69, 0);
      await maycContract.connect(account1).mutateApeWithSerum(1, 0);

      await expect(
        maycContract.connect(account1).mutateApeWithSerum(69, 0)
      ).to.be.revertedWith("Ape already mutated with MEGA MUTATION SERUM");
      await expect(
        maycContract.connect(account1).mutateApeWithSerum(1, 0)
      ).to.be.revertedWith("Ape already mutated with this type of serum");
    });
  });

  describe("getMutantIdForApeAndSerumCombination function ", function () {
    it("Revert Serum Mutation is not active ", async function () {
      const { baccContract, maycContract, baycContract, owner, account1 } =
        await loadFixture(deployContract);

      // active serum Mutation
      await maycContract.toggleSerumMutationActive();

      // mint Apes and then mutate
      await baycContract
        .connect(account1)
        .mintApe(1, { value: ethers.utils.parseEther("0.08") });
      // mutating token Id 0

      await baccContract.mintBatch([0, 1, 69], [10, 10, 10]);
      await baccContract.safeBatchTransferFrom(
        owner.address,
        account1.address,
        [0, 1, 69],
        [10, 10, 10],
        []
      );
      // getMutantIdForApeAndSerumCombination

      await expect(
        maycContract
          .connect(account1)
          .getMutantIdForApeAndSerumCombination(0, 69)
      ).to.be.revertedWith("Invalid MEGA Mutant Id");

      await expect(
        maycContract
          .connect(account1)
          .getMutantIdForApeAndSerumCombination(0, 1)
      ).to.be.revertedWith("Query for nonexistent mutant");

      await maycContract.connect(account1).mutateApeWithSerum(69, 0);
      await maycContract.connect(account1).mutateApeWithSerum(1, 0);

      expect(await maycContract.hasApeBeenMutatedWithType(1, 0)).to.equal(true);
      expect(await maycContract.hasApeBeenMutatedWithType(69, 0)).to.equal(
        true
      );

      expect(
        await maycContract
          .connect(account1)
          .getMutantIdForApeAndSerumCombination(0, 69)
      ).to.equal(30000);

      // await maycContract
      //   .connect(account1)
      //   .getMutantIdForApeAndSerumCombination(0, 69);
      // await maycContract
      //   .connect(account1)
      //   .getMutantIdForApeAndSerumCombination(0, 1);
      //   await maycContract
      //     .connect(account1)
      //     .getMutantIdForApeAndSerumCombination(0, 0);
    });
  });

  describe("getMintPrice function", function () {
    it("should return correct initial PS_MUTANT_ENDING_PRICE", async function () {
      const { maycContract, owner } = await loadFixture(deployContract);

      await maycContract.startPublicSale(
        2 * 86400,
        ethers.utils.parseEther("0.001")
      );
      currtime = await time.latest();
      let unlockTime = currtime + 3 * 86400;
      await time.increaseTo(unlockTime);
      const PS_MUTANT_ENDING_PRICE = ethers.utils.parseEther("0.01");
      expect(await maycContract.getMintPrice()).to.equal(
        PS_MUTANT_ENDING_PRICE
      );
    });
    it("should return correct new currentPrice", async function () {
      const { maycContract, owner } = await loadFixture(deployContract);

      await maycContract.startPublicSale(
        2 * 86400,
        ethers.utils.parseEther("1")
      );

      currtime = await time.latest();
      let unlockTime = currtime + 1 * 86400;
      await time.increaseTo(unlockTime);
      // since half time has passed so half the price
      const PS_MUTANT_ENDING_PRICE = ethers.utils.parseEther("0.5");
      expect(await maycContract.getMintPrice()).to.equal(
        PS_MUTANT_ENDING_PRICE
      );

      currtime = await time.latest();
      unlockTime = currtime + 1 * 86400;
      await time.increaseTo(unlockTime);
      expect(await maycContract.getMintPrice()).to.equal(
        ethers.utils.parseEther("0.01")
      );

      await maycContract.pausePublicSale();
      await expect(maycContract.getMintPrice()).to.be.revertedWith(
        // ethers.utils.parseEther("0.01")
        "Public sale is not active"
      );
    });
  });
  describe("isMinted function", function () {
    it("is minted Function validations", async function () {
      const {
        baccContract,
        maycContract,
        baycContract,
        owner,
        account1,
        account2,
      } = await loadFixture(deployContract);
      // active serum Mutation
      await maycContract.toggleSerumMutationActive();

      // mint Apes and then mutate
      await baycContract
        .connect(account1)
        .mintApe(1, { value: ethers.utils.parseEther("0.08") });

      await baycContract
        .connect(account2)
        .mintApe(1, { value: ethers.utils.parseEther("0.08") });
      // mutating token Id 0

      await baccContract.mintBatch([0, 1, 69], [10, 10, 10]);
      await baccContract.safeBatchTransferFrom(
        owner.address,
        account1.address,
        [0, 1, 69],
        [5, 5, 5],
        []
      );
      await baccContract.safeBatchTransferFrom(
        owner.address,
        account2.address,
        [0, 1, 69],
        [5, 5, 5],
        []
      );
      // getMutantIdForApeAndSerumCombination

      await maycContract.connect(account1).mutateApeWithSerum(69, 0);
      await maycContract.connect(account1).mutateApeWithSerum(1, 0);

      await maycContract.connect(account2).mutateApeWithSerum(69, 1);
      await maycContract.connect(account2).mutateApeWithSerum(1, 1);

      await expect(maycContract.isMinted(30008)).to.be.revertedWith(
        "tokenId outside collection bounds"
      );

      expect(await maycContract.isMinted(10001)).to.equal(true);
      // (apeId * NUM_MUTANT_TYPES) + serumType + SERUM_MUTATION_OFFSET;
      //  1*2 + 1+10000 =10003
      expect(await maycContract.isMinted(10003)).to.equal(true);
      expect(await maycContract.isMinted(30000)).to.equal(true);
      expect(await maycContract.isMinted(30001)).to.equal(true);
      const tokensowned = await maycContract.nftsOnwedByWallet(
        account1.address
      );
      console.log("tokensowned", tokensowned);
      const tokensowned2 = await maycContract.nftsOnwedByWallet(
        account2.address
      );
      console.log("tokensowned2", tokensowned2);

      expect(await maycContract.totalApesMutated()).to.equal(4);
    });
  });

  describe("getMutantId function", function () {
    it("Validationsss", async function () {
      const { baccContract, maycContract, baycContract, owner, account1 } =
        await loadFixture(deployContract);
      // active serum Mutation
      await maycContract.toggleSerumMutationActive();

      // mint Apes and then mutate
      await baycContract
        .connect(account1)
        .mintApe(1, { value: ethers.utils.parseEther("0.08") });
      // mutating token Id 0

      await baccContract.mintBatch([0, 1, 69], [10, 10, 10]);
      await baccContract.safeBatchTransferFrom(
        owner.address,
        account1.address,
        [0, 1, 69],
        [10, 10, 10],
        []
      );
      // getMutantIdForApeAndSerumCombination

      await maycContract.connect(account1).mutateApeWithSerum(69, 0);
      await maycContract.connect(account1).mutateApeWithSerum(1, 0);
    });
  });

  describe("togglePublicSaleActive function", function () {
    it("OnlyOwner Validation & Function testing", async function () {
      const { baccContract, maycContract, baycContract, owner, account1 } =
        await loadFixture(deployContract);
      // Toggle publicSaleActive

      await expect(
        maycContract.connect(account1).togglePublicSaleActive()
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await maycContract
        .connect(owner)
        .startPublicSale(2 * 86400, ethers.utils.parseEther("0.01"));
      await maycContract.connect(owner).togglePublicSaleActive();
      expect(await maycContract.connect(account1).publicSaleActive()).to.equal(
        false
      );
    });
  });

  describe("setBaseURI", function () {
    it("onlyOwner Validation", async function () {
      const {
        baccContract,
        baycContract,
        maycContract,
        owner,
        account1,
        account2,
        account3,
      } = await loadFixture(deployContract);

      await expect(
        baycContract.connect(account1).setBaseURI("ipfs://mayc/")
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should set correct  baseuri", async function () {
      const {
        baccContract,
        baycContract,
        maycContract,
        owner,
        account1,
        account2,
        account3,
      } = await loadFixture(deployContract);

      // active serum Mutation
      await maycContract.toggleSerumMutationActive();

      // mint Apes and then mutate
      await baycContract
        .connect(account1)
        .mintApe(1, { value: ethers.utils.parseEther("0.08") });

      await baycContract
        .connect(account2)
        .mintApe(1, { value: ethers.utils.parseEther("0.08") });

      await baccContract.mintBatch([0, 1, 69], [10, 10, 10]);
      await baccContract.safeBatchTransferFrom(
        owner.address,
        account1.address,
        [0, 1, 69],
        [5, 5, 5],
        []
      );
      await baccContract.safeBatchTransferFrom(
        owner.address,
        account2.address,
        [0, 1, 69],
        [5, 5, 5],
        []
      );
      // getMutantIdForApeAndSerumCombination

      // mutating token Id 0
      await maycContract.connect(account1).mutateApeWithSerum(69, 0);
      await maycContract.connect(account1).mutateApeWithSerum(1, 0);

      // mutating token Id 1
      await maycContract.connect(account2).mutateApeWithSerum(69, 1);
      await maycContract.connect(account2).mutateApeWithSerum(1, 1);
      await expect(maycContract.tokenURI(0)).to.be.rejectedWith(
        "ERC721: invalid token ID"
      );
      // expect(
      // ).to.be.revertedWith();
      expect(await maycContract.isMinted(10001)).to.equal(true);

      expect(await maycContract.tokenURI(10001)).to.equal("");
      await maycContract.connect(owner).setBaseURI("ipfs://mayc/");
      expect(await maycContract.tokenURI(10001)).to.equal("ipfs://mayc/10001");
      await expect(
        maycContract.connect(account1).setBaseURI("ipfs://mayc/")
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await expect(
        maycContract.connect(account1).toggleSerumMutationActive()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
  describe("setStartingIndices functions", function () {
    it("should set starting indices correctly", async function () {
      const {
        baccContract,
        baycContract,
        maycContract,
        owner,
        account1,
        account2,
        account3,
      } = await loadFixture(deployContract);

      await expect(maycContract.setStartingIndices()).to.be.revertedWith(
        "Starting index block must be set"
      );

      // active serum Mutation
      await maycContract.toggleSerumMutationActive();

      // start publicSaleActive
      await maycContract
        .connect(owner)
        .startPublicSale(2 * 86400, ethers.utils.parseEther("0.01"));
      // mint Mutants
      await maycContract
        .connect(account1)
        .mintMutants(1, { value: ethers.utils.parseEther("0.01") });

      await expect(maycContract.setStartingIndices()).to.be.revertedWith(
        "Invalid setStartingIndices conditions"
      );

      let currtime = await time.latest();
      let endPublicSale = currtime + 2 * 86400;
      await time.increaseTo(endPublicSale);

      await maycContract.setStartingIndices();

      await expect(maycContract.setStartingIndices()).to.be.revertedWith(
        "Minted Mutants starting index is already set"
      );
    });
  });

  describe("WithDraw function", function () {
    it("is minted Function validations", async function () {
      const {
        baccContract,
        maycContract,
        baycContract,
        owner,
        account1,
        account2,
      } = await loadFixture(deployContract);
      // active serum Mutation
      await maycContract.toggleSerumMutationActive();

      // mint Apes and then mutate
      await baycContract
        .connect(account1)
        .mintApe(1, { value: ethers.utils.parseEther("0.08") });

      await baycContract
        .connect(account2)
        .mintApe(1, { value: ethers.utils.parseEther("0.08") });
      // mutating token Id 0

      await baccContract.mintBatch([0, 1, 69], [10, 10, 10]);
      await baccContract.safeBatchTransferFrom(
        owner.address,
        account1.address,
        [0, 1, 69],
        [5, 5, 5],
        []
      );
      await baccContract.safeBatchTransferFrom(
        owner.address,
        account2.address,
        [0, 1, 69],
        [5, 5, 5],
        []
      );
      // getMutantIdForApeAndSerumCombination

      await maycContract.connect(account1).mutateApeWithSerum(69, 0);
      await maycContract.connect(account1).mutateApeWithSerum(1, 0);

      await maycContract.connect(account2).mutateApeWithSerum(69, 1);
      await maycContract.connect(account2).mutateApeWithSerum(1, 1);

      let balanceOfMaycbefore = await ethers.provider.getBalance(
        maycContract.address
      );

      expect(balanceOfMaycbefore).to.equal(0);
      await maycContract.startPublicSale(
        2 * 86400,
        ethers.utils.parseEther("0.01")
      );

      await maycContract.mintMutants(1, {
        value: ethers.utils.parseEther("0.01"),
      });

      await maycContract.connect(account1).mintMutants(1, {
        value: ethers.utils.parseEther("0.01"),
      });

      await maycContract.connect(account2).mintMutants(1, {
        value: ethers.utils.parseEther("0.01"),
      });

      let currtime = await time.latest();
      let unlockTime = currtime + 10;
      await time.increaseTo(unlockTime);

      balanceOfOwnerbefore = BigInt(
        await ethers.provider.getBalance(owner.address)
      );
      console.log("balanceOfMaycbefore", balanceOfMaycbefore);
      // withdraw called
      await expect(
        await maycContract.connect(owner).withdraw()
      ).to.changeEtherBalance(owner, ethers.utils.parseEther("0.03"));

      await expect(
        maycContract.connect(account1).withdraw()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("BACC Contract Testing", function () {
    describe("updateBaseUri & Uri Testing", function () {
      it("Testing & Validations", async function () {
        const {
          baccContract,
          maycContract,
          baycContract,
          owner,
          account1,
          account2,
        } = await loadFixture(deployContract);

        await expect(
          baccContract.connect(account1).updateBaseUri("ipfs://UpdateBaseUri")
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
      it("Should revert with the if balance of contract is zero", async function () {
        const {
          baccContract,
          maycContract,
          baycContract,
          owner,
          account1,
          account2,
        } = await loadFixture(deployContract);

        await expect(
          baccContract.connect(account1).mintBatch([0, 1, 69], [10, 10, 10])
        ).to.be.revertedWith("Ownable: caller is not the owner");

        await expect(
          baccContract
            .connect(account2)
            .setMutationContractAddress(maycContract.address)
        ).to.be.revertedWith("Ownable: caller is not the owner");

        await baccContract.mintBatch([0, 1, 69], [10, 10, 10]);
        await baccContract.safeBatchTransferFrom(
          owner.address,
          account1.address,
          [0, 1, 69],
          [5, 5, 5],
          []
        );
        await baccContract.safeBatchTransferFrom(
          owner.address,
          account2.address,
          [0, 1, 69],
          [5, 5, 5],
          []
        );

        const data = await baccContract.connect(account1).uri(1);
        console.log("data", data);
        await baccContract
          .connect(owner)
          .updateBaseUri("ipfs://UpdateBaseUri/");

        expect(await baccContract.connect(account1).uri(1)).to.equal(
          "ipfs://UpdateBaseUri/1"
        );

        await expect(baccContract.connect(account1).uri(3)).to.be.revertedWith(
          "URI requested for invalid serum type"
        );

        await expect(
          baccContract.burnSerumForAddress(0, account1.address)
        ).to.be.revertedWith("Invalid burner address");
      });
    });
  });
});
