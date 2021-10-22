let { networkConfig, getNetworkIdFromName } = require("../config");

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
  let NFT = await get("NFT");
  const args = [
    NFT.address,
    vrfCoordinatorAddress,
    linkTokenAddress,
    keyHash,
    fee,
  ];
  log("----------------------------------------------------");
  const Training = await deploy("Training", {
    from: deployer,
    args: args,
    log: true,
  });
  log(`You have deployed Training contract to ${Training.address}`);
  const TrainingContract = await ethers.getContractFactory("Training");
  const accounts = await hre.ethers.getSigners();
  const signer = accounts[0];
  const training = new ethers.Contract(
    Training.address,
    TrainingContract.interface,
    signer
  );

  const NFTContract = await ethers.getContractFactory("NFT");
  const nft = new ethers.Contract(NFT.address, NFTContract.interface, signer);

  // fund with LINK
  let networkId = await getNetworkIdFromName(network.name);
  const fundAmount = networkConfig[networkId]["fundAmount"];
  const linkTokenContract = await ethers.getContractFactory("LinkToken");
  const linkToken = new ethers.Contract(
    linkTokenAddress,
    linkTokenContract.interface,
    signer
  );
  let fund_tx = await linkToken.transfer(Training.address, fundAmount);
  await fund_tx.wait(1);
  let tx = await training.requestTraining(0, { gasLimit: 300000 });
  let receipt = await tx.wait(1);
  log(`You are requesting training for tokenId: ${0}`);
  log("Let's wait for the Chainlink VRF node to respond...");
  const VRFCoordinatorMock = await deployments.get("VRFCoordinatorMock");
  vrfCoordinator = await ethers.getContractAt(
    "VRFCoordinatorMock",
    VRFCoordinatorMock.address,
    signer
  );
  let transactionResponse = await vrfCoordinator.callBackWithRandomness(
    receipt.logs[3].topics[1],
    213,
    training.address
  );
  await transactionResponse.wait(1);
  log(`RandomNumber is ready, finish training`);
  tx = await training.finishTraining(0, { gasLimit: 3333333 });
  await tx.wait(1);
  log(receipt.events[1].topics);
  const a = await nft.getFighterById(0);
  log(a);
};