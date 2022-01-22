// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

interface PushValueReceiver {
    function onPushValueReceived(uint256 snapshotId, address sender, uint256 balance, bytes calldata data) payable external;
}
