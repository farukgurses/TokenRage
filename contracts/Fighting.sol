// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./NFT.sol";
import "./Library.sol";

contract  Fighting is ReentrancyGuard, VRFConsumerBase, Ownable{
    event RequestedMatch(bytes32 indexed requestId, uint256 indexed matchId);
    
    address private nftContract;
    uint256 public fee;
    bytes32 public keyHash;
    uint256 public matchCounter;
    bool public paused;

    mapping(bytes32 => uint256) private requestIdToMatchId;
    mapping(uint256 => uint256) private matchIdToRandomNumber;
    mapping(uint256 => lib.Fighter) private bracketToFighter;
    mapping(uint256 => Match) public matchIdToMatch;

    struct Match {
        uint256 matchId;
        uint256 fighterOne;
        uint256 fighterTwo;
        uint256 winner;
        uint256 looser;
        bool end;
        string matchLogs;
    }

    constructor(address _nftContract, address _VRFCoordinator, address _linkToken, bytes32 _keyHash, uint256 _fee)
    VRFConsumerBase(_VRFCoordinator, _linkToken){
        fee = _fee;
        keyHash = _keyHash;
        nftContract = _nftContract;
        matchCounter = 1;
        paused = false;
    }

    function toggleOpenToFight(uint256 _tokenId) public nonReentrant{
        require(msg.sender == IERC721(nftContract).ownerOf(_tokenId), 'Not owner of this token');
        require(!paused, "Fighting is not active");

        lib.Fighter memory myFighter = NFT(nftContract).getFighterById(_tokenId);
        uint256 bracket = myFighter.level;
        lib.Fighter memory otherFighter = bracketToFighter[bracket];
        if(otherFighter.tokenId == _tokenId){
            delete bracketToFighter[bracket];
        }else if(otherFighter.tokenId < 1){
            bracketToFighter[bracket] = myFighter;
        }else{
            requestMatch(otherFighter, myFighter);
            delete bracketToFighter[bracket];
        }
    }


    function requestMatch(lib.Fighter memory _fighterOne, lib.Fighter memory _fighterTwo) private{
        bytes32 requestId = requestRandomness(keyHash, fee);
        matchIdToMatch[matchCounter] = Match(matchCounter, _fighterOne.tokenId, _fighterTwo.tokenId, 0, 0, false, "");
        requestIdToMatchId[requestId] = matchCounter;
        emit RequestedMatch(requestId, matchCounter);
        matchCounter++;
    }

    function fulfillRandomness(bytes32 _requestId, uint256 _randomNumber) internal override {
        uint256 matchId = requestIdToMatchId[_requestId];
        matchIdToRandomNumber[matchId] = _randomNumber;
    }

    function finishMatch (uint256 _matchId) public {
        require(matchIdToMatch[_matchId].end == false && matchIdToMatch[_matchId].winner == 0, "Match is already done");
        require(matchIdToRandomNumber[_matchId] > 0 , "ChainLink VRF is not ready");
        determineWinner(_matchId);
    }

    struct MatchData{
        uint roundNo;
        uint hit;
        uint crit;
        uint dmg;
    }

    function determineWinner(uint256 _matchId)private {
        uint256 randomNumber = matchIdToRandomNumber[_matchId];
        Match memory _match = matchIdToMatch[_matchId];
        lib.Fighter memory f1 = NFT(nftContract).getFighterById(_match.fighterOne);
        lib.Fighter memory f2 = NFT(nftContract).getFighterById(_match.fighterTwo);
        uint[] memory randomArray = lib.expand(randomNumber, 200, 100);
        string memory matchLogs = "";
        uint256 randomI = 0;
        for(uint i = 1; i <= 40; i ++){
            MatchData memory data = MatchData(i, 0, 0, 0);
            if(i % 2 == 1){
                data.hit = successfullHit(f1.dexterity, f2.agility, randomArray[randomI]) ? 1 : 0;
                if(data.hit == 1){
                    randomI++;
                    data.crit = criticalHit(f1.intelligence, f2.intelligence, f1.dexterity, f2.agility, randomArray[randomI]) ? 1 : 0;
                    randomI++;
                    data.dmg = calculateDmg(f1.strength, f1.level, data.crit, randomArray[randomI]);
                }
                if(data.dmg > f2.hp){
                    matchLogs = string(abi.encodePacked(
                        matchLogs, '/' ,lib.toString(data.roundNo), ' ', lib.toString(data.hit), ' ' ,lib.toString(data.crit), ' ', lib.toString(data.dmg)
                    )); 
                    matchIdToMatch[_matchId].winner = f1.tokenId;
                    matchIdToMatch[_matchId].looser = f2.tokenId;
                    break;
                }
                f2.hp -= data.dmg;
            }else{
                data.hit = successfullHit(f2.dexterity, f1.agility, randomArray[randomI]) ? 1 : 0;
                if(data.hit == 1){
                    randomI++;
                    data.crit = criticalHit(f2.intelligence, f1.intelligence, f2.dexterity, f1.agility, randomArray[randomI]) ? 1 : 0;
                    randomI++;
                    data.dmg = calculateDmg(f2.strength, f2.level, data.crit, randomArray[randomI]);
                }
                if(data.dmg > f1.hp){
                    matchLogs = string(abi.encodePacked(
                        matchLogs, '/' ,lib.toString(data.roundNo), ' ', lib.toString(data.hit), ' ' ,lib.toString(data.crit), ' ', lib.toString(data.dmg)
                    ));
                    matchIdToMatch[_matchId].winner = f2.tokenId;
                    matchIdToMatch[_matchId].looser = f1.tokenId;
                    break;
                }
                f1.hp -= data.dmg;
            }
            matchLogs = string(abi.encodePacked(
                matchLogs, '/' ,lib.toString(data.roundNo), ' ', lib.toString(data.hit), ' ' ,lib.toString(data.crit), ' ', lib.toString(data.dmg)
            )); 
            randomI++;
        }
        matchIdToMatch[_matchId].end = true;
        matchIdToMatch[_matchId].matchLogs = Base64.encode(bytes(matchLogs));
        finaliseMatch(_matchId);

    }

    function finaliseMatch(uint _matchId) private{
        Match memory _match = matchIdToMatch[_matchId];
        if(_match.winner == 0){
            matchIdToMatch[_matchId].end = true;
        }else{
            lib.Fighter memory winner = NFT(nftContract).getFighterById(_match.winner);
            lib.Fighter memory looser = NFT(nftContract).getFighterById(_match.looser);
            winner.wins ++;
            winner.level += looser.level;
            NFT(nftContract).updateFighter(_match.winner, winner);
            NFT(nftContract)._BURN(_match.looser);
        }
    }

    function successfullHit(uint dex, uint agi, uint rN) private pure returns(bool){
        return (dex * 150) / (dex + agi) > rN;
    }

    function criticalHit(uint intAtt, uint intDef, uint dex, uint agi, uint rN) private pure returns(bool){
        return ((intAtt * dex) / (intDef + agi)) * 40 > rN;
    }

    function calculateDmg(uint str, uint lvl, uint crit, uint rN) private pure returns (uint dmg){
        uint256 newRN = uint256(keccak256(abi.encode(rN, str, lvl)));
        uint max = str;
        uint min = str / 2;
        dmg = ((newRN % (max-min)) + min);
        if(crit == 1){
            dmg = dmg * 2;
        }
        return dmg;
    }

    function pause(bool _state) public onlyOwner(){
        paused = _state;
    }
}
