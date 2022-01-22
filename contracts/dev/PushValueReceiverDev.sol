// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

import "../receiver/PushValueReceiver.sol";

contract PushValueReceiverDev is PushValueReceiver {
    event PushValueReceived(uint256 indexed snapshotId, address indexed sender, uint256 balance, uint256 value, bytes data);

    function onPushValueReceived(uint256 snapshotId, address sender, uint256 balance, bytes calldata data) external payable override {
        emit PushValueReceived(snapshotId, sender, balance, msg.value, data);
    }
}
