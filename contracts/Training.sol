// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./NFT.sol";
import "./Library.sol";

contract Training is ReentrancyGuard, VRFConsumerBase, Ownable{
    
    event RequestedTraining(bytes32 indexed requestId, uint256 indexed tokenId);
    event ReadyForTraining(uint256 indexed tokenId, uint256 indexed randomNumber);
    event TrainingDone(uint256 indexed tokenId, lib.Fighter indexed fighter, bool indexed isSuccessfull);

    address private nftContract;
    uint256 private cost;

    uint256 public fee;
    bytes32 public keyHash;
    bool public paused;

    mapping(bytes32 => uint256) internal requestIdToTokenId;
    mapping(uint256 => uint256) internal tokenIdToRandomNumber;

    constructor(address _nftContract, address _VRFCoordinator, address _linkToken, bytes32 _keyHash, uint256 _fee)
    VRFConsumerBase(_VRFCoordinator, _linkToken){
        fee = _fee;
        keyHash = _keyHash;
        nftContract = _nftContract;
        cost = 0.01 ether;
        paused = false;
    }

    function requestTraining (uint256 _tokenId) public payable returns(bytes32 requestId){
        require(!paused, "TNA");
        // require(msg.value >= cost, "WP");
        requestId = requestRandomness(keyHash, fee);
        requestIdToTokenId[requestId] = _tokenId;
        emit RequestedTraining(requestId, _tokenId);
    }

    function fulfillRandomness(bytes32 _requestId, uint256 _randomNumber) internal override {
        uint256 tokenId = requestIdToTokenId[_requestId];
        tokenIdToRandomNumber[tokenId] = _randomNumber;
        emit ReadyForTraining(tokenId, _randomNumber);
    }

    function finishTrainingStr (uint256 _tokenId) public nonReentrant {
        lib.Fighter memory fighter = NFT(nftContract).getFighterById(_tokenId);
        uint256[] memory rns = startTraining(_tokenId);

        uint256 successChance = trainingSuccessChance(fighter.level, fighter.strength, fighter.durability);
        uint256 statLimit = statIncreaseLimit(fighter.level, fighter.strength);
        bool isSuccessfull = false;
        if((rns[0] % 100) < successChance){
            fighter.strength = fighter.strength + (rns[0] % statLimit) + 1;
            isSuccessfull=true;
        }
        if(fighter.strength > fighter.level * 10){
            fighter.strength = fighter.level * 10;
        }

        NFT(nftContract).updateFighter(_tokenId, fighter);
        emit TrainingDone(_tokenId, fighter, isSuccessfull);
    }    

    function finishTrainingAgi (uint256 _tokenId) public nonReentrant {
        lib.Fighter memory fighter = NFT(nftContract).getFighterById(_tokenId);
        uint256[] memory rns = startTraining(_tokenId);

        uint256 successChance = trainingSuccessChance(fighter.level, fighter.agility, fighter.durability);
        uint256 statLimit = statIncreaseLimit(fighter.level, fighter.agility);
        bool isSuccessfull = false;

        if((rns[0] % 100) < successChance){
            fighter.agility = fighter.agility + (rns[1] % statLimit) + 1;
            isSuccessfull=true;
        }
        if(fighter.agility > fighter.level * 10){
            fighter.agility = fighter.level * 10;
        }
                
        NFT(nftContract).updateFighter(_tokenId, fighter);
        emit TrainingDone(_tokenId, fighter, isSuccessfull);
    } 

    function finishTrainingDex (uint256 _tokenId) public nonReentrant {
        lib.Fighter memory fighter = NFT(nftContract).getFighterById(_tokenId);
        uint256[] memory rns = startTraining(_tokenId);
        bool isSuccessfull = false;
        uint256 successChance = trainingSuccessChance(fighter.level, fighter.dexterity, fighter.durability);
        uint256 statLimit = statIncreaseLimit(fighter.level, fighter.dexterity); 
        if((rns[0] % 100) < successChance){
            fighter.dexterity = fighter.dexterity + (rns[1] % statLimit) + 1;
            isSuccessfull=true;
        }
        if(fighter.dexterity > fighter.level * 10){
            fighter.dexterity = fighter.level * 10;
        }
                
        NFT(nftContract).updateFighter(_tokenId, fighter);
        emit TrainingDone(_tokenId, fighter, isSuccessfull);
    }
    function finishTrainingInt (uint256 _tokenId) public nonReentrant {
        lib.Fighter memory fighter = NFT(nftContract).getFighterById(_tokenId);
        uint256[] memory rns = startTraining(_tokenId);
        bool isSuccessfull = false;
        uint256 successChance = trainingSuccessChance(fighter.level, fighter.intelligence, fighter.durability);
        uint256 statLimit = statIncreaseLimit(fighter.level, fighter.intelligence);
        if((rns[0] % 100) < successChance){
            fighter.intelligence = fighter.intelligence + (rns[1] % statLimit) + 1;
            isSuccessfull=true;
        }
        if(fighter.intelligence > fighter.level * 10){
            fighter.intelligence = fighter.level * 10;
        }
                
        NFT(nftContract).updateFighter(_tokenId, fighter);
        emit TrainingDone(_tokenId, fighter, isSuccessfull);
    }
    
    function finishTrainingDur (uint256 _tokenId) public nonReentrant {
        lib.Fighter memory fighter = NFT(nftContract).getFighterById(_tokenId);
        uint256[] memory rns = startTraining(_tokenId);
        bool isSuccessfull = false;
        uint256 successChance = 50;
        uint256 statLimit = statIncreaseLimit(fighter.level, fighter.durability);
        
        if((rns[0] % 100) < successChance){
            fighter.durability = fighter.durability + (rns[1] % statLimit) + 1;
            isSuccessfull=true;
        }
        if(fighter.durability > fighter.level * 10){
            fighter.durability = fighter.level * 10;
        }
                
        NFT(nftContract).updateFighter(_tokenId, fighter);
        emit TrainingDone(_tokenId, fighter, isSuccessfull);
    } 

    function startTraining(uint256 _tokenId) internal returns(uint256[] memory){
        require(tokenIdToRandomNumber[_tokenId] > 0 , "ChainLink VRF is not ready");
        uint[] memory rns = new uint[](2);
        rns[0] = tokenIdToRandomNumber[_tokenId];
        rns[1] = uint256(keccak256(abi.encode(rns[0] ,_tokenId)));
        tokenIdToRandomNumber[_tokenId] = 0;
        return rns;
    }

    function trainingSuccessChance(uint _level, uint _stat, uint _dur) internal pure returns(uint256){
        return (((_level * 10) - _stat + _dur) / (_level)) * 5;
    }

    function statIncreaseLimit(uint _level, uint _stat) internal pure returns(uint256){
        return ((_level * 10 - _stat) / 10) + 1;
    }

    //--------------------------------------- ONLY OWNER ---------------------------------------------

    function pause(bool _state) public onlyOwner(){
        paused = _state;
    }

        
    function setCost(uint256 _newCost) public onlyOwner(){
        cost = _newCost;
    }

    function withdraw() public payable onlyOwner(){
        require(payable(msg.sender).send(address(this).balance));
    }
}
