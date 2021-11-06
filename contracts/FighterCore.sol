// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Library.sol";

contract FighterCore {

    function createSVG(lib.Fighter memory _fighter) internal pure returns (string memory){
        string memory svg = string(abi.encodePacked(
            "<svg xmlns='http://www.w3.org/2000/svg' height='500' width='500' text-anchor='middle' fill='white' font-size='1.5em'><rect width='500' height='500' style='fill:black;'/><text x='50%' y='20%' font-size='2em'>",
            _fighter.name,
            "</text><line x1='20%' y1='27%' x2='80%' y2='27%' style='stroke:white'/><text x='50%' y='37%' font-size='1.5em'>Level: ",
            lib.toString(_fighter.level),
            "</text><text x='50%' y='45%' font-size='1.5em'>Wins: ",
            lib.toString(_fighter.wins),
            "</text><line x1='20%' y1='50%' x2='80%' y2='50%' style='stroke:white'/><text x='50%' y='57%'>HP: ",
            lib.toString(_fighter.hp),
            "</text><text x='50%' y='62%'>Strength: ",
            lib.toString(_fighter.strength),
            "</text><text x='50%' y='67%'>Dexterity: ",
            lib.toString(_fighter.dexterity),
            "</text><text x='50%' y='72%'>Agility: ",
            lib.toString(_fighter.agility),
            "</text><text x='50%' y='77%'>Intelligence: ",
            lib.toString(_fighter.intelligence),
            "</text><text x='50%' y='82%'>Durability: ",
            lib.toString(_fighter.durability),
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



