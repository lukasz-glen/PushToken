// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

contract Touch {
    event TouchEvent();

    function touch() external {
        emit TouchEvent();
    }

}
