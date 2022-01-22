// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

import "../Pushing.sol";
import "../SnapshotToken.sol";
import "../receiver/PushReceiver.sol";
import "../receiver/PushValueReceiver.sol";

contract PushingSnapshotTokenDev is SnapshotToken, Pushing {
    function mint(address account, uint256 amount) external {
        super._mint(account, amount);
    }

    function burn(address account, uint256 amount) external {
        super._burn(account, amount);
    }

    function snapshot() external returns (uint256) {
        return _snapshot();
    }

    function pushSnapshot(uint256 snapshotId, uint256 snapshotKey, address target, bytes calldata data) external
    {
        PushReceiver(target).onPushReceived(snapshotId, msg.sender, _balanceOfAtSnapshot(msg.sender, snapshotId, snapshotKey), data);
    }

    function pushSnapshot(uint256 snapshotId, address target, bytes calldata data) external
    {
        PushReceiver(target).onPushReceived(snapshotId, msg.sender, _balanceOfAtSnapshot(msg.sender, snapshotId), data);
    }

    function pushSnapshotWithValue(uint256 snapshotId, uint256 snapshotKey, address target, bytes calldata data) external payable
    {
        PushValueReceiver(target).onPushValueReceived{value: msg.value}(snapshotId, msg.sender, _balanceOfAtSnapshot(msg.sender, snapshotId, snapshotKey), data);
    }

    function pushSnapshotWithValue(uint256 snapshotId, address target, bytes calldata data) external payable
    {
        PushValueReceiver(target).onPushValueReceived{value: msg.value}(snapshotId, msg.sender, _balanceOfAtSnapshot(msg.sender, snapshotId), data);
    }

    function pushSnapshotAndReclaimGas(uint256 snapshotId, uint256 snapshotKey, address target, uint256 snapshotIdForGasReclaim, bytes calldata data) external
    {
        _reclaimGas(snapshotIdForGasReclaim);
        PushReceiver(target).onPushReceived(snapshotId, msg.sender, _balanceOfAtSnapshot(msg.sender, snapshotId, snapshotKey), data);
    }

    function pushSnapshotAndReclaimGas(uint256 snapshotId, address target, uint256 snapshotIdForGasReclaim, bytes calldata data) external
    {
        _reclaimGas(snapshotIdForGasReclaim);
        PushReceiver(target).onPushReceived(snapshotId, msg.sender, _balanceOfAtSnapshot(msg.sender, snapshotId), data);
    }

    function pushSnapshotWithValueAndReclaimGas(uint256 snapshotId, uint256 snapshotKey, address target, uint256 snapshotIdForGasReclaim, bytes calldata data) external payable
    {
        _reclaimGas(snapshotIdForGasReclaim);
        PushValueReceiver(target).onPushValueReceived{value: msg.value}(snapshotId, msg.sender, _balanceOfAtSnapshot(msg.sender, snapshotId, snapshotKey), data);
    }

    function pushSnapshotWithValueAndReclaimGas(uint256 snapshotId, address target, uint256 snapshotIdForGasReclaim, bytes calldata data) external payable
    {
        _reclaimGas(snapshotIdForGasReclaim);
        PushValueReceiver(target).onPushValueReceived{value: msg.value}(snapshotId, msg.sender, _balanceOfAtSnapshot(msg.sender, snapshotId), data);
    }

}