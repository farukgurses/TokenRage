// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "./NFT.sol";
import "./Library.sol";

contract  Fighting is ReentrancyGuard, VRFConsumerBase{
    
    address payable owner;
    address private nftContract;
    uint256 openToFightCount; 
    
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

    function setOpenToFight(uint256 _tokenId, bool _state) public nonReentrant{
        require(msg.sender == IERC721(nftContract).ownerOf(_tokenId), 'Not owner of this token');
        if(_state){
            lib.Fighter memory myFighter = NFT(nftContract).getFighterById(_tokenId);
        }
    }
    function fulfillRandomness(bytes32 _requestId, uint256 _randomNumber) internal override {
        uint256 tokenId = requestIdToTokenId[_requestId];
        tokenIdToRandomNumber[tokenId] = _randomNumber;
    }
}
