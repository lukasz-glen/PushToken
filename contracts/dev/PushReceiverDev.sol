// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

import "../receiver/PushReceiver.sol";

contract PushReceiverDev is PushReceiver {
    event PushReceived(uint256 indexed snapshotId, address indexed sender, uint256 balance, bytes data);

    function onPushReceived(uint256 snapshotId, address sender, uint256 balance, bytes calldata data) external override {
        emit PushReceived(snapshotId, sender, balance, data);
    }
}
