// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";

import { AssimilatorFactory } from "../../contracts/AssimilatorFactory.sol";
import { CurveFactoryV2 } from "../../contracts/CurveFactoryV2.sol";
import { Curve } from "../../contracts/Curve.sol";
import { IERC20Detailed } from "../../contracts/interfaces/IERC20Detailed.sol";

import { MockUser } from "../lib/MockUser.sol";
import { CheatCodes } from "../lib/CheatCodes.sol";
import { Mainnet } from "../lib/Address.sol";
import { DefaultCurve } from "../lib/CurveParams.sol";

contract FactoryAddressCheck is Test {
    AssimilatorFactory assimilatorFactory;

    function setUp() public {
        assimilatorFactory = new AssimilatorFactory();
    }

    function testFailZeroFactoryAddress() public {
        assimilatorFactory.setCurveFactory(address(0));
        fail("AssimFactory/curve factory zero address!");
    }
}
