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

 
    mapping(bytes32 => uint256) public requestIdToMatchId;
    mapping(uint256 => uint256) public matchIdToRandomNumber;

    mapping(uint256 => lib.Fighter) public bracketToFighter;
    mapping(uint256 => Match) public matchIdToMatch;

    struct Match{
        uint256 matchId;
        lib.Fighter fighterOne;
        lib.Fighter fighterTwo;
        uint256 winner;
        bool end;
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
        require(!paused, "Fighting is not active");

        lib.Fighter memory myFighter = NFT(nftContract).getFighterById(_tokenId);
        uint256 bracket = myFighter.level / 10;
        lib.Fighter memory otherFighter = bracketToFighter[bracket];
        if(otherFighter.tokenId == _tokenId){
            delete bracketToFighter[bracket];
        }else if(otherFighter.tokenId < 1){
            bracketToFighter[bracket] = myFighter;
        }else{
            requestMatch(otherFighter, myFighter);
            delete bracketToFighter[bracket;
        }
    }


    function requestMatch(lib.Fighter memory _fighterOne, lib.Fighter memory _fighterTwo) internal{
        bytes32 requestId = requestRandomness(keyHash, fee);
        matchIdToMatch[matchCounter] = Match(matchCounter, _fighterOne, _fighterTwo, 0, false);
        requestIdToMatchId[requestId] = matchCounter;
        matchCounter++;
    }

    function fulfillRandomness(bytes32 _requestId, uint256 _randomNumber) internal override {
        uint256 matchId = requestIdToMatchId[_requestId];
        matchIdToRandomNumber[matchId] = _randomNumber;
    }

    function finishMatch (uint256 _matchId) public {
        require(matchIdToMatch[_matchId].end == false && matchIdToMatch[_matchId].winner == 0, "Match is already done");
        require(matchIdToRandomNumber[_matchId] > 0 , "ChainLink VRF is not ready");
        fight(_matchId, matchIdToRandomNumber[_matchId]);
    }

    function fight(uint256 _matchId, uint256 _randomNumber) internal {
        uint256 result = _randomNumber % 100;
        if(result > 50){
            matchIdToMatch[_matchId].winner = matchIdToMatch[_matchId].fighterTwo.tokenId;
        }else{
            matchIdToMatch[_matchId].winner = matchIdToMatch[_matchId].fighterOne.tokenId;
        }
        matchIdToMatch[_matchId].end = true;
    }

}
