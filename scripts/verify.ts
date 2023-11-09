import hre from 'hardhat';

const main = async () => {
  // await hre.run('verify:verify', {
  //   address: '0x8a908ae045e611307755a91f4d6ecd04ed31eb1b',
  //   constructorArguments: [
  //     'nzd-nzdc-usdc',
  //     'nzd-nzdc',
  //     [
  //       '0xFbBE4b730e1e77d02dC40fEdF9438E2802eab3B5',
  //       '0x8ba5bddc1cd6d1a0c757982b2af3eb6db53903e0',
  //       '0xFbBE4b730e1e77d02dC40fEdF9438E2802eab3B5',
  //       '0x8ba5bddc1cd6d1a0c757982b2af3eb6db53903e0',
  //       '0xFbBE4b730e1e77d02dC40fEdF9438E2802eab3B5',
  //       '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  //       '0x53b105e1d48a76cdb955d037f042c830d14d82ab',
  //       '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  //       '0x53b105e1d48a76cdb955d037f042c830d14d82ab',
  //       '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  //     ],
  //     ['500000000000000000', '500000000000000000'],
  //     '0x86Ba17ebf8819f7fd32Cf1A43AbCaAe541A5BEbf',
  //   ],
  // });

  await hre.run('verify:verify', {
    address: '0x8ba5bddc1cd6d1a0c757982b2af3eb6db53903e0',
    constructorArguments: [
      '0xa302a0B8a499fD0f00449df0a490DedE21105955',
      '0xFbBE4b730e1e77d02dC40fEdF9438E2802eab3B5',
      '6',
      '8',
    ],
  });
  await hre.run('verify:verify', {
    address: '0x53b105e1d48a76cdb955d037f042c830d14d82ab',
    constructorArguments: [
      '0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7',
      '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
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
