pragma solidity ^0.8.0;

import "./Library.sol";

contract FighterCore {

function createSVG(lib.Fighter memory _fighter) internal pure returns (string memory){
    string memory svg = string(abi.encodePacked(
        "<svg xmlns='http://www.w3.org/2000/svg' height='500' width='500' text-anchor='middle' fill='white' font-size='1.5em'><rect width='500' height='500' style='fill:black;'/>",
        "<rect width='", lib.toString(_fighter.hp/2), "' height='25' y='0' x='0' style='fill:red'></rect>",
        "<rect width='", lib.toString(_fighter.strength/2), "' height='25' y='25' x='0' style='fill:green'></rect>",
        "<rect width='", lib.toString(_fighter.dexterity/2), "' height='25' y='50' x='0' style='fill:blue'></rect>",
        "<rect width='", lib.toString(_fighter.agility/2), "' height='25' y='75' x='0' style='fill:orange'></rect>",
        "<rect width='", lib.toString(_fighter.intelligence/2), "' height='25' y='100' x='0' style='fill:yellow'></rect>",
        "<rect width='", lib.toString(_fighter.durability/2), "' height='25' y='125' x='0' style='fill:pink'></rect>",

        "<image href='https://token-rage-nft.s3.eu-central-1.amazonaws.com/axe_man_1.png' height='250' width='250' transform='translate(-150, -50)' x='250' y='250'/>",
        "</svg>"
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
            '{"trait_type": "Level", "max_value": 100, "value": ',lib.toString(_fighter.level),
            '},{"trait_type": "Wins", "value": ',lib.toString(_fighter.wins),
            '},{"trait_type": "HP", "max_value": 2000, "value": ',lib.toString(_fighter.hp),
            '},{"trait_type": "Strength", "max_value": 1000, "value": ',lib.toString(_fighter.strength),
            '},{"trait_type": "Dexterity", "max_value": 1000, "value": ',lib.toString(_fighter.dexterity),
            '},{"trait_type": "Agility", "max_value": 1000, "value": ',lib.toString(_fighter.agility),
            '},{"trait_type": "Intelligence", "max_value": 1000, "value": ',lib.toString(_fighter.intelligence),
            '},{"trait_type": "Durability", "max_value": 1000, "value": ',lib.toString(_fighter.durability),
            '}], "image": "', _imageURL,
            '"}'
        )));
        string memory tokenURL = string(abi.encodePacked(baseURL, json));
        return tokenURL;
    }
}



