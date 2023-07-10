import hre from 'hardhat';

const main = async () => {
  await hre.run('verify:verify', {
    address: '0x44bC4A67F63dEf07Ba83b8546b932E707917b5bf',
    constructorArguments: [
      'eur-eurs-usdc',
      'eur-eurs',
      [
        '0x1E4976E3C33eD8af766Fe1617Fb492f3275407ee',
        '0xb0A10859A8b2Df7E2E865152E931e6AA14A8580a',
        '0x1E4976E3C33eD8af766Fe1617Fb492f3275407ee',
        '0xb0A10859A8b2Df7E2E865152E931e6AA14A8580a',
        '0x1E4976E3C33eD8af766Fe1617Fb492f3275407ee',
        '0x77730cF052837ebc2f8f1398CAD38D946e58d432',
        '0x526832503B715ed8a8C0e8c729B0790173cE2D79',
        '0x77730cF052837ebc2f8f1398CAD38D946e58d432',
        '0x526832503B715ed8a8C0e8c729B0790173cE2D79',
        '0x77730cF052837ebc2f8f1398CAD38D946e58d432',
      ],
      ['500000000000000000', '500000000000000000'],
      '0x10D604081301BE79Ca27FC935642187c5F20D149',
    ],
  });

  await hre.run('verify:verify', {
    address: '0xb0A10859A8b2Df7E2E865152E931e6AA14A8580a',
    constructorArguments: [
      '0x7d7356bF6Ee5CDeC22B216581E48eCC700D0497A',
      '0x1E4976E3C33eD8af766Fe1617Fb492f3275407ee',
      '2',
      '8',
    ],
  });
  await hre.run('verify:verify', {
    address: '0x526832503B715ed8a8C0e8c729B0790173cE2D79',
    constructorArguments: [
      '0x572dDec9087154dC5dfBB1546Bb62713147e0Ab0',
      '0x77730cF052837ebc2f8f1398CAD38D946e58d432',
      '6',
      '8',
    ],
  });
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
