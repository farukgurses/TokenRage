// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "./Library.sol";
import "./FighterCore.sol";

contract NFT is ERC721URIStorage, Ownable, VRFConsumerBase, FighterCore{
 
    event CreatedNFT(uint indexed tokenId, string tokenURL);
    event UpdatedNFT(uint indexed tokenId, string tokenURL);
    event RequestedRandomSVG(bytes32 indexed requestId, uint256 indexed tokenId);
    event CreatedUnfinishedRandomSVG(uint256 indexed tokenId, uint256 indexed randomNumber);

    uint256 public tokenCounter;
    uint256 public fee;
    bytes32 public keyHash;
    address private trainingContract;
    address private fightingContract;
    uint256 private cost;
    uint256 private maxSupply;
    bool private paused;

    mapping(uint => lib.Fighter) public tokenIdToFighter;
    mapping(bytes32 => address) internal requestIdToSender;
    mapping(bytes32 => uint256) internal requestIdToTokenId;
    mapping(uint256 => uint256) internal tokenIdToRandomNumber;



    constructor(address _VRFCoordinator, address _linkToken, bytes32 _keyHash, uint256 _fee) 
        ERC721("BloodSport", "BLD")
        VRFConsumerBase(_VRFCoordinator, _linkToken){
        fee = _fee;
        keyHash = _keyHash;
        tokenCounter = 1;
        cost = 0.01 ether;
        maxSupply = 10000;
        paused = false;
    }
    
    // --------------------------------------------  MINT NFT ----------------------------------------------//
    function create() public payable returns(bytes32 requestId){
        require(!paused, "Minting is not active");
        require(tokenCounter < maxSupply, "Minting is over");
        // require(msg.value >= cost, "Wrong payment");

        requestId = requestRandomness(keyHash, fee);
        requestIdToSender[requestId] = msg.sender;
        uint256 tokenId = tokenCounter;
        requestIdToTokenId[requestId] = tokenId;
        tokenCounter ++;
        emit RequestedRandomSVG(requestId, tokenId);
    }

    function fulfillRandomness(bytes32 _requestId, uint256 _randomNumber) internal override {
        address nftOwner = requestIdToSender[_requestId];
        uint256 tokenId = requestIdToTokenId[_requestId];
        _safeMint(nftOwner, tokenId);
        tokenIdToRandomNumber[tokenId] = _randomNumber;
        emit CreatedUnfinishedRandomSVG(tokenId, _randomNumber);
    }

    function finishMint (uint256 _tokenId) public {
        require(bytes(tokenURI(_tokenId)).length <= 0, "tokenURI is already set");
        require(tokenCounter > _tokenId, "token has not been minted yet");
        require(tokenIdToRandomNumber[_tokenId] > 0 , "ChainLink VRF is not ready");
        uint256 randomNumber = tokenIdToRandomNumber[_tokenId];

        createFighter(_tokenId, randomNumber);
        string memory imageURL = createImageURL(tokenIdToFighter[_tokenId]);
        string memory tokenURL = createTokenURL(imageURL, tokenIdToFighter[_tokenId]);
        _setTokenURI(_tokenId, tokenURL);
        emit CreatedNFT(_tokenId, tokenURL);
    }

    function totalSupply() public view virtual returns (uint256) {
        return tokenCounter;
    }

    // --------------------------------------------  ON-CHAIN DATA ----------------------------------------------//
    function createFighter(uint _tokenId, uint256 _randomNumber) internal {
        uint256[] memory stats = new uint[](6);
        for(uint i = 0; i < 6; i++){
            uint256 newRN = uint256(keccak256(abi.encode(_randomNumber,i)));
            if(i == 0) {
                stats[i] = ((newRN % 10) + 1);
            }else{
                stats[i] = ((newRN % (10 * stats[0])) + 1);
            }
        }
        string memory name = string(abi.encodePacked("BloodSport #", lib.toString(_tokenId)));
        tokenIdToFighter[_tokenId] = lib.Fighter(_tokenId, name, stats[0], 0, stats[0]*20, stats[1], stats[2], stats[3], stats[4], stats[5]);
    }

    function updateFighter(uint _tokenId, lib.Fighter memory _fighter) public {
        // require(msg.sender == trainingContract || msg.sender == fightingContract, "Only Training Contract can update Fighter");
        tokenIdToFighter[_tokenId] = _fighter;
        string memory imageURL = createImageURL(_fighter);
        string memory tokenURL = createTokenURL(imageURL, _fighter);
        _setTokenURI(_tokenId, tokenURL);
        emit UpdatedNFT(_tokenId, tokenURL);
    }

    // --------------------------------------------  ONLY OWNER ----------------------------------------------//
    // function setMaxSupply(uint256 _newMaxSupply) public onlyOwner(){
    //     maxSupply = _newMaxSupply;
    // }

    // function setCost(uint256 _newCost) public onlyOwner(){
    //     cost = _newCost;
    // }

    // function setTrainingContract(address _newTrainingContract) public onlyOwner(){
    //     trainingContract = _newTrainingContract;
    // }

    // function setFightingContract(address _newFightingContract) public onlyOwner(){
    //     fightingContract = _newFightingContract;
    // }

    // function pause(bool _state) public onlyOwner(){
    //     paused = _state;
    // }

    // function withdraw() public payable onlyOwner(){
    //     require(payable(msg.sender).send(address(this).balance));
    // }

    function getFighterById(uint256 _tokenId) public view returns(lib.Fighter memory _fighter){
        return tokenIdToFighter[_tokenId];
    }
}