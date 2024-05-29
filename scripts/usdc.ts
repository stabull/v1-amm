import hre, { ethers as he } from 'hardhat';
import { ethers as ethers } from 'ethers';
import { USDC, USDC__factory } from '../typechain-types';

const main = async () => {
  await hre.run('compile');

  // deploy USDC contract
  const USDC: USDC__factory = await he.getContractFactory('USDC');
  const usdc: USDC = await USDC.deploy();
  await usdc.deployed();
  console.log('USDC deployed to:', usdc.address);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
