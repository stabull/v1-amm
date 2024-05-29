import fs from 'fs';
import hre, { ethers as he } from 'hardhat';
import { ethers as ethers } from 'ethers';
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
  Swaps,
  Swaps__factory,
} from '../typechain-types';

const main = async () => {
  await hre.run('compile');
  console.log("Inside stabull deployment");

  const multiSigAddress: string = `0x6Ace617029fbDD640209cD65C3Df886Bf3FB9a5f`;
  console.log('1');
  // deploy AssimilatorFactory contract
  const AssimilatorFactory: AssimilatorFactory__factory =
    await he.getContractFactory('AssimilatorFactory');
    console.log('2');
  const assimilatorFactory: AssimilatorFactory =
    await AssimilatorFactory.deploy();
    console.log('3');
  await assimilatorFactory.deployed();
  console.log('AssimilatorFactory deployed to:', assimilatorFactory.address);

  // deploy Config contract
  const protocolFee: number = 50000;

  const ConfigFactory: Config__factory = await he.getContractFactory('Config');
  const config: Config = await ConfigFactory.deploy(
    protocolFee,
    multiSigAddress
  );
  await config.deployed();
  console.log('Config deployed to:', config.address);

  // deploy the libraries
  const Curves: Curves__factory = await he.getContractFactory('Curves');
  const curves: Curves = await Curves.deploy();
  await curves.deployed();
  console.log('Library Curves deployed to:', curves.address);

  const Orchestrator: Orchestrator__factory = await he.getContractFactory(
    'Orchestrator'
  );
  const orchestrator: Orchestrator = await Orchestrator.deploy();
  await orchestrator.deployed();
  console.log('Library Orchestrator deployed to:', orchestrator.address);

  const ProportionalLiquidity: ProportionalLiquidity__factory =
    await he.getContractFactory('ProportionalLiquidity');
  const proportionalLiquidity: ProportionalLiquidity =
    await ProportionalLiquidity.deploy();
  await proportionalLiquidity.deployed();
  console.log(
    'Library ProportionalLiquidity deployed to:',
    proportionalLiquidity.address
  );

  const Swaps: Swaps__factory = await he.getContractFactory('Swaps');
  const swaps: Swaps = await Swaps.deploy();
  await swaps.deployed();
  console.log('Library Swaps deployed to:', swaps.address);

  const ViewLiquidity = await he.getContractFactory('ViewLiquidity');
  const viewLiquidity = await ViewLiquidity.deploy();
  await viewLiquidity.deployed();
  console.log('Library ViewLiquidity deployed to:', viewLiquidity.address);

  // deploy CurveFactoryV2
  const CurveFactoryV2: CurveFactoryV2__factory = await he.getContractFactory(
    'CurveFactoryV2',
    {
      libraries: {
        Curves: curves.address,
        Orchestrator: orchestrator.address,
        ProportionalLiquidity: proportionalLiquidity.address,
        Swaps: swaps.address,
        ViewLiquidity: viewLiquidity.address,
      },
    }
  );
  const curveFactoryV2: CurveFactoryV2 = await CurveFactoryV2.deploy(
    assimilatorFactory.address,
    config.address
  );
  await curveFactoryV2.deployed();
  console.log('CurveFactoryV2 deployed to:', curveFactoryV2.address);

  // Attach CurveFactoryV2 to Assimilator
  await assimilatorFactory.setCurveFactory(curveFactoryV2.address);
  console.log(`CurveFactoryV2 attached to Assimilator`);

  // Deploy new curve
  // Here give the info of curve that needs to deployed intitially during the time of deploying contracts
  const curveInfo = {
    _name: 'nzd-nzdc-usdc',
    _symbol: 'nzd-nzdc',
    _baseCurrency: '0x1E4976E3C33eD8af766Fe1617Fb492f3275407ee',
    _quoteCurrency: '0x77730cF052837ebc2f8f1398CAD38D946e58d432',
    _baseWeight: '500000000000000000',
    _quoteWeight: '500000000000000000',
    _baseOracle: '0x7d7356bF6Ee5CDeC22B216581E48eCC700D0497A',
    _quoteOracle: '0x572dDec9087154dC5dfBB1546Bb62713147e0Ab0',
    _alpha: '500000000000000000',
    _beta: '350000000000000000',
    _feeAtHalt: '150000000000000000',
    _epsilon: '500000000000000',
    _lambda: ethers.constants.WeiPerEther,
  };

   await curveFactoryV2.newCurve(curveInfo);
  console.log(`New Curve deployed`);

  /**
   * @summary A build folder will be created in the root directory of the project
   * where the ABI, network name, chainId and the deployed address will be saved inside a JSON file.
   */
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
