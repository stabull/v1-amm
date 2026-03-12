// SPDX-License-Identifier: MIT

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is disstributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

pragma solidity 0.8.19;

import "./interfaces/IQuotable.sol";

contract Quotable is IQuotable {
	function quoteAddress(Tokens _base_asset) public view returns (address) {
		uint256 chainID;
		assembly {
			chainID := chainid()
		}
		if (_base_asset == Tokens.NZDS) {
			if (chainID == 1) {
				// Ethereum Mainnet
				return 0xDa446fAd08277B4D2591536F204E018f32B6831c;
			} else if (chainID == 137) {
				// Polygon Mainnet
				return 0xFbBE4b730e1e77d02dC40fEdF9438E2802eab3B5;
			}
		}
		if (_base_asset == Tokens.USDC) {
			if (chainID == 1) {
				// Ethereum Mainnet
				return 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
			} else if (chainID == 31337) {
				// Hardhat Local Network
				return 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359;
			} else if (chainID == 42161) {
				// Arbitrum One
				return 0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8;
			} else if (chainID == 137) {
				// Polygon Mainnet
				return 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359;
			} else if (chainID == 42161) {
				// Arbitrum One
				return 0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8;
			} else if (chainID == 8453) {
				// Base Mainnet
				return 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
			} else if (chainID == 84532) {
				// Base Sepolia
				return 0xe66B091638aBeAa631CfA99b8c9B26Be844c2756;
			} else if (chainID == 80002) {
				// Polygon Amoy Testnet
				return 0xe66B091638aBeAa631CfA99b8c9B26Be844c2756;
			}
		}

		return address(0);
	}
}
