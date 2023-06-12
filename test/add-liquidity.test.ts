import hre, { ethers } from 'hardhat';
import { expect } from 'chai';
import {
  AssimilatorFactory,
  AssimilatorFactory__factory,
  Config,
  Config__factory,
  CurveFactoryV2,
  CurveFactoryV2__factory,
  Curves,
  Curves__factory,
  Orchestrator,
  Orchestrator__factory,
  ProportionalLiquidity,
  ProportionalLiquidity__factory,
  RIDC,
  RIDC__factory,
  Swaps,
  Swaps__factory,
  USDC,
  USDC__factory,
  CADC,
  CADC__factory,
  Curve,
  Router__factory,
  Router,
} from '../typechain-types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { int } from 'hardhat/internal/core/params/argumentTypes';
import assert from 'assert';

describe('Add liquidity', async () => {
  let owner: SignerWithAddress,
    user1: SignerWithAddress,
    user2: SignerWithAddress,
    user3: SignerWithAddress;

  before(async () => {
    const accounts: SignerWithAddress[] = await ethers.getSigners();
    owner = accounts[0];
    user1 = accounts[1];
    user2 = accounts[2];
    user3 = accounts[2];
  });

  it('should add liquidity', async () => {
    await hre.run('compile');

    const multiSigAddress: string = `0x6F00C5E578D440c6c7F4d837dE5AFADf1d7d9F12`;

    // deploy USDC contract
    const USDC: USDC__factory = await ethers.getContractFactory('USDC');
    const usdc: USDC = await USDC.deploy();
    await usdc.deployed();
    console.log('USDC deployed to:', usdc.address);

    // deploy RIDC contract
    const RIDC: RIDC__factory = await ethers.getContractFactory('RIDC');
    const ridc: RIDC = await RIDC.deploy();
    await ridc.deployed();
    console.log('RIDC deployed to:', ridc.address);

    // deploy RIDC contract
    const CADC: CADC__factory = await ethers.getContractFactory('CADC');
    const cadc: CADC = await CADC.deploy();
    await cadc.deployed();
    console.log('CADC deployed to:', cadc.address);

    // deploy AssimilatorFactory contract
    const AssimilatorFactory: AssimilatorFactory__factory =
      await ethers.getContractFactory('AssimilatorFactory');
    const assimilatorFactory: AssimilatorFactory =
      await AssimilatorFactory.deploy();
    await assimilatorFactory.deployed();
    console.log('AssimilatorFactory deployed to:', assimilatorFactory.address);

    // deploy Config contract
    const protocolFee: number = 50000;

    const ConfigFactory: Config__factory = await ethers.getContractFactory(
      'Config'
    );
    const config: Config = await ConfigFactory.deploy(
      protocolFee,
      multiSigAddress
    );
    await config.deployed();
    console.log('Config deployed to:', config.address);

    // deploy the libraries
    const Curves: Curves__factory = await ethers.getContractFactory('Curves');
    const curves: Curves = await Curves.deploy();
    await curves.deployed();
    console.log('Library Curves deployed to:', curves.address);

    const Orchestrator: Orchestrator__factory = await ethers.getContractFactory(
      'Orchestrator'
    );
    const orchestrator: Orchestrator = await Orchestrator.deploy();
    await orchestrator.deployed();
    console.log('Library Orchestrator deployed to:', orchestrator.address);

    const ProportionalLiquidity: ProportionalLiquidity__factory =
      await ethers.getContractFactory('ProportionalLiquidity');
    const proportionalLiquidity: ProportionalLiquidity =
      await ProportionalLiquidity.deploy();
    await proportionalLiquidity.deployed();
    console.log(
      'Library ProportionalLiquidity deployed to:',
      proportionalLiquidity.address
    );

    const Swaps: Swaps__factory = await ethers.getContractFactory('Swaps');
    const swaps: Swaps = await Swaps.deploy();
    await swaps.deployed();
    console.log('Library Swaps deployed to:', swaps.address);

    const ViewLiquidity = await ethers.getContractFactory('ViewLiquidity');
    const viewLiquidity = await ViewLiquidity.deploy();
    await viewLiquidity.deployed();
    console.log('Library ViewLiquidity deployed to:', viewLiquidity.address);

    // deploy CurveFactoryV2
    const CurveFactoryV2: CurveFactoryV2__factory =
      await ethers.getContractFactory('CurveFactoryV2', {
        libraries: {
          Curves: curves.address,
          Orchestrator: orchestrator.address,
          ProportionalLiquidity: proportionalLiquidity.address,
          Swaps: swaps.address,
          ViewLiquidity: viewLiquidity.address,
        },
      });
    const curveFactoryV2: CurveFactoryV2 = await CurveFactoryV2.deploy(
      assimilatorFactory.address,
      config.address
    );
    await curveFactoryV2.deployed();
    console.log('CurveFactoryV2 deployed to:', curveFactoryV2.address);

    // Attach CurveFactoryV2 to Assimilator
    await assimilatorFactory.setCurveFactory(curveFactoryV2.address);
    console.log(`CurveFactoryV2 attached to Assimilator`);

    // Deploy new curve for ridc-usdc
    const curveInfo = {
      _name: 'rix-ridc-usdc',
      _symbol: 'rix-ridc',
      _baseCurrency: ridc.address,
      _quoteCurrency: usdc.address,
      _baseWeight: '500000000000000000',
      _quoteWeight: '500000000000000000',
      _baseOracle: '0x92C09849638959196E976289418e5973CC96d645',
      _quoteOracle: '0x572dDec9087154dC5dfBB1546Bb62713147e0Ab0',
      _alpha: '500000000000000000',
      _beta: '350000000000000000',
      _feeAtHalt: '150000000000000000',
      _epsilon: '500000000000000',
      _lambda: ethers.constants.WeiPerEther,
    };

    await curveFactoryV2.newCurve(curveInfo);
    console.log(' ridc deployed');
    let curveAdd = await curveFactoryV2.getCurve(ridc.address, usdc.address);
    const curveRidc = await hre.ethers.getContractAt('Curve', curveAdd);
    await ridc
      .connect(user1)
      .approve(curveRidc.address, ethers.constants.MaxUint256);
    await usdc
      .connect(user1)
      .approve(curveRidc.address, ethers.constants.MaxUint256);
    await usdc.connect(owner).transfer(user1.address, 10 ** 15);
    await ridc.connect(owner).transfer(user1.address, 20 ** 12);

    // Deploy new curve for cadc-usdc
    const curveInfo2 = {
      _name: 'rix-cadc-usdc',
      _symbol: 'rix-cadc',
      _baseCurrency: cadc.address,
      _quoteCurrency: usdc.address,
      _baseWeight: '500000000000000000',
      _quoteWeight: '500000000000000000',
      _baseOracle: '0xEB0fb293f368cE65595BeD03af3D3f27B7f0BD36',
      _quoteOracle: '0x572dDec9087154dC5dfBB1546Bb62713147e0Ab0',
      _alpha: '500000000000000000',
      _beta: '350000000000000000',
      _feeAtHalt: '150000000000000000',
      _epsilon: '500000000000000',
      _lambda: ethers.constants.WeiPerEther,
    };

    await curveFactoryV2.newCurve(curveInfo2);
    console.log(' cadc deployed');
    let curveAdd2 = await curveFactoryV2.getCurve(cadc.address, usdc.address);
    const curveCadc = await hre.ethers.getContractAt('Curve', curveAdd2);
    await cadc
      .connect(user1)
      .approve(curveCadc.address, ethers.constants.MaxUint256);
    await usdc
      .connect(user1)
      .approve(curveCadc.address, ethers.constants.MaxUint256);
    await cadc.connect(owner).transfer(user1.address, 30 ** 10);

    // check deposit for ridc-usdc
    const bal1 = await curveRidc.balanceOf(user1.address);
    expect(bal1.toNumber()).equals(0);
    console.log('ridc deposit start');
    await curveRidc
      .connect(user1)
      .deposit(
        10 ** 10,
        0,
        0,
        ethers.constants.MaxUint256,
        ethers.constants.MaxUint256,
        1985158003
      );
    console.log('ridc deposit end');
    const bal2 = await curveRidc.balanceOf(user1.address);
    expect(bal2).to.be.greaterThan(0);

    // check deposit for cadc-usdc
    console.log('cadc deposit start');
    await curveCadc
      .connect(user1)
      .deposit(
        20 ** 10,
        0,
        0,
        ethers.constants.MaxUint256,
        ethers.constants.MaxUint256,
        1985158003
      );
    console.log('cadc deposit end');

    //swap function using curve
    // const bal3 = await ridc.balanceOf(user1.address);
    // console.log('swap start', bal3.toNumber());
    // await curveRidc
    //   .connect(user1)
    //   .originSwap(ridc.address, usdc.address, 10 ** 5, 0, 1685158003);

    // const bal4 = await ridc.balanceOf(user1.address);
    // console.log('swap end', bal4.toNumber());
    // expect(bal3.toNumber()).to.be.greaterThan(bal4.toNumber());
    // console.log('ridc curve data', (await curveRidc.curve()).toString());

    //router deploy
    const RouterFac: Router__factory = await hre.ethers.getContractFactory(
      'Router'
    );
    const router: Router = await RouterFac.deploy(curveFactoryV2.address);
    console.log('router contract deployed at :', router.address);

    //swap using router
    console.log('Router origin swap start');
    const bal5 = await usdc.balanceOf(user1.address);

    await cadc
      .connect(user1)
      .approve(router.address, ethers.constants.MaxUint256);
    await usdc
      .connect(user1)
      .approve(curveCadc.address, ethers.constants.MaxUint256);
    await usdc
      .connect(user1)
      .approve(router.address, ethers.constants.MaxUint256);
    await router
      .connect(user1)
      .originSwap(
        usdc.address,
        cadc.address,
        ridc.address,
        1000,
        0,
        1985158003
      );
    0x23b77b211b8796707010e7a55137d8dba14e0df1;
    const bal6 = await usdc.balanceOf(user1.address);

    console.log('Router swap end');
    console.log('ridc curve data', (await curveRidc.curve()).toString());
    console.log('cadc curve data', (await curveCadc.curve()).toString());
  });

  it('should add liquidity', async () => {});
});
