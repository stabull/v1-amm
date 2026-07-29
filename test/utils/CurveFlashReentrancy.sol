pragma solidity ^0.8.13;

import "forge-std/Test.sol";

import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import { Curve } from "../../contracts/Curve.sol";
import { ICurve } from "../../contracts/interfaces/ICurve.sol";
import { IFlashCallback } from "../../contracts/interfaces/IFlashCallback.sol";
import { IERC20Detailed } from "../../contracts/interfaces/IERC20Detailed.sol";
import { Mainnet } from "../lib/Address.sol";
import { LowGasSafeMath } from "../lib/LowGasSafeMath.sol";
import { FlashParams, FlashCallbackData } from "./FlashStructs.sol";
import { Utils } from "./Utils.sol";

contract CurveFlashReentrancy is IFlashCallback, Test {
    using LowGasSafeMath for uint256;
    using LowGasSafeMath for int256;
    using SafeERC20 for IERC20;

    Curve public stbCurve;
    Utils utils;

    function flashCallback(
        uint256 fee0,
        uint256 fee1,
        bytes calldata data
    ) external override {
        FlashCallbackData memory decoded = abi.decode(
            data,
            (FlashCallbackData)
        );

        address curve = decoded.poolAddress;

        address token0 = ICurve(curve).derivatives(0);
        address token1 = ICurve(curve).derivatives(1);

        IERC20(token0).approve(address(curve), type(uint256).max);
        IERC20(token1).approve(address(curve), type(uint256).max);

        // Ensure flashed tokens exist
        assertEq(
            IERC20(token0).balanceOf(address(this)),
            uint256(100_000).mul(decoded.decimal0).add(decoded.amount0)
        );
        assertEq(
            IERC20(token1).balanceOf(address(this)),
            uint256(100_000).mul(decoded.decimal1).add(decoded.amount1)
        );

        uint256 amount0Owed = LowGasSafeMath.add(decoded.amount0, fee0);
        uint256 amount1Owed = LowGasSafeMath.add(decoded.amount1, fee1);

        // Reentrancy here
        // Need to deposit more because of the fee
        ICurve(curve).deposit(110_000e18, block.timestamp + 1);
    }

    function initFlash(address _stbCurve, FlashParams memory params) external {
        stbCurve = Curve(_stbCurve);

        stbCurve.flash(
            address(this),
            params.amount0,
            params.amount1,
            abi.encode(
                FlashCallbackData({
                    amount0: params.amount0,
                    amount1: params.amount1,
                    decimal0: params.decimal0,
                    decimal1: params.decimal1,
                    poolAddress: _stbCurve
                })
            )
        );
    }
}
