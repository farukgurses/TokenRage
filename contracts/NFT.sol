// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "base64-sol/base64.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "./Library.sol";

contract NFT is ERC721URIStorage, Ownable, VRFConsumerBase{
    using Strings for uint256;
 
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
        tokenCounter = 0;
        cost = 1 ether;
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
        string memory name = string(abi.encodePacked("BloodSport #", _tokenId.toString()));
        tokenIdToFighter[_tokenId] = lib.Fighter(_tokenId, name, stats[0], 0, stats[0]*20, stats[1], stats[2], stats[3], stats[4], stats[5]);
    }

    function updateFighter(uint _tokenId, lib.Fighter memory _fighter) public {
        // require(msg.sender == trainingContract, "Only Training Contract can update Fighter");
        tokenIdToFighter[_tokenId] = _fighter;
        string memory imageURL = createImageURL(_fighter);
        string memory tokenURL = createTokenURL(imageURL, _fighter);
        _setTokenURI(_tokenId, tokenURL);
        emit UpdatedNFT(_tokenId, tokenURL);
    }

    function createSVG(lib.Fighter memory _fighter) internal pure returns (string memory){
        string memory svg = string(abi.encodePacked(
            "<svg xmlns='http://www.w3.org/2000/svg' height='500' width='500' text-anchor='middle' fill='white' font-size='1.5em'><rect width='500' height='500' style='fill:black;'/><text x='50%' y='20%' font-size='2em'>",
            _fighter.name,
            "</text><line x1='20%' y1='27%' x2='80%' y2='27%' style='stroke:white'/><text x='50%' y='37%' font-size='1.5em'>Level: ",
            _fighter.level.toString(),
            "</text><text x='50%' y='45%' font-size='1.5em'>Wins: ",
            _fighter.wins.toString(),
            "</text><line x1='20%' y1='50%' x2='80%' y2='50%' style='stroke:white'/><text x='50%' y='57%'>HP: ",
            _fighter.hp.toString(),
            "</text><text x='50%' y='62%'>Strength: ",
            _fighter.strength.toString(),
            "</text><text x='50%' y='67%'>Dexterity: ",
            _fighter.dexterity.toString(),
            "</text><text x='50%' y='72%'>Agility: ",
            _fighter.agility.toString(),
            "</text><text x='50%' y='77%'>Intelligence: ",
            _fighter.intelligence.toString(),
            "</text><text x='50%' y='82%'>Durability: ",
            _fighter.durability.toString(),
            "</text></svg>"
        ));
        return svg;
    }

    function createImageURL(lib.Fighter memory _fighter) internal pure returns (string memory){
        string memory svg = createSVG(_fighter);
        string memory baseURL = "data:image/svg+xml;base64,";
        string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(svg))));
        string memory imageURI = string(abi.encodePacked(baseURL, svgBase64Encoded));
        return imageURI;
    }

    function createTokenURL(string memory _imageURL, lib.Fighter memory _fighter) internal pure returns(string memory){
        string memory baseURL = "data:application/json;base64,";
        string memory json = Base64.encode(bytes(abi.encodePacked(
            '{"name": "',_fighter.name,
            '","description": "An NFT fighting game",',
            '"attributes":[',
            '{"trait_type": "Level", "max_value": 100, "value": ',_fighter.level.toString(),
            '},{"trait_type": "Wins", "value": ',_fighter.wins.toString(),
            '},{"trait_type": "HP", "max_value": 2000, "value": ',_fighter.hp.toString(),
            '},{"trait_type": "Strength", "max_value": 1000, "value": ',_fighter.strength.toString(),
            '},{"trait_type": "Dexterity", "max_value": 1000, "value": ',_fighter.dexterity.toString(),
            '},{"trait_type": "Agility", "max_value": 1000, "value": ',_fighter.agility.toString(),
            '},{"trait_type": "Intelligence", "max_value": 1000, "value": ',_fighter.intelligence.toString(),
            '},{"trait_type": "Durability", "max_value": 1000, "value": ',_fighter.durability.toString(),
            '}], "image": "', _imageURL,
            '"}'
        )));
        string memory tokenURL = string(abi.encodePacked(baseURL, json));
        return tokenURL;
    }

    // --------------------------------------------  ONLY OWNER ----------------------------------------------//
    function setMaxSupply(uint256 _newMaxSupply) public onlyOwner(){
        maxSupply = _newMaxSupply;
    }

    function setCost(uint256 _newCost) public onlyOwner(){
        cost = _newCost;
    }

    function setTrainingContract(address _newTrainingContract) public onlyOwner(){
        trainingContract = _newTrainingContract;
    }

    function setFightingContract(address _newFightingContract) public onlyOwner(){
        fightingContract = _newFightingContract;
    }

    function pause(bool _state) public onlyOwner(){
        paused = _state;
    }

    function withdraw() public payable onlyOwner(){
        require(payable(msg.sender).send(address(this).balance));
    }

    function getFighterById(uint256 _tokenId) public view returns(lib.Fighter memory _fighter){
        return tokenIdToFighter[_tokenId];
    }


}