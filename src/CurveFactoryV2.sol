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
pragma experimental ABIEncoderV2;

// Finds new Curves! logs their addresses and provides `isCurve(address) -> (bool)`

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./Curve.sol";
import "./interfaces/IFreeFromUpTo.sol";
import "./AssimilatorFactory.sol";
import "./assimilators/AssimilatorV2.sol";
import "./interfaces/ICurveFactory.sol";
import "./interfaces/IAssimilatorFactory.sol";
import "./interfaces/IERC20Detailed.sol";
import "./interfaces/IConfig.sol";
import "./Structs.sol";

contract CurveFactoryV2 is ICurveFactory, Ownable {
	using Address for address;

	IAssimilatorFactory public immutable assimilatorFactory;
	IConfig public config;

	address private USDC;

	event NewCurve(
		address indexed caller,
		bytes32 indexed id,
		address indexed curve
	);

	mapping(bytes32 => address) public curves;

	constructor(address _assimFactory, address _config) {
		require(
			_assimFactory.isContract(),
			"CurveFactory/invalid-assimFactory"
		);
		assimilatorFactory = IAssimilatorFactory(_assimFactory);
		require(_config.isContract(), "CurveFactory/invalid-config");
		config = IConfig(_config);
	}

	function getGlobalFrozenState()
		external
		view
		virtual
		override
		returns (bool)
	{
		return config.getGlobalFrozenState();
	}

	function getFlashableState() external view virtual override returns (bool) {
		return config.getFlashableState();
	}

	function getProtocolFee() external view virtual override returns (int128) {
		return config.getProtocolFee();
	}

	function getProtocolTreasury()
		public
		view
		virtual
		override
		returns (address)
	{
		return config.getProtocolTreasury();
	}

	function isPoolGuarded(address pool) external view override returns (bool) {
		return config.isPoolGuarded(pool);
	}

	function getPoolGuardAmount(
		address pool
	) external view override returns (uint256) {
		return config.getPoolGuardAmount(pool);
	}

	function getPoolCap(address pool) external view override returns (uint256) {
		return config.getPoolCap(pool);
	}

	function getCurve(
		address _baseCurrency,
		address _quoteCurrency
	) external view returns (address) {
		bytes32 curveId = keccak256(abi.encode(_baseCurrency, _quoteCurrency));
		return (curves[curveId]);
	}

	function newCurve(CurveInfo memory _info) public onlyOwner returns (Curve) {
		require(
			_info._quoteCurrency == quoteAddress(),
			"CurveFactory/quote-currency-is-not-usdc"
		);
		require(
			_info._baseCurrency != quoteAddress(),
			"CurveFactory/base-currency-is-usdc"
		);

		require(
			_info._baseWeight == 5e17 && _info._quoteWeight == 5e17,
			"CurveFactory/weights-not-50-percent"
		);

		uint256 quoteDec = IERC20Detailed(_info._quoteCurrency).decimals();
		uint256 baseDec = IERC20Detailed(_info._baseCurrency).decimals();

		bytes32 curveId = keccak256(
			abi.encode(_info._baseCurrency, _info._quoteCurrency)
		);
		if (curves[curveId] != address(0)) revert("CurveFactory/pair-exists");
		AssimilatorV2 _baseAssim;
		_baseAssim = (assimilatorFactory.getAssimilator(_info._baseCurrency));
		if (address(_baseAssim) == address(0))
			_baseAssim = (
				assimilatorFactory.newAssimilator(
					_info._baseOracle,
					_info._baseCurrency,
					baseDec
				)
			);
		AssimilatorV2 _quoteAssim;
		_quoteAssim = (assimilatorFactory.getAssimilator(_info._quoteCurrency));
		if (address(_quoteAssim) == address(0))
			_quoteAssim = (
				assimilatorFactory.newAssimilator(
					_info._quoteOracle,
					_info._quoteCurrency,
					quoteDec
				)
			);

		address[] memory _assets = new address[](10);
		uint256[] memory _assetWeights = new uint256[](2);

		// Base Currency
		_assets[0] = _info._baseCurrency;
		_assets[1] = address(_baseAssim);
		_assets[2] = _info._baseCurrency;
		_assets[3] = address(_baseAssim);
		_assets[4] = _info._baseCurrency;

		// Quote Currency (typically USDC)
		_assets[5] = _info._quoteCurrency;
		_assets[6] = address(_quoteAssim);
		_assets[7] = _info._quoteCurrency;
		_assets[8] = address(_quoteAssim);
		_assets[9] = _info._quoteCurrency;

		// Weights
		_assetWeights[0] = _info._baseWeight;
		_assetWeights[1] = _info._quoteWeight;

		// New curve
		Curve curve = new Curve(
			_info._name,
			_info._symbol,
			_assets,
			_assetWeights,
			address(this)
		);
		curve.setParams(
			_info._alpha,
			_info._beta,
			_info._feeAtHalt,
			_info._epsilon,
			_info._lambda
		);
		curve.transferOwnership(getProtocolTreasury());
		curves[curveId] = address(curve);

		emit NewCurve(msg.sender, curveId, address(curve));

		return curve;
	}

	function quoteAddress() internal view returns (address) {
		if (USDC == address(0)) {
			uint256 chainID;
			assembly {
				chainID := chainid()
			}
			if (chainID == 1) {
				return 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
			} else if (chainID == 137 ) {
				return 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359;
			} else if (chainID == 42161) {
				return 0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8;
			} else if (chainID == 80001 ) {
				return 0x77730cF052837ebc2f8f1398CAD38D946e58d432;
			} else {
				return address(0);
			}
		} else {
			return USDC;
		}
	}
}
