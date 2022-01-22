// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

import "../VoteTokenAlpha.sol";

contract VoteTokenAlphaDev is VoteTokenAlpha {
    function mint(address account, uint256 amount) external {
        super._mint(account, amount);
    }

    function burn(address account, uint256 amount) external {
        super._burn(account, amount);
    }

    function snapshot() external returns (uint256) {
        return _snapshot();
    }
}