import hre from 'hardhat';

const main = async () => {
  await hre.run('verify:verify', {
    address: '<cadcusd pool contract address>',
    constructorArguments: [
      'nzd-cadc-usdc',
      'nzd-cadc',
      [
        '0xC1BcC45f1A9f587af9B546AdC34a4c1C5FaCB53D', // CADC
        '0xa090d0b5a1989c8cf04bff88a3854936bd32812b', 
        '0xC1BcC45f1A9f587af9B546AdC34a4c1C5FaCB53D', // CADC
        '0xa090d0b5a1989c8cf04bff88a3854936bd32812b', 
        '0xC1BcC45f1A9f587af9B546AdC34a4c1C5FaCB53D', // CADC
        '0x77730cF052837ebc2f8f1398CAD38D946e58d432', // USDC
        '0x6a9d55648d690bccf1602bb294363bc91d511826', 
        '0x77730cF052837ebc2f8f1398CAD38D946e58d432', // USDC
        '0x6a9d55648d690bccf1602bb294363bc91d511826', 
        '0x77730cF052837ebc2f8f1398CAD38D946e58d432', // USDC
      ],
      ['500000000000000000', '500000000000000000'], 
      '0xeAbb6E0da0E02c938eCbc4ab61E38d381a500a3e',
    ],
  });

  //  this data below is incorrect, pelase correct before verification

  // await hre.run('verify:verify', {
  //   address: '0xa090d0b5a1989c8cf04bff88a3854936bd32812b', 
  //   constructorArguments: [
  //     '0x0FCAa9c899EC5A91eBc3D5Dd869De833b06fB046', // Base Oracle (CADC)
  //     '0xC1BcC45f1A9f587af9B546AdC34a4c1C5FaCB53D', // CADC
  //     '2', // baseDec
  //     '6', // quoteDec
  //   ],
  // });

  // await hre.run('verify:verify', {
  //   address: '0x6a9d55648d690bccf1602bb294363bc91d511826', 
  //   constructorArguments: [
  //     '0x572dDec9087154dC5dfBB1546Bb62713147e0Ab0', // Quote Oracle (USDC)
  //     '0x77730cF052837ebc2f8f1398CAD38D946e58d432', // USDC
  //     '2', // baseDec
  //     '6', // quoteDec
  //   ],
  // });
};


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
