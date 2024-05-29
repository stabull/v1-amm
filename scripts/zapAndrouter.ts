import hre, { ethers as he } from 'hardhat';
import { Zap, Zap__factory, Router, Router__factory } from '../typechain-types';

const main = async () => {
  await hre.run('compile');

  // const Zap: Zap__factory = await he.getContractFactory('Zap');
  // const zap: Zap = await Zap.deploy();
  // await zap.deployed();
  // console.log('Zap deployed to:', zap.address);

  const Router: Router__factory = await he.getContractFactory('Router');
  const router: Router = await Router.deploy(
    '0xeAbb6E0da0E02c938eCbc4ab61E38d381a500a3e'
  );
  await router.deployed();
  console.log('Router deployed to:', router.address);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
