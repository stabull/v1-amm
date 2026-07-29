// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

contract Utils {
    function tenToPowerOf(uint256 decimals) public pure returns (uint256 pow) {
        if (decimals == 2) {
            return 1e2;
        }
        if (decimals == 8) {
            return 1e8;
        }
        if (decimals == 6) {
            return 1e6;
        }
        if (decimals == 18) {
            return 1e18;
        }
        if (decimals == 0) {
            return 1;
        }
        return 0;
    }
}
