//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "base64-sol/base64.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract NFT is ERC721URIStorage, Ownable, VRFConsumerBase{
    using Strings for uint256;
 
    event CreatedNFT(uint indexed tokenId, string tokenURL);
    event RequestedRandomSVG(bytes32 indexed requestId, uint256 indexed tokenId);
    event CreatedUnfinishedRandomSVG(uint256 indexed tokenId, uint256 indexed randomNumber);

    uint256 public tokenCounter;
    uint256 public fee;
    bytes32 public keyHash;

    mapping(uint => Fighter) public tokenIdToFighter;
    mapping(bytes32 => address) internal requestIdToSender;
    mapping(bytes32 => uint256) internal requestIdToTokenId;
    mapping(uint256 => uint256) internal tokenIdToRandomNumber;

    struct Fighter {
        uint tokenId;
        string name;
        uint level;
        uint wins;
        uint hp;
        uint strength;
        uint dexterity;
        uint agility;
        uint intelligence;
        uint durability;
    }

    constructor(address _VRFCoordinator, address _linkToken, bytes32 _keyHash, uint256 _fee) 
        ERC721("NFT", "NFT")
        VRFConsumerBase(_VRFCoordinator, _linkToken){
        fee = _fee;
        keyHash = _keyHash;
        tokenCounter = 0;
    }

    function create() public returns(bytes32 requestId){
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
        string memory tokenURL = createTokenURL(imageURL);
        _setTokenURI(_tokenId, tokenURL);
        emit CreatedNFT(_tokenId, tokenURL);
    }

    function createFighter(uint _tokenId, uint256 _randomNumber) internal {
        uint256[] memory stats = new uint[](5);
        for(uint i = 0; i < 5; i++){
            uint256 newRN = uint256(keccak256(abi.encode(_randomNumber,i)));
            stats[i] = ((newRN % 10) + 1);
        }
        string memory name = string(abi.encodePacked("BLOOD SPORT #", _tokenId.toString()));
        tokenIdToFighter[_tokenId] = Fighter(_tokenId, name, 1, 0, 100, stats[0], stats[1], stats[2], stats[3], stats[4]);
    }

    function createSVG(Fighter memory _fighter) internal pure returns (string memory){
        string memory svg = string(abi.encodePacked(
            "<svg xmlns='http://www.w3.org/2000/svg' height='500' width='500'><rect width='500' height='500' style='fill:rgb(21,21,21);'/><text x='50%' y='20%' font-size='3em' dominant-baseline='middle' text-anchor='middle' fill='white'>",
            _fighter.name,
            "</text><line x1='20%' y1='27%' x2='80%' y2='27%' style='stroke:rgb(255,255,255);stroke-width:4'/><text x='50%' y='35%' font-size='2em' dominant-baseline='middle' text-anchor='middle' fill='white'>Level: ",
            _fighter.level.toString(),
            "</text><text x='50%' y='43%' font-size='2em' dominant-baseline='middle' text-anchor='middle' fill='white'>Wins: ",
            _fighter.wins.toString(),
            "</text><line x1='20%' y1='50%' x2='80%' y2='50%' style='stroke:rgb(255,255,255);stroke-width:4'/><text x='50%' y='57%' font-size='1.5em' dominant-baseline='middle' text-anchor='middle' fill='white'>HP: ",
            _fighter.hp.toString(),
            "</text><text x='50%' y='62%' font-size='1.5em' dominant-baseline='middle' text-anchor='middle' fill='white'>Strength: ",
            _fighter.strength.toString(),
            "</text><text x='50%' y='67%' font-size='1.5em' dominant-baseline='middle' text-anchor='middle' fill='white'>Dexterity: ",
            _fighter.dexterity.toString(),
            "</text><text x='50%' y='72%' font-size='1.5em' dominant-baseline='middle' text-anchor='middle' fill='white'>Agility: ",
            _fighter.agility.toString(),
            "</text><text x='50%' y='77%' font-size='1.5em' dominant-baseline='middle' text-anchor='middle' fill='white'>Intelligence: ",
            _fighter.intelligence.toString(),
            "</text><text x='50%' y='82%' font-size='1.5em' dominant-baseline='middle' text-anchor='middle' fill='white'>Durability: ",
            _fighter.durability.toString(),
            "</text></svg>"
        ));
        return svg;
    }

    function createImageURL(Fighter memory _fighter) internal pure returns (string memory){
        string memory svg = createSVG(_fighter);
        string memory baseURL = "data:image/svg+xml;base64,";
        string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(svg))));
        string memory imageURI = string(abi.encodePacked(baseURL, svgBase64Encoded));
        return imageURI;
    }

    function createTokenURL(string memory _imageURL) internal pure returns(string memory){
        string memory baseURL = "data:application/json;base64,";
        string memory json = Base64.encode(bytes(abi.encodePacked('{"name": "NFT NAME", "description": "An NFT fighting game", "attributes": "", "image": "', _imageURL, '"}')));
        string memory tokenURL = string(abi.encodePacked(baseURL, json));
        return tokenURL;
    }
}