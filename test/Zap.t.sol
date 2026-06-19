// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "forge-std/Test.sol";

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeMath } from "@openzeppelin/contracts/utils/math/SafeMath.sol";

import { IOracle } from "../contracts/interfaces/IOracle.sol";
import { IERC20Detailed } from "../contracts/interfaces/IERC20Detailed.sol";
import { AssimilatorFactory } from "../contracts/AssimilatorFactory.sol";
import { CurveFactoryV2 } from "../contracts/CurveFactoryV2.sol";
import { Curve } from "../contracts/Curve.sol";
import { CurveInfo } from "../contracts/Structs.sol";
import { Config } from "../contracts/Config.sol";
import { Zap } from "../contracts/Zap.sol";

import { MockUser } from "./lib/MockUser.sol";
import { CheatCodes } from "./lib/CheatCodes.sol";
import { Mainnet } from "./lib/Address.sol";
import { DefaultCurve } from "./lib/CurveParams.sol";
import { MockOracleFactory } from "./lib/MockOracleFactory.sol";
import { MockToken } from "./lib/MockToken.sol";

import { Utils } from "./utils/Utils.sol";

contract ZapTest is Test {
    using SafeMath for uint256;
    CheatCodes cheats = CheatCodes(HEVM_ADDRESS);
    Utils utils;

    // account order is lp provider, trader, treasury
    MockUser[] public accounts;
    MockUser public victim;

    MockOracleFactory oracleFactory;
    // token order is gold, euroc, cadc, usdc
    IERC20Detailed[] public tokens;
    IOracle[] public oracles;
    Curve[] public curves;
    uint256[] public decimals;

    uint256[] public dividends = [20, 2];

    Config config;
    CurveFactoryV2 curveFactory;
    AssimilatorFactory assimFactory;

    // Zap contract
    Zap public zap;

    function setUp() public {
        utils = new Utils();
        // create temp accounts
        for (uint256 i = 0; i < 3; ++i) {
            accounts.push(new MockUser());
        }
        victim = new MockUser();
        // deploy zap contract
        zap = new Zap();
        // deploy gold token & init 3 stable coins
        MockToken gold = new MockToken();
        tokens.push(IERC20Detailed(address(gold)));
        tokens.push(IERC20Detailed(Mainnet.EUROC));
        tokens.push(IERC20Detailed(Mainnet.CADC));
        tokens.push(IERC20Detailed(Mainnet.USDC));

        // deploy mock oracle factory for deployed token (named gold)
        oracleFactory = new MockOracleFactory();
        oracles.push(
            oracleFactory.newOracle(
                address(tokens[0]),
                "goldOracle",
                9,
                20000000000
            )
        );
        oracles.push(IOracle(Mainnet.CHAINLINK_EUR_USD));
        oracles.push(IOracle(Mainnet.CHAINLINK_CAD_USD));
        oracles.push(IOracle(Mainnet.CHAINLINK_USDC_USD));
        cheats.startPrank(address(accounts[2]));

        config = new Config(50000, address(accounts[2]));
        // deploy new assimilator factory & curveFactory v2
        assimFactory = new AssimilatorFactory();
        curveFactory = new CurveFactoryV2(
            address(assimFactory),
            address(config)
        );
        assimFactory.setCurveFactory(address(curveFactory));
        // now deploy curves
        cheats.startPrank(address(accounts[2]));
        for (uint256 i = 0; i < 3; ++i) {
            CurveInfo memory curveInfo = CurveInfo(
                string(abi.encode("stb-curve-", i)),
                string(abi.encode("lp-", i)),
                address(tokens[i]),
                address(tokens[3]),
                DefaultCurve.BASE_WEIGHT,
                DefaultCurve.QUOTE_WEIGHT,
                oracles[i],
                oracles[3],
                DefaultCurve.ALPHA,
                DefaultCurve.BETA,
                DefaultCurve.MAX,
                DefaultCurve.EPSILON,
                DefaultCurve.LAMBDA
            );
            Curve _curve = curveFactory.newCurve(curveInfo);
            curves.push(_curve);
        }
        cheats.stopPrank();
        // now mint gold & silver tokens
        uint256 mintAmt = 300_000_000_000;
        for (uint256 i = 0; i < 4; ++i) {
            decimals.push(utils.tenToPowerOf(tokens[i].decimals()));
            if (i == 0) {
                tokens[0].mint(address(accounts[0]), mintAmt.mul(decimals[i]));
            } else {
                deal(
                    address(tokens[i]),
                    address(accounts[0]),
                    mintAmt.mul(decimals[i])
                );
            }
        }
        // now approve
        cheats.startPrank(address(accounts[0]));
        for (uint256 i = 0; i < 3; ++i) {
            tokens[i].approve(address(curves[i]), type(uint256).max);
            tokens[3].approve(address(curves[i]), type(uint256).max);
        }
        // approve for zap
        for (uint256 i = 0; i < 4; ++i) {
            tokens[i].approve(address(zap), type(uint256).max);
        }
        cheats.stopPrank();

        cheats.startPrank(address(victim));
        IERC20Detailed(Mainnet.EUROC).approve(address(zap), type(uint256).max);
        IERC20Detailed(Mainnet.USDC).approve(address(zap), type(uint256).max);
        deal(address(Mainnet.EUROC), address(victim), 100_000_000e6);
        cheats.stopPrank();
    }

    // // test swap of forex stable coin(euroc, cadc) usdc
    function testZap(uint256 amt) public {
        cheats.assume(amt > 100);
        cheats.assume(amt < 10000000);
        for (uint256 i = 0; i < 2; ++i) {
            // mint token to zapper
            deal(
                address(tokens[i + 1]),
                address(accounts[1]),
                amt * decimals[i + 1]
            );

            cheats.startPrank(address(accounts[1]));
            tokens[i + 1].approve(address(curves[i + 1]), type(uint256).max);
            tokens[3].approve(address(curves[i + 1]), type(uint256).max);
            tokens[i + 1].approve(address(zap), type(uint256).max);
            tokens[3].approve(address(zap), type(uint256).max);
            cheats.stopPrank();

            // first deposit
            cheats.startPrank(address(accounts[0]));
            curves[i + 1].deposit(
                1000000000 * 1e18,
                0,
                0,
                type(uint256).max,
                type(uint256).max,
                block.timestamp + 60
            );
            cheats.stopPrank();

            cheats.startPrank(address(accounts[1]));
            uint256 originalBaseBal = tokens[i + 1].balanceOf(
                address(accounts[1])
            );
            zap.zapFromBase(
                address(curves[i + 1]),
                originalBaseBal,
                block.timestamp + 60,
                0
            );
            // now try unzap
            IERC20(address(curves[i + 1])).approve(
                address(zap),
                type(uint256).max
            );
            zap.upzapFromQuote(
                address(curves[i + 1]),
                curves[i + 1].balanceOf(address(accounts[1])),
                0,
                block.timestamp + 60
            );
            uint256 currentBaseBal = tokens[i + 1].balanceOf(
                address(accounts[1])
            );
            uint256 currentQuoteBal = tokens[3].balanceOf(address(accounts[1]));
            int256 baseUSDPrice = oracles[i + 1].latestAnswer();
            int256 quoteUSDPrice = oracles[3].latestAnswer();
            originalBaseBal = originalBaseBal.div(decimals[i + 1]);
            currentBaseBal = currentBaseBal.div(decimals[i + 1]);
            currentQuoteBal = currentQuoteBal.div(decimals[3]);

            uint256 originalBaseInUSD = originalBaseBal.mul(
                uint256(baseUSDPrice)
            );
            uint256 currentBaseInUSD = currentBaseBal.mul(
                uint256(baseUSDPrice)
            );
            uint256 currentQuoteInUSD = currentQuoteBal.mul(
                uint256(quoteUSDPrice)
            );
            uint256 currentTotalInUSD = currentBaseInUSD.add(currentQuoteInUSD);
            assertApproxEqAbs(
                originalBaseInUSD,
                currentTotalInUSD,
                originalBaseInUSD.div(20)
            );
            tokens[3].transfer(
                address(accounts[2]),
                tokens[3].balanceOf(address(accounts[1]))
            );
            cheats.stopPrank();
        }
    }

    function test_Unzap() public {
        // first LP deposit
        cheats.startPrank(address(accounts[0]));
        curves[1].deposit(
            1_000_000_000 * 1e18,
            0,
            0,
            type(uint256).max,
            type(uint256).max,
            block.timestamp + 60
        );
        cheats.stopPrank();

        cheats.startPrank(address(victim));

        // victim zaps base -> LP
        zap.zapFromBase(
            address(curves[1]),
            20_000_000,
            block.timestamp + 60,
            0
        );
        // current base amount
        uint256 balanceAfterZap = tokens[1].balanceOf(address(victim));
        IERC20(address(curves[1])).approve(address(zap), type(uint256).max);
        // victim unzaps LP -> base
        zap.upzapFromQuote(
            address(curves[1]),
            curves[1].balanceOf(address(victim)),
            19_900_000,
            block.timestamp + 60
        );

        uint256 balanceAfterUnzap = tokens[1].balanceOf(address(victim));

        emit log_named_uint(
            "unzap received base",
            balanceAfterUnzap - balanceAfterZap
        );
    }

    function testFail_UnzapMinAmountNotMet() public {
        // first LP deposit
        cheats.startPrank(address(accounts[0]));
        curves[1].deposit(
            1000000000 * 1e18,
            0,
            0,
            type(uint256).max,
            type(uint256).max,
            block.timestamp + 60
        );
        cheats.stopPrank();

        // Second stage
        cheats.startPrank(address(victim));

        // victim zaps base -> LP again
        zap.zapFromBase(
            address(curves[1]),
            20_000_000,
            block.timestamp + 60,
            0
        );

        // current base amount
        uint256 secondBalanceAfterZap = tokens[1].balanceOf(address(victim));
        IERC20(address(curves[1])).approve(address(zap), type(uint256).max);
        cheats.stopPrank();

        // front-runner swaps quote -> base via zap
        emit log_named_uint(
            "USDC amount of attacker",
            tokens[3].balanceOf(address(accounts[1]))
        );
        cheats.startPrank(address(accounts[1]));

        // amount to swap can increase, depending on the alpha/beta parameters
        uint256 amount1 = curves[1].originSwap(
            address(tokens[3]),
            address(tokens[1]),
            200000000000000,
            0,
            block.timestamp + 60
        );
        cheats.stopPrank();

        // victim unzaps LP -> base, damaged via front-run
        cheats.startPrank(address(victim));
        zap.upzapFromQuote(
            address(curves[1]),
            curves[1].balanceOf(address(victim)),
            19_900_000,
            block.timestamp + 60
        );
    }
}
