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
    // Contracts are deployed using the first signer/account5 by default
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

describe("StakingNFT contract", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContract() {
    // Contracts are deployed using the first signer/account5 by default
    const [owner, account1, account2, account3, account4, account5] =
      await ethers.getSigners();
    // simpleNFTs
    const SimpleNFT = await ethers.getContractFactory("simpleNFT");
    const simpleNFT = await SimpleNFT.deploy("Test", "test", "ipfs://URI/");
    await simpleNFT.setMintState(true);

    const Erc20Tokens = await ethers.getContractFactory("ERC20Tokens");
    const erc20Tokens = await Erc20Tokens.deploy("TestTokens", "$TT");

    const StakingNFTs = await ethers.getContractFactory("StakingNFTs");
    const stakingNFTs = await StakingNFTs.deploy(
      simpleNFT.address,
      erc20Tokens.address
    );
    return {
      simpleNFT,
      erc20Tokens,
      stakingNFTs,
      owner,
      account1,
      account2,
      account3,
      account4,
      account5,
    };
  }
  async function deployContract2() {
    // Contracts are deployed using the first signer/account5 by default
    const [owner, account1] = await ethers.getSigners();

    const Erc20Tokens = await ethers.getContractFactory("ERC20Tokens");
    const erc20Tokens = await Erc20Tokens.deploy("TestTokens", "$TT");

    const StakingNFTs = await ethers.getContractFactory("StakingNFTs");
    const stakingNFTs = await StakingNFTs.deploy(
      ethers.constants.AddressZero,
      erc20Tokens.address
    );
    return {
      erc20Tokens,
      stakingNFTs,
      owner,
      account1,
    };
  }
  describe("Deployment", function () {
    it("Should revert when address is null", async function () {
      await expect(loadFixture(deployContract2)).to.be.revertedWith(
        "Token Address cannot be address 0"
      );
    });
    it("Should set the right owner of Contract", async function () {
      const { simpleNFT, erc20Tokens, stakingNFTs, owner } = await loadFixture(
        deployContract
      );

      expect(await simpleNFT.owner()).to.equal(owner.address);
      expect(await erc20Tokens.owner()).to.equal(owner.address);
      expect(await stakingNFTs.owner()).to.equal(owner.address);
    });

    it("Should have totalSupply equal to zero for nfts and   ", async function () {
      const { simpleNFT, owner } = await loadFixture(deployContract);
      expect(await simpleNFT.totalSupply()).to.equal(0);
    });
    it("all erc20 supply is owned by owners", async function () {
      const { erc20Tokens, owner } = await loadFixture(deployContract);
      const ownerBalance = await erc20Tokens.balanceOf(owner.address);
      expect(await erc20Tokens.totalSupply()).to.equal(ownerBalance);
    });
    it("Total Skated tokens to be equal to zero for nfts and ", async function () {
      const { stakingNFTs, owner } = await loadFixture(deployContract);
      expect(await stakingNFTs.totalStaked()).to.equal(0);
    });
  });
  describe("StakeTokens Functions", function () {
    it("Should revert as token id doesn't exist", async function () {
      const { stakingNFTs, simpleNFT, erc20Tokens, owner } = await loadFixture(
        deployContract
      );

      await expect(stakingNFTs.stakeTokens(0)).to.be.revertedWith(
        "ERC721: invalid token ID"
      );
    });

    it("Should revert as non owner tries to stake", async function () {
      const { stakingNFTs, simpleNFT, erc20Tokens, owner, account1 } =
        await loadFixture(deployContract);
      await simpleNFT.mint(1, { value: ethers.utils.parseEther("0.01") });
      await expect(
        stakingNFTs.connect(account1).stakeTokens(1)
      ).to.be.revertedWith("caller is not the owner of this NFT");
    });

    it("Should revert as token not approved by owner", async function () {
      const { stakingNFTs, simpleNFT, erc20Tokens, owner, account1 } =
        await loadFixture(deployContract);
      await simpleNFT.mint(1, { value: ethers.utils.parseEther("0.01") });

      await expect(
        stakingNFTs.connect(owner).stakeTokens(1)
      ).to.be.revertedWith("Approval for this NFT token is denied");
    });
    it("All testings of Functios", async function () {
      const { stakingNFTs, simpleNFT, erc20Tokens, owner, account1 } =
        await loadFixture(deployContract);
      await simpleNFT.mint(1, { value: ethers.utils.parseEther("0.01") });

      await simpleNFT.approve(stakingNFTs.address, 1);
      // await expect(stakingNFTs.connect(owner).stakeTokens(1))
      //   .emit(stakingNFTs, "Staked")
      //   .withArgs(owner.address, time.latest(), 0);
      // await stakingNFTs.connect(owner).stakeTokens(1);
      const currenttime = await time.latest();
      const latestBlock = await hre.ethers.provider.getBlock("latest");
      const timeStamp = (await ethers.provider.getBlock("latest")).timestamp;
      await expect(stakingNFTs.connect(owner).stakeTokens(1))
        .to.emit(stakingNFTs, "Staked")
        .withArgs(owner.address, timeStamp + 1, 1);
      // Toask: block.timestamp ? latestBlock ?

      await expect(
        stakingNFTs.connect(owner).stakeTokens(1)
      ).to.be.revertedWith("You have already staked this token");

      await expect(
        stakingNFTs.connect(account1).stakeTokens(1)
      ).to.be.revertedWith("caller is not the owner of this NFT");
    });
  });

  describe("unStakeTokens Functions", function () {
    it("Should revert as when an non owner tries to unstake a token or token is not staked", async function () {
      const { stakingNFTs, simpleNFT, erc20Tokens, owner, account1 } =
        await loadFixture(deployContract);
      await simpleNFT.mint(1, { value: ethers.utils.parseEther("0.01") });

      await simpleNFT.approve(stakingNFTs.address, 1);
      await expect(
        stakingNFTs.connect(account1).unStakeTokens(1)
      ).to.be.revertedWith(
        "caller is not the owner of this NFT or This token is not Staked"
      );
      await stakingNFTs.connect(owner).stakeTokens(1);

      await expect(
        stakingNFTs.connect(account1).unStakeTokens(1)
      ).to.be.revertedWith(
        "caller is not the owner of this NFT or This token is not Staked"
      );
    });
    it("Should revert if token not transfered back to its original user", async function () {
      const { stakingNFTs, simpleNFT, erc20Tokens, owner, account1 } =
        await loadFixture(deployContract);

      const erc20TokensAccount1 = await erc20Tokens.balanceOf(account1.address);
      await simpleNFT
        .connect(account1)
        .mint(1, { value: ethers.utils.parseEther("0.01") });

      await simpleNFT.connect(account1).approve(stakingNFTs.address, 1);
      // stake token 1
      await stakingNFTs.connect(account1).stakeTokens(1);

      // owner of token 1 is stakingcontract
      expect(await simpleNFT.ownerOf(1)).to.equal(stakingNFTs.address);
      // await stakingNFTs.connect(account1).unStakeTokens(1);

      const timeStamp = (await ethers.provider.getBlock("latest")).timestamp;
      await expect(stakingNFTs.connect(account1).unStakeTokens(1))
        .to.emit(stakingNFTs, "UnStaked")
        .withArgs(account1.address, timeStamp + 1, 1);
      // owner of token 1 is original owner which is Account1
      expect(await simpleNFT.ownerOf(1)).to.equal(account1.address);
      expect(await erc20Tokens.balanceOf(account1.address)).to.equal(
        erc20TokensAccount1
      );
    });
    it("Should revert if token not transfered back to its original user after 7Days", async function () {
      const { stakingNFTs, simpleNFT, erc20Tokens, owner, account1 } =
        await loadFixture(deployContract);

      const erc20TokensAccount1 = await erc20Tokens.balanceOf(account1.address);
      await simpleNFT
        .connect(account1)
        .mint(1, { value: ethers.utils.parseEther("0.01") });

      await simpleNFT.connect(account1).approve(stakingNFTs.address, 1);
      // stake token 1
      await stakingNFTs.connect(account1).stakeTokens(1);

      // owner of token 1 is stakingcontract
      expect(await simpleNFT.ownerOf(1)).to.equal(stakingNFTs.address);
      // await stakingNFTs.connect(account1).unStakeTokens(1);

      let currtime = await time.latest();
      let days7 = currtime + 7 * 86400;
      await time.increaseTo(days7);

      const timeStamp = (await ethers.provider.getBlock("latest")).timestamp;
      await expect(stakingNFTs.connect(account1).unStakeTokens(1))
        .to.emit(stakingNFTs, "UnStaked")
        .withArgs(account1.address, timeStamp + 1, 1);
      // owner of token 1 is original owner which is Account1
      expect(await simpleNFT.ownerOf(1)).to.equal(account1.address);
      expect(await erc20Tokens.balanceOf(account1.address)).to.equal(
        erc20TokensAccount1
      );
    });
  });
  describe("claimDailyRewards function", function () {
    it("Should revert if any erc20tokens transfer before 7 days", async function () {
      const { stakingNFTs, simpleNFT, erc20Tokens, owner, account1 } =
        await loadFixture(deployContract);

      const erc20TokensAccount1 = await erc20Tokens.balanceOf(account1.address);
      await simpleNFT
        .connect(account1)
        .mint(1, { value: ethers.utils.parseEther("0.01") });

      await simpleNFT.connect(account1).approve(stakingNFTs.address, 1);
      // stake token 1
      await stakingNFTs.connect(account1).stakeTokens(1);

      // owner of token 1 is stakingcontract
      expect(await simpleNFT.ownerOf(1)).to.equal(stakingNFTs.address);
      // await stakingNFTs.connect(account1).unStakeTokens(1);

      let currtime = await time.latest();
      let days6 = currtime + 6 * 86400 + 86300;
      await time.increaseTo(days6);

      await expect(
        await stakingNFTs.connect(account1).unStakeTokens(1)
      ).to.changeTokenBalance(erc20Tokens, account1, 0);

      expect(await erc20Tokens.balanceOf(account1.address)).to.equal(
        erc20TokensAccount1
      );
    });
    it("claim & unstake after 7 days", async function () {
      const { stakingNFTs, simpleNFT, erc20Tokens, owner, account1 } =
        await loadFixture(deployContract);

      await simpleNFT
        .connect(account1)
        .mint(1, { value: ethers.utils.parseEther("0.01") });

      await simpleNFT.connect(account1).approve(stakingNFTs.address, 1);
      // stake token 1
      await stakingNFTs.connect(account1).stakeTokens(1);

      await expect(
        stakingNFTs.connect(account1).claimDailyRewards(1)
      ).to.be.revertedWith(
        "Day passed should be greater than 7 to claim the reward"

        // "Reward Tokens Not Available Right Now"
      );

      let currtime = await time.latest();
      let days7 = currtime + 7 * 86400;
      await time.increaseTo(days7);

      await expect(
        stakingNFTs.connect(account1).claimDailyRewards(1)
      ).to.be.revertedWith("Reward Tokens Not Available Right Now");

      await erc20Tokens.transfer(
        stakingNFTs.address,
        ethers.utils.parseEther("1000")
      );

      const balOfStakingNFT = await erc20Tokens.balanceOf(stakingNFTs.address);
      console.log("################################", balOfStakingNFT);

      await expect(
        stakingNFTs.connect(owner).claimDailyRewards(1)
      ).to.be.revertedWith(
        "caller has not the staked this NFT"
        // "Reward Tokens Not Available Right Now"
      );
      await expect(
        await stakingNFTs.connect(account1).claimDailyRewards(1)
      ).to.changeTokenBalance(
        erc20Tokens,
        account1,
        ethers.utils.parseEther("70")
      );
      await expect(
        await stakingNFTs.connect(account1).unStakeTokens(1)
      ).to.changeTokenBalance(erc20Tokens, account1, 0);
    });
    it("unstake & claim reward after 7 days", async function () {
      const { stakingNFTs, simpleNFT, erc20Tokens, owner, account1 } =
        await loadFixture(deployContract);

      await simpleNFT
        .connect(account1)
        .mint(1, { value: ethers.utils.parseEther("0.01") });

      await simpleNFT.connect(account1).approve(stakingNFTs.address, 1);
      // stake token 1
      await stakingNFTs.connect(account1).stakeTokens(1);

      let currtime = await time.latest();
      let days7 = currtime + 7 * 86400;
      await time.increaseTo(days7);

      await expect(
        await stakingNFTs.connect(account1).unStakeTokens(1)
      ).to.changeTokenBalance(erc20Tokens, account1, 0);

      await expect(
        stakingNFTs.connect(account1).claimDailyRewards(1)
      ).to.be.revertedWith("Reward Tokens Not Available Right Now");

      await erc20Tokens.transfer(
        stakingNFTs.address,
        ethers.utils.parseEther("1000")
      );
      const balOfStakingNFT = await erc20Tokens.balanceOf(stakingNFTs.address);
      console.log("################################", balOfStakingNFT);
      await expect(
        await stakingNFTs.connect(account1).claimDailyRewards(1)
      ).to.changeTokenBalance(
        erc20Tokens,
        account1,
        ethers.utils.parseEther("70")
      );

      await expect(
        stakingNFTs.connect(account1).claimDailyRewards(1)
      ).to.be.revertedWith("No Unclaimed Reward is there to be claimed");

      await expect(
        stakingNFTs.connect(owner).claimDailyRewards(1)
      ).to.be.revertedWith("caller has not the staked this NFT");
    });
  });

  describe("earningInfo function", function () {
    it("Validation", async function () {
      const { stakingNFTs, simpleNFT, erc20Tokens, owner, account1 } =
        await loadFixture(deployContract);

      // let { startTime, amountClaimed, rewardCreated, dayPassed, tokenOwner }
      // let{ stakingNFTs, simpleNFT, erc20Tokens, owner, account1 } = await loadFixture(deployContract);
      // let data = ({
      //   startTimeTest: startTime,
      //   amountClaimedTest: amountClaimed,
      //   rewardCreatedTest: rewardCreated,
      //   dayPassedTest: dayPassed,
      //   tokenOwnerTest: tokenOwner,
      // } = await stakingNFTs.connect(account1).earningInfo(1));

      const data = await stakingNFTs.connect(account1).earningInfo(1);
      console.log("Data1: " + data);

      await simpleNFT
        .connect(account1)
        .mint(1, { value: ethers.utils.parseEther("0.01") });

      await simpleNFT.connect(account1).approve(stakingNFTs.address, 1);
      // stake token 1
      await stakingNFTs.connect(account1).stakeTokens(1);

      let currtime = await time.latest();
      let days7 = currtime + 3 * 86400;
      await time.increaseTo(days7);

      const data2 = await stakingNFTs.connect(account1).earningInfo(1);
      console.log("Data2: " + data2);

      currtime = await time.latest();
      days7 = currtime + 4 * 86400;
      await time.increaseTo(days7);

      const data3 = await stakingNFTs.connect(account1).earningInfo(1);
      console.log("Data3: " + data3);

      await expect(
        await stakingNFTs.connect(account1).unStakeTokens(1)
      ).to.changeTokenBalance(erc20Tokens, account1, 0);

      const data4 = await stakingNFTs.connect(account1).earningInfo(1);
      console.log("Data4: " + data4);

      await expect(
        stakingNFTs.connect(account1).claimDailyRewards(1)
      ).to.be.revertedWith("Reward Tokens Not Available Right Now");

      await erc20Tokens.transfer(
        stakingNFTs.address,
        ethers.utils.parseEther("1000")
      );
      // const balOfStakingNFT = await erc20Tokens.balanceOf(stakingNFTs.address);
      // console.log("################################", balOfStakingNFT);
      await expect(
        await stakingNFTs.connect(account1).claimDailyRewards(1)
      ).to.changeTokenBalance(
        erc20Tokens,
        account1,
        ethers.utils.parseEther("70")
      );

      const data5 = await stakingNFTs.connect(account1).earningInfo(1);
      console.log("Data5: " + data5);

      await expect(
        stakingNFTs.connect(account1).claimDailyRewards(1)
      ).to.be.revertedWith("No Unclaimed Reward is there to be claimed");

      await expect(
        stakingNFTs.connect(owner).claimDailyRewards(1)
      ).to.be.revertedWith("caller has not the staked this NFT");
    });
  });
});

// TODO: no rewarding tokenss.... and claim
//
// unstake immediately : done
// unstake after 7 days : done
// claim immediately :done
// claim after 7 days : done
// claim & unstake after 7 days :Done
// unstake & claim after 7 days :Fone
