require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("hardhat-contract-sizer");
require("hardhat-abi-exporter");
require("dotenv").config();
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
const RINKEBY_URL = process.env.RINKEBY_URL;
const PK = process.env.PRIVATE_KEY;
const ESK = process.env.ETHERSCAN_API_KEY;
const MUMBAI_URL = process.env.MUMBAI_URL;
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      { version: "0.8.4" },
      { version: "0.4.24" },
      { version: "0.6.6" },
      { version: "0.7.0" },
    ],
  },
  defaultNetwork: "hardhat",
  networks: {
    //absurdly high
    hardhat: {
      gas: 12000000,
      blockGasLimit: 0x1fffffffffffff,
      allowUnlimitedContractSize: true,
      timeout: 1800000,
    },
    rinkeby: {
      url: RINKEBY_URL,
      accounts: [PK],
      saveDeployments: true,
    },
    mumbai: {
      url: MUMBAI_URL,
      accounts: [PK],
      saveDeployments: true,
    },
  },
  etherscan: {
    apiKey: ESK,
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
  },
  abiExporter: {
    path: "./frontend/src/artifacts",
    clear: true,
    flat: true,
    spacing: 2,
    pretty: true,
  },
};
