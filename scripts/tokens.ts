import fs from 'fs';
import hre, { ethers as he } from 'hardhat';
import { ethers as ethers } from 'ethers';
import {
  CADC,
  CADC__factory,
  XSGD,
  XSGD__factory,
  EURS,
  EURS__factory,
} from '../typechain-types';

const main = async () => {
  await hre.run('compile');

  // const cadcfactory: CADC__factory = await he.getContractFactory('CADC');
  // const cadc: CADC = await cadcfactory.deploy();
  // await cadc.deployed();
  // console.log('cadc deployed to:', cadc.address);

  // const xsgdfactory: XSGD__factory = await he.getContractFactory('XSGD');
  // const xsgd: XSGD = await xsgdfactory.deploy();
  // await xsgd.deployed();
  // console.log('xsgd deployed to:', xsgd.address);

  const eursFactory: EURS__factory = await he.getContractFactory('EURS');
  const eurs: EURS = await eursFactory.deploy();
  await eurs.deployed();
  console.log('eurs deployed to:', eurs.address);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
