import * as dotenv from 'dotenv';
import '@nomicfoundation/hardhat-toolbox';
import { HardhatUserConfig } from 'hardhat/config';
import 'hardhat-contract-sizer';
import '@nomiclabs/hardhat-solhint';
import '@primitivefi/hardhat-dodoc';

dotenv.config();

const PRIVATE_KEY: string = process.env.PRIVATE_KEY as string;
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const POLYGON_MUMBAI_RPC_URL = process.env.POLYGON_MUMBAI_RPC_URL;
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY;
const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.19',
        settings: {
          // viaIR: true,
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  /**
   * @abstract Configure the mocha test timeout for testing the contracts.
   * @description Most contract functions take a while to execute, especially when making
   * multiple calls, hence, increasing the timeout enables all the tests to reach completion.
   * @default 2000 ms
   */
  mocha: {
    timeout: 100000000,
  },
  networks: {
    hardhat: {
      // /**
      //  * @see {@link https://hardhat.org/hardhat-network/reference/#allowunlimitedcontractsize}
      //  * @default false
      //  */
      forking: {
        url: `https://eth-mainnet.g.alchemy.com/v2/${ETHERSCAN_API_KEY}`,
      },
    },
    /**
     * @description This is the default network for truffle dashboard.
     * There is no need to paste PRIVATE_KEY for deployment. This enables the connection to the
     * MetaMask wallet in the browser from where the contract deployment transcation can be signed.
     * @see {@link https://trufflesuite.com/docs/truffle/getting-started/using-the-truffle-dashboard/}
     */
    truffle: {
      url: 'http://localhost:24012/rpc',
    },

    /**
     * @description Network to be used during the smart contract verification.
     * @dev uncomment the @param accounts to use your private key for deployments.
     */
    mainnet: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      chainId: 1,
      // accounts: [`0x${PRIVATE_KEY}`],
    },
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      chainId: 5,
      // accounts: [`0x${PRIVATE_KEY}`],
    },
    sepolia: {
      url: `https://rpc.sepolia.dev`,
      chainId: 11155111,
      // accounts: [`0x${PRIVATE_KEY}`],
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/${POLYGON_MUMBAI_RPC_URL}`,
      gasPrice: 3500000000,
      chainId: 80001,
      accounts: [`0x${PRIVATE_KEY}`],
    },
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${POLYGONSCAN_API_KEY}`,
      chainId: 137,
      accounts: [`0x${PRIVATE_KEY}`],
      gasPrice: 3500000000,
    },

    localhost: {
      timeout: 1000000000,
    },
    local: {
      url: 'http://localhost:24012/rpc',
    },
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    token: 'ETH',
    gasPrice: 21,
    showTimeSpent: true,
    outputFile: 'gas-report.txt',
    noColors: true,
  },
  paths: {
    artifacts: 'build/artifacts',
    cache: 'build/cache',
    sources: 'src',
  },
  /**
   * @description This works along with the @package hardhat-contract-sizer to generate the size of the smart contracts.
   * @see {@link https://github.com/ItsNickBarry/hardhat-contract-sizer#readme}
   * @dev The size of any smart contract should not exceed 24 KB for deployment.
   * @see {@link https://ethereum.org/en/developers/docs/smart-contracts/#limitations}
   */
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: false,
    strict: true,
    only: [],
    except: [],
  },
  /**
   * @description This works along with the @package hardhat-dodoc to generate the documentation of the smart contracts.
   * @see {@link https://github.com/primitivefinance/primitive-dodoc#readme}
   */
  dodoc: {
    runOnCompile: false,
    debugMode: true,
    include: ['contracts'],
    exclude: [],
    outputDir: 'docs',
  },
  /**
   * @description The following config requires the @param apiKey to be set
   * for the verification of the contracts.
   * */
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};

export default config;
