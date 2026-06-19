// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CADC is ERC20 {
	constructor() ERC20("CADC", "CADC") {
		_mint(msg.sender, 10000000 ether);
	}

	function mint(address to, uint256 amount) external {
		_mint(to, amount);
	}

	function decimals() public view virtual override returns (uint8) {
		return 18;
	}
}
