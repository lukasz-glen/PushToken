// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20VotesDev is ERC20Votes {

    constructor(string memory name_) ERC20Permit(name_) ERC20(name_, "1") {}

    function mint(address account, uint256 amount) external {
        super._mint(account, amount);
    }

}
