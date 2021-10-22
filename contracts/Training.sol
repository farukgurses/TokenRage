// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "./NFT.sol";
import "./Library.sol";

contract Training is ReentrancyGuard, VRFConsumerBase{
    
    event RequestedTraining(bytes32 indexed requestId, uint256 indexed tokenId);
    event ReadyForTraining(uint256 indexed tokenId, uint256 indexed randomNumber);
    event TrainingDone(uint256 indexed tokenId, lib.Fighter indexed fighter);

    address payable owner;
    address private nftContract;
    
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
        owner = payable(msg.sender);
    }

    function requestTraining (uint256 _tokenId) public payable nonReentrant returns(bytes32 requestId){
        requestId = requestRandomness(keyHash, fee);
        requestIdToTokenId[requestId] = _tokenId;
        emit RequestedTraining(requestId, _tokenId);
    }

    function fulfillRandomness(bytes32 _requestId, uint256 _randomNumber) internal override {
        uint256 tokenId = requestIdToTokenId[_requestId];
        tokenIdToRandomNumber[tokenId] = _randomNumber;
        emit ReadyForTraining(tokenId, _randomNumber);
    }

    function finishTraining (uint256 _tokenId) public nonReentrant {
        require(tokenIdToRandomNumber[_tokenId] > 0 , "ChainLink VRF is not ready");
        uint256 randomNumber = tokenIdToRandomNumber[_tokenId];
        tokenIdToRandomNumber[_tokenId] = 0;
        lib.Fighter memory fighter = NFT(nftContract).getFighterById(_tokenId);

        // TODO: Work on training logic
        // This is just a placeholder to see if it works
        fighter.strength = fighter.strength + (randomNumber % 10) + 1;
        NFT(nftContract).updateFighter(_tokenId, fighter);

        emit TrainingDone(_tokenId, fighter);
    }
    
}
