// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "./NFT.sol";
import "./Library.sol";

contract  Fighting is ReentrancyGuard, VRFConsumerBase{
    event RequestedMatch(bytes32 indexed requestId, uint256 indexed matchId);
    
    
    address payable owner;
    address private nftContract;
    
    uint256 public fee;
    bytes32 public keyHash;
    uint256 public matchCounter;
    bool public paused;

    string[] public matchLogs = new string[](100);
    
    mapping(bytes32 => uint256) public requestIdToMatchId;
    mapping(uint256 => uint256) public matchIdToRandomNumber;

    mapping(uint256 => lib.Fighter) public bracketToFighter;
    mapping(uint256 => Match) public matchIdToMatch;

    struct Match{
        uint256 matchId;
        lib.Fighter fighterOne;
        lib.Fighter fighterTwo;
        uint256 winner;
        uint256 looser;
        bool end;
        string[] matchLogs;
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
            delete bracketToFighter[bracket];
        }
    }


    function requestMatch(lib.Fighter memory _fighterOne, lib.Fighter memory _fighterTwo) internal{
        bytes32 requestId = requestRandomness(keyHash, fee);
        matchIdToMatch[matchCounter] = Match(matchCounter, _fighterOne, _fighterTwo, 0, 0,false, new string[](100));
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
        fight(_matchId);
    }

    function fight(uint256 _matchId) internal {
        determineWinner(_matchId);
        matchIdToMatch[_matchId].end = true;
    }
    struct MatchData{
        string hitStr;
        bool hit;
        string critStr;
        bool crit;
        uint dmg;

    }
    function determineWinner(uint256 _matchId)internal{
        uint256 randomNumber = matchIdToRandomNumber[_matchId];
        Match memory _match = matchIdToMatch[_matchId];
        lib.Fighter memory f1 = _match.fighterOne;
        lib.Fighter memory f2 = _match.fighterTwo;
        uint[] memory randomArray = lib.expand(randomNumber, 200, 100);
        uint256 randomI = 0;
        for(uint i = 1; i <= 40; i ++){
            MatchData memory data = MatchData("fail", false, "no", false, 0);
            if(i % 2 == 1){

                data.hit = successfullHit(f1.dexterity, f2.agility, randomArray[randomI]);
                if(data.hit){
                    data.hitStr="yes";
                    randomI++;
                    data.crit = criticalHit(f1.intelligence, f2.intelligence, f1.dexterity, f2.agility, randomArray[randomI]);
                    if(data.crit){
                        data.critStr = "yes";
                    }
                    data.dmg = calculateDmg(f1.strength, f1.level, data.crit, randomArray[randomI]);
                    randomI++;
                }
                if(data.dmg > f2.hp){
                    matchLogs[i] = "PLAYER2 DEAD";
                    matchIdToMatch[_matchId].end=true;
                    matchIdToMatch[_matchId].winner = f1.tokenId;
                    matchIdToMatch[_matchId].looser = f2.tokenId;
                    matchIdToMatch[_matchId].matchLogs = matchLogs;
                    break;
                }
                f2.hp -= data.dmg;
                matchLogs[i] = string(abi.encodePacked(
                    'Round:', lib.toString(i),
                    ' Attacker: ', lib.toString(f1.tokenId),
                    ' Defender: ', lib.toString(f2.tokenId),
                    ' Success: ', data.hitStr, 
                    ' Crit: ', data.critStr,
                    ' DMG: ', lib.toString(data.dmg),
                    ' hp1: ', lib.toString(f1.hp),
                    ' hp2: ', lib.toString(f2.hp)
                )); 
            }else{
                data.hit = successfullHit(f2.dexterity, f1.agility, randomArray[randomI]);
                if(data.hit){
                    data.hitStr="yes";
                    randomI++;
                    data.crit = criticalHit(f2.intelligence, f1.intelligence, f2.dexterity, f1.agility, randomArray[randomI]);
                    if(data.crit){
                        data.critStr= "yes";
                    }
                    data.dmg = calculateDmg(f2.strength, f2.level, data.crit, randomArray[randomI]);
                    randomI++;
                }
                if(data.dmg > f1.hp){
                    matchLogs[i] = "PLAYER1 DEAD";
                    matchIdToMatch[_matchId].end=true;
                    matchIdToMatch[_matchId].winner = f2.tokenId;
                    matchIdToMatch[_matchId].looser = f1.tokenId;
                    matchIdToMatch[_matchId].matchLogs = matchLogs;
                    break;
                }
                f1.hp -= data.dmg;
                matchLogs[i] = string(abi.encodePacked(
                    'Round:', lib.toString(i),
                    ' Attacker: ', lib.toString(f2.tokenId),
                    ' Defender: ', lib.toString(f1.tokenId),
                    ' Success: ', data.hitStr,
                    ' Crit: ', data.critStr,
                    ' DMG: ', lib.toString(data.dmg),
                    ' hp1: ', lib.toString(f1.hp),
                    ' hp2: ', lib.toString(f2.hp)
                )); 
            }
            randomI++;
        }
        finaliseMatch(_matchId);

    }

    function finaliseMatch(uint _matchId) internal{
        Match memory _match = matchIdToMatch[_matchId];
        lib.Fighter memory winner = NFT(nftContract).getFighterById(_match.winner);
        lib.Fighter memory looser = NFT(nftContract).getFighterById(_match.looser);
        winner.wins ++;
        winner.level += looser.level;
        NFT(nftContract).updateFighter(_match.winner, winner);
        NFT(nftContract)._BURN(_match.looser);
    }

    function successfullHit(uint dex, uint agi, uint rN) internal returns(bool){
        return (dex * 150) / (dex + agi) > rN;
    }

    function criticalHit(uint intAtt, uint intDef, uint dex, uint agi, uint rN) internal returns(bool){
        return ((intAtt * dex) / (intDef + agi)) * 40 > rN;
    }

    function calculateDmg(uint str, uint lvl, bool crit, uint rN) internal returns (uint dmg){
        uint256 newRN = uint256(keccak256(abi.encode(rN, str, lvl)));
        uint max = str;
        uint min = str / 2;
        uint dmg = ((newRN % (max-min)) + min);
        if(crit){
            dmg = dmg * 2;
        }
        return dmg;
    }

}
