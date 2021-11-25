// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "./Library.sol";
import "./FighterUtils.sol";

contract NFT is ERC721URIStorage, Ownable, VRFConsumerBase {
 
    event CreatedNFT(uint indexed tokenId, string tokenURL);
    event UpdatedNFT(uint indexed tokenId, string tokenURL);
    event RequestedRandomSVG(bytes32 indexed requestId, uint256 indexed tokenId);
    event CreatedUnfinishedRandomSVG(uint256 indexed tokenId, uint256 indexed randomNumber);

    uint256 public tokenCounter;
    uint256 public fee;
    bytes32 public keyHash;
    address private utilsContract;
    address private trainingContract;
    address private fightingContract;
    uint256 private cost;
    uint256 private maxSupply;
    string[] private fighterTypes = ["Knight", "Viking", "Undead", "Demon"];
    bool private paused;

    mapping(uint => lib.Fighter) public tokenIdToFighter;
    mapping(bytes32 => address) private requestIdToSender;
    mapping(bytes32 => uint256) private requestIdToTokenId;
    mapping(uint256 => uint256) private tokenIdToRandomNumber;




    constructor(address _VRFCoordinator, address _linkToken, bytes32 _keyHash, uint256 _fee, address _utilsContract) 
        ERC721("TokenRage", "RAGE")
        VRFConsumerBase(_VRFCoordinator, _linkToken){
        fee = _fee;
        keyHash = _keyHash;
        utilsContract = _utilsContract;
        tokenCounter = 1;
        cost = 0.01 ether;
        maxSupply = 10000;
        paused = false;
    }
    
    // --------------------------------------------  MINT NFT ----------------------------------------------//
    function create() public payable returns(bytes32 requestId){
        require(!paused, "MNA");
        require(tokenCounter < maxSupply, "MO");
        // require(msg.value >= cost, "WP");

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

    function finishMint (uint256 _tokenId, string memory _name) public {
        require(bytes(tokenURI(_tokenId)).length <= 0, "TUS");
        require(tokenCounter > _tokenId, "TNM");
        require(tokenIdToRandomNumber[_tokenId] > 0 , "CNR");
        uint256 randomNumber = tokenIdToRandomNumber[_tokenId];

        createFighter(_tokenId, randomNumber, _name);
        string memory imageURL =  FighterUtils(utilsContract).createImageURL(tokenIdToFighter[_tokenId]);
        string memory tokenURL = FighterUtils(utilsContract).createTokenURL(imageURL, tokenIdToFighter[_tokenId]);
        _setTokenURI(_tokenId, tokenURL);
        emit CreatedNFT(_tokenId, tokenURL);
    }

    function totalSupply() public view virtual returns (uint256) {
        return tokenCounter - 1;
    }
    
    function tokensOfOwner(address _owner) external view returns(uint[] memory ownerTokens) {
        uint256 tokenCount = balanceOf(_owner);

        if (tokenCount == 0) {
            // Return an empty array
            return new uint[](0);
        } else {
            uint[] memory result = new uint[](tokenCount);
            uint256 resultIndex = 0;

            uint256 tokenId;

            for (tokenId = 1; tokenId < tokenCounter; tokenId++) {
                if (_exists(tokenId) && ownerOf(tokenId) == _owner) {
                    result[resultIndex] = tokenId;
                    resultIndex++;
                }
            }
            return result;
        }
    }

    // --------------------------------------------  ON-CHAIN DATA ----------------------------------------------//
    function createFighter(uint _tokenId, uint256 _randomNumber, string memory _name) private {
        uint256 level = (_randomNumber % 29) + 1;
        string memory fType = fighterTypes[(_randomNumber % 4)];
        uint256[] memory stats = lib.expand(_randomNumber, 5, level * 10);
        tokenIdToFighter[_tokenId] = lib.Fighter(_tokenId, _name, level, 0, level*20, stats[0], stats[1], stats[2], stats[3], stats[4], 0, fType);
    }

    function updateFighter(uint _tokenId, lib.Fighter memory _fighter) public {
        require(msg.sender == trainingContract || msg.sender == fightingContract, "AE");
        tokenIdToFighter[_tokenId] = _fighter;
        string memory imageURL = FighterUtils(utilsContract).createImageURL(_fighter);
        string memory tokenURL = FighterUtils(utilsContract).createTokenURL(imageURL, _fighter);
        _setTokenURI(_tokenId, tokenURL);
        emit UpdatedNFT(_tokenId, tokenURL);
    }

    function getFighterById(uint256 _tokenId) public view returns(lib.Fighter memory _fighter){
        return tokenIdToFighter[_tokenId];
    }

    // --------------------------------------------  ONLY OWNER ----------------------------------------------//
    // function setMaxSupply(uint256 _newMaxSupply) public onlyOwner(){
    //     maxSupply = _newMaxSupply;
    // }

    // function setCost(uint256 _newCost) public onlyOwner(){
    //     cost = _newCost;
    // }

    function setTrainingContract(address _newTrainingContract) public onlyOwner(){
        trainingContract = _newTrainingContract;
    }

    function setFightingContract(address _newFightingContract) public onlyOwner(){
        fightingContract = _newFightingContract;
    }
    function setUtilsContract(address _newUtilsContract) public onlyOwner(){
        utilsContract = _newUtilsContract;
    }

    // function pause(bool _state) public onlyOwner(){
    //     paused = _state;
    // }

    // function withdraw() public payable onlyOwner(){
    //     require(payable(msg.sender).send(address(this).balance));
    // }

}