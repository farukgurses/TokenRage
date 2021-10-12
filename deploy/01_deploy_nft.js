// const { ethers } = require("hardhat");
const { networkConfig } = require("../config");

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  log("--------------------------------");
  const NFT = await deploy("NFT", {
    from: deployer,
    log: true,
  });

  log(`NFT contract is deployed to: ${NFT.address}`);

  const nftContract = await ethers.getContractFactory("NFT");
  const accounts = await hre.ethers.getSigners();
  const signer = accounts[0];

  const nft = new ethers.Contract(NFT.address, nftContract.interface, signer);
  const networkName = networkConfig[chainId]["name"];
  log(
    `Verify with: \n npx hardhat verify --network ${networkName} ${nft.address}`
  );

  const transactionResponse = await nft.create("BARO");
  const receipt = await transactionResponse.wait(1);
  log(`NFT minted`);
  log(`Token URL: ${await nft.tokenURI(0)}`);
};
