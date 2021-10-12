//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "base64-sol/base64.sol";

contract NFT is ERC721URIStorage, Ownable{
    using Strings for uint256;

    event CreatedNFT(uint indexed tokenId, string tokenURL);

    uint256 public tokenCounter;
    mapping(uint => Fighter) public tokenIdToFighter;
    
    struct Fighter {
        uint tokenId;
        string name;
        uint level;
        uint experience;
        uint wins;
        uint hp;
        uint strength;
        uint dexterity;
        uint agility;
        uint intelligence;
    }

    constructor() ERC721("NFT", "NFT"){
        tokenCounter = 0;
    }

    function create(string memory _name) public{
        _safeMint(msg.sender, tokenCounter);
        createFighter(tokenCounter, _name);
        string memory imageURL = createImageURL(tokenIdToFighter[tokenCounter]);
        string memory tokenURL = createTokenURL(imageURL);
        _setTokenURI(tokenCounter, tokenURL);
        emit CreatedNFT(tokenCounter, tokenURL);
        tokenCounter ++;
    }

    function createFighter(uint _tokenId, string memory _name) internal {
        tokenIdToFighter[_tokenId] = Fighter(_tokenId, _name, 1, 0, 0, 100, 9, 8, 7, 6);
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