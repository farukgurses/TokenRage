// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "base64-sol/base64.sol";
library lib {
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

    function toString(uint _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    function createSVG(lib.Fighter memory _fighter) internal pure returns (string memory){
        string memory svg = string(abi.encodePacked(
            "<svg xmlns='http://www.w3.org/2000/svg' height='500' width='500' text-anchor='middle' fill='white' font-size='1.5em'><rect width='500' height='500' style='fill:black;'/><text x='50%' y='20%' font-size='2em'>",
            _fighter.name,
            "</text><line x1='20%' y1='27%' x2='80%' y2='27%' style='stroke:white'/><text x='50%' y='37%' font-size='1.5em'>Level: ",
            toString(_fighter.level),
            "</text><text x='50%' y='45%' font-size='1.5em'>Wins: ",
            toString(_fighter.wins),
            "</text><line x1='20%' y1='50%' x2='80%' y2='50%' style='stroke:white'/><text x='50%' y='57%'>HP: ",
            toString(_fighter.hp),
            "</text><text x='50%' y='62%'>Strength: ",
            toString(_fighter.strength),
            "</text><text x='50%' y='67%'>Dexterity: ",
            toString(_fighter.dexterity),
            "</text><text x='50%' y='72%'>Agility: ",
            toString(_fighter.agility),
            "</text><text x='50%' y='77%'>Intelligence: ",
            toString(_fighter.intelligence),
            "</text><text x='50%' y='82%'>Durability: ",
            toString(_fighter.durability),
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
            '{"trait_type": "Level", "max_value": 100, "value": ',toString(_fighter.level),
            '},{"trait_type": "Wins", "value": ',toString(_fighter.wins),
            '},{"trait_type": "HP", "max_value": 2000, "value": ',toString(_fighter.hp),
            '},{"trait_type": "Strength", "max_value": 1000, "value": ',toString(_fighter.strength),
            '},{"trait_type": "Dexterity", "max_value": 1000, "value": ',toString(_fighter.dexterity),
            '},{"trait_type": "Agility", "max_value": 1000, "value": ',toString(_fighter.agility),
            '},{"trait_type": "Intelligence", "max_value": 1000, "value": ',toString(_fighter.intelligence),
            '},{"trait_type": "Durability", "max_value": 1000, "value": ',toString(_fighter.durability),
            '}], "image": "', _imageURL,
            '"}'
        )));
        string memory tokenURL = string(abi.encodePacked(baseURL, json));
        return tokenURL;
    }
}
