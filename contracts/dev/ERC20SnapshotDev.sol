// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20SnapshotDev is ERC20Snapshot {

    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) {}

    function mint(address account, uint256 amount) external {
        super._mint(account, amount);
    }

    function snapshot() external returns (uint256) {
        return _snapshot();
    }

}
