// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

interface PushReceiver {
    function onPushReceived(uint256 snapshotId, address sender, uint256 balance, bytes calldata data) external;
}
