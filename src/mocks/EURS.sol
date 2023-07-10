// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract EURS is ERC20 {
	constructor() ERC20("EURS", "EURS") {
		_mint(msg.sender, 1000000000 ether);
	}

	function mint(address to, uint256 amount) external {
		_mint(to, amount);
	}

		function decimals() public view virtual override returns (uint8) {
        return 2;
    }
}
