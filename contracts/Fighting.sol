// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "./NFT.sol";
import "./Library.sol";

contract  Fighting is ReentrancyGuard, VRFConsumerBase{
    
    address payable owner;
    address private nftContract;
    
    uint256 public fee;
    bytes32 public keyHash;
    uint256 public matchCounter;
    bool public paused;

 
    mapping(bytes32 => uint256) internal requestIdToTokenId;
    mapping(uint256 => uint256) internal tokenIdToRandomNumber;

    mapping(uint256 => lib.Fighter) public bracketToFighter;
    mapping(uint256 => Match) public matchIdToMatch;

    struct Match{
        uint256 matchId;
        uint256 fighterOne;
        uint256 fighterTwo;
        uint256 winner;
    }

    constructor(address _nftContract, address _VRFCoordinator, address _linkToken, bytes32 _keyHash, uint256 _fee)
    VRFConsumerBase(_VRFCoordinator, _linkToken){
        fee = _fee;
        keyHash = _keyHash;
        nftContract = _nftContract;
        owner = payable(msg.sender);
        matchCounter=1;
    }

    function toggleOpenToFight(uint256 _tokenId) public nonReentrant{
        require(msg.sender == IERC721(nftContract).ownerOf(_tokenId), 'Not owner of this token');
        
        lib.Fighter memory myFighter = NFT(nftContract).getFighterById(_tokenId);
        uint256 lvl = myFighter.level;
        if(lvl<11){
            lib.Fighter memory otherFighter = bracketToFighter[0];
            if(otherFighter.tokenId == _tokenId){
                delete bracketToFighter[0];
            }else if(otherFighter.tokenId < 1){
                bracketToFighter[0] = myFighter;
            }else{
                startMatch(otherFighter, myFighter);
                delete bracketToFighter[0];
            }
        }else if(lvl<21){
            lib.Fighter memory otherFighter = bracketToFighter[1];
            if(otherFighter.tokenId == _tokenId){
                delete bracketToFighter[1];
            }else if(otherFighter.tokenId < 1){
                bracketToFighter[1] = myFighter;
            }else{
                startMatch(otherFighter, myFighter);
                delete bracketToFighter[0];
            }
        }else if(lvl<31){
            lib.Fighter memory otherFighter = bracketToFighter[2];
            if(otherFighter.tokenId == _tokenId){
                delete bracketToFighter[2];
            }else if(otherFighter.tokenId < 1){
                bracketToFighter[2] = myFighter;
            }else{
                startMatch(otherFighter, myFighter);
                delete bracketToFighter[0];
            }
        }else if(lvl<41){
            lib.Fighter memory otherFighter = bracketToFighter[3];
            if(otherFighter.tokenId == _tokenId){
                delete bracketToFighter[3];
            }else if(otherFighter.tokenId < 1){
                bracketToFighter[3] = myFighter;
            }else{
                startMatch(otherFighter, myFighter);
                delete bracketToFighter[0];
            }
        }else if(lvl<51){
            lib.Fighter memory otherFighter = bracketToFighter[4];
            if(otherFighter.tokenId == _tokenId){
                delete bracketToFighter[4];
            }else if(otherFighter.tokenId < 1){
                bracketToFighter[4] = myFighter;
            }else{
                startMatch(otherFighter, myFighter);
                delete bracketToFighter[0];
            }
        }else if(lvl<61){
            lib.Fighter memory otherFighter = bracketToFighter[5];
            if(otherFighter.tokenId == _tokenId){
                delete bracketToFighter[5];
            }else if(otherFighter.tokenId < 1){
                bracketToFighter[5] = myFighter;
            }else{
                startMatch(otherFighter, myFighter);
                delete bracketToFighter[0];
            }
        }else if(lvl<71){
            lib.Fighter memory otherFighter = bracketToFighter[6];
            if(otherFighter.tokenId == _tokenId){
                delete bracketToFighter[6];
            }else if(otherFighter.tokenId < 1){
                bracketToFighter[6] = myFighter;
            }else{
                startMatch(otherFighter, myFighter);
                delete bracketToFighter[0];
            }
        }else if(lvl<80){
            lib.Fighter memory otherFighter = bracketToFighter[7];
            if(otherFighter.tokenId == _tokenId){
                delete bracketToFighter[7];
            }else if(otherFighter.tokenId < 1){
                bracketToFighter[7] = myFighter;
            }else{
                startMatch(otherFighter, myFighter);
                delete bracketToFighter[0];
            }
        }else if(lvl<80){
            lib.Fighter memory otherFighter = bracketToFighter[8];
            if(otherFighter.tokenId == _tokenId){
                delete bracketToFighter[8];
            }else if(otherFighter.tokenId < 1){
                bracketToFighter[8] = myFighter;
            }else{
                startMatch(otherFighter, myFighter);
                delete bracketToFighter[0];
            }
        }else{
            lib.Fighter memory otherFighter = bracketToFighter[9];
            if(otherFighter.tokenId == _tokenId){
                delete bracketToFighter[9];
            }else if(otherFighter.tokenId < 1){
                bracketToFighter[9] = myFighter;
            }else{
                startMatch(otherFighter, myFighter);
                delete bracketToFighter[0];
            }
        }
    }
    function fulfillRandomness(bytes32 _requestId, uint256 _randomNumber) internal override {
        uint256 tokenId = requestIdToTokenId[_requestId];
        tokenIdToRandomNumber[tokenId] = _randomNumber;
    }

    function startMatch(lib.Fighter memory _fighterOne, lib.Fighter memory _fighterTwo) internal{
        matchIdToMatch[matchCounter] = Match(matchCounter, _fighterOne.tokenId, _fighterTwo.tokenId, _fighterTwo.tokenId);
        matchCounter++;
    }
}
