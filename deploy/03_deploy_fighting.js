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
  const Fighting = await deploy("Fighting", {
    from: deployer,
    args: args,
    log: true,
  });
  log(`You have deployed Fighting contract to ${Fighting.address}`);
  const FightingContract = await ethers.getContractFactory("Fighting");
  const accounts = await hre.ethers.getSigners();
  const signer = accounts[0];
  const fighting = new ethers.Contract(
    Fighting.address,
    FightingContract.interface,
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
  log("Funding contract with chainlink");
  let fund_tx = await linkToken.transfer(Fighting.address, fundAmount);
  await fund_tx.wait(1);

  if (chainId == 31337) {
    await fighting.toggleOpenToFight(1, { gasLimit: 300000 });
    log(`You are making token ${1} openToFight`);
    let f1 = await fighting.bracketToFighter(0, { gasLimit: 300000 });
    log("Bracket To fighter should return your fighter");
    log(f1);
    log("----------------------------------------------------");
    await fighting.toggleOpenToFight(1, { gasLimit: 300000 });
    log("Bracket toggle openTofight to false");
    f1 = await fighting.bracketToFighter(0, { gasLimit: 300000 });
    log("Bracket To fighter should return 0");
    log(f1);
    log("----------------------------------------------------");
    await fighting.toggleOpenToFight(1, { gasLimit: 300000 });
    log(`You are making token ${1} openToFight`);
    await fighting.toggleOpenToFight(2, { gasLimit: 300000 });
    log(`You are making token ${2} openToFight, this will start the match`);
    let match = await fighting.matchIdToMatch(1);
    log(`Match info: ${match}`);
    f1 = await fighting.bracketToFighter(0, { gasLimit: 300000 });
    log("Bracket To fighter should return 0");
    log(f1);
    // const VRFCoordinatorMock = await deployments.get("VRFCoordinatorMock");
    // vrfCoordinator = await ethers.getContractAt(
    //   "VRFCoordinatorMock",
    //   VRFCoordinatorMock.address,
    //   signer
    // );
    // let transactionResponse = await vrfCoordinator.callBackWithRandomness(
    //   receipt.logs[3].topics[1],
    //   1,
    //   training.address
    // );
    // await transactionResponse.wait(1);
    // log(`RandomNumber is ready, finish training`);
    // tx = await training.finishTrainingAgi(1, { gasLimit: 3333333 });
    // await tx.wait(1);
    // log(receipt.events[1].topics);
    // const newFighter = await nft.getFighterById(1);
    // log(newFighter);
  }
};
module.exports.tags = ["all", "prod", "fighting"];
