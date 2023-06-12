// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RIDC is ERC20 {
	constructor() ERC20("RapidInnovation", "RIDC") {
		_mint(msg.sender, 1000 ether);
	}

	function mint(address to, uint256 amount) external {
		_mint(to, amount);
	}
}
