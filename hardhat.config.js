require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
// require("@openzeppelin/hardhat-upgrades");

// import("hardhat/config").HardhatUserConfig;

require("dotenv").config();

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const GORELI_PRIVATE_KEY = process.env.GORELI_PRIVATE_KEY;

module.exports = {
  solidity: "0.8.17",
  networks: {
    hardhat: {},
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [`${process.env.GORELI_PRIVATE_KEY}`],
    },
  },
};
