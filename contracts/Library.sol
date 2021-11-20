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
        uint location;
        string fighterType;
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

    function expand(uint256 _randomNumber, uint256 _count, uint256 _limit) internal pure returns(uint256[] memory _randomArray){
        _randomArray = new uint256[](_count);
        for(uint i = 1; i <= _count; i++){
            uint256 newRN = uint256(keccak256(abi.encode(_randomNumber,i)));
            _randomArray[i-1] = ((newRN % _limit) + 1);
        }
        return _randomArray;
    }
}
