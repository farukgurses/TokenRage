let { networkConfig, getNetworkIdFromName } = require("../config");
const fs = require("fs");

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy, get, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();
  let linkTokenAddress;
  let vrfCoordinatorAddress;

  if (chainId == 31337) {
    let linkToken = await get("LinkToken");
    let VRFCoordinatorMock = await get("VRFCoordinatorMock");
    linkTokenAddress = linkToken.address;
    vrfCoordinatorAddress = VRFCoordinatorMock.address;
    additionalMessage = " --linkaddress " + linkTokenAddress;
  } else {
    linkTokenAddress = networkConfig[chainId]["linkToken"];
    vrfCoordinatorAddress = networkConfig[chainId]["vrfCoordinator"];
  }
  const keyHash = networkConfig[chainId]["keyHash"];
  const fee = networkConfig[chainId]["fee"];
  let args = [vrfCoordinatorAddress, linkTokenAddress, keyHash, fee];
  log("----------------------------------------------------");
  const RandomSVG = await deploy("NFT", {
    from: deployer,
    args: args,
    log: true,
  });
  log(`You have deployed an NFT contract to ${RandomSVG.address}`);
  const networkName = networkConfig[chainId]["name"];
  log(
    `Verify with:\n npx hardhat verify --network ${networkName} ${
      RandomSVG.address
    } ${args.toString().replace(/,/g, " ")}`
  );
  const RandomSVGContract = await ethers.getContractFactory("NFT");
  const accounts = await hre.ethers.getSigners();
  const signer = accounts[0];
  const randomSVG = new ethers.Contract(
    RandomSVG.address,
    RandomSVGContract.interface,
    signer
  );

  // fund with LINK
  let networkId = await getNetworkIdFromName(network.name);
  const fundAmount = networkConfig[networkId]["fundAmount"];
  const linkTokenContract = await ethers.getContractFactory("LinkToken");
  const linkToken = new ethers.Contract(
    linkTokenAddress,
    linkTokenContract.interface,
    signer
  );
  let fund_tx = await linkToken.transfer(RandomSVG.address, fundAmount);
  await fund_tx.wait(1);
  // await new Promise(r => setTimeout(r, 5000))
  log("Let's create two NFTs now!");
  let tx = await randomSVG.create({ gasLimit: 300000 });
  let receipt = await tx.wait(1);
  tx = await randomSVG.create({ gasLimit: 300000 });
  let receipt2 = await tx.wait(1);
  let tokenId1 = receipt.events[3].topics[2];
  let tokenId2 = receipt2.events[3].topics[2];
  log(`You've made your NFTs!
  This is number ${tokenId1}
  This is number ${tokenId2}
  `);
  log("Let's wait for the Chainlink VRF node to respond...");

  if (chainId != 31337) {
    await new Promise((r) => setTimeout(r, 180000));
    log(`Now let's finsih the mint...`);
    tx = await randomSVG.finishMint(tokenId1, { gasLimit: 4444444 });
    await tx.wait(1);
    tx = await randomSVG.finishMint(tokenId2, { gasLimit: 4444444 });
    await tx.wait(1);
    log(`You can view the tokenURIs here:
     1: ${await randomSVG.tokenURI(tokenId1)}
     2:${await randomSVG.tokenURI(tokenId2)} 
    `);
  } else {
    const VRFCoordinatorMock = await deployments.get("VRFCoordinatorMock");
    vrfCoordinator = await ethers.getContractAt(
      "VRFCoordinatorMock",
      VRFCoordinatorMock.address,
      signer
    );
    let transactionResponse1 = await vrfCoordinator.callBackWithRandomness(
      receipt.logs[3].topics[1],
      487,
      randomSVG.address
    );
    let transactionResponse2 = await vrfCoordinator.callBackWithRandomness(
      receipt2.logs[3].topics[1],
      8884,
      randomSVG.address
    );
    await transactionResponse1.wait(1);
    await transactionResponse2.wait(1);
    log(`Now let's finsih the mint...`);
    tx = await randomSVG.finishMint(tokenId1, { gasLimit: 3333333 });
    await tx.wait(1);
    tx = await randomSVG.finishMint(tokenId2, { gasLimit: 3333333 });
    await tx.wait(1);
    log(`You can view the tokenURIs here:
     1: ${await randomSVG.tokenURI(tokenId1)}
     2: ${await randomSVG.tokenURI(tokenId2)}
     `);
  }
};

module.exports.tags = ["all", "rsvg", "nft"];
