// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

//import "./receiver/PushReceiver.sol";
//import "./receiver/PushValueReceiver.sol";

/**
 * @notice This interface provides push snapshot or push vote functionality.
 * These function informs other contracts, like governance contracts,
 * what was the balance of sender at a given snapshot.
 * Standard implementations are included in comments.
 * Push vote, in opposition to pull vote, means that a voter/sender calls Token contract with Push functionality
 * and the vote is pushed to a governance contract.
 * This can make governance contracts less complex when using SnapshotToken, VoteTokenAlpha, VoteTokenBeta.
 */
interface Pushing {

    function pushSnapshot(uint256 snapshotId, uint256 snapshotKey, address target, bytes calldata data) external;
//    {
//        PushReceiver(target).onPushReceived(snapshotId, msg.sender, _balanceOfAtSnapshot(msg.sender, snapshotId, snapshotKey), data);
//    }

    function pushSnapshot(uint256 snapshotId, address target, bytes calldata data) external;
//    {
//        PushReceiver(target).onPushReceived(snapshotId, msg.sender, _balanceOfAtSnapshot(msg.sender, snapshotId), data);
//    }

    function pushSnapshotWithValue(uint256 snapshotId, uint256 snapshotKey, address target, bytes calldata data) external payable;
//    {
//        PushValueReceiver(target).onPushValueReceived{value: msg.value}(snapshotId, msg.sender, _balanceOfAtSnapshot(msg.sender, snapshotId, snapshotKey), data);
//    }

    function pushSnapshotWithValue(uint256 snapshotId, address target, bytes calldata data) external payable;
//    {
//        PushValueReceiver(target).onPushValueReceived{value: msg.value}(snapshotId, msg.sender, _balanceOfAtSnapshot(msg.sender, snapshotId), data);
//    }

    function pushSnapshotAndReclaimGas(uint256 snapshotId, uint256 snapshotKey, address target, uint256 snapshotIdForGasReclaim, bytes calldata data) external;
//    {
//        _reclaimGas(snapshotIdForGasReclaim);
//        PushReceiver(target).onPushReceived(snapshotId, msg.sender, _balanceOfAtSnapshot(msg.sender, snapshotId, snapshotKey), data);
//    }

    function pushSnapshotAndReclaimGas(uint256 snapshotId, address target, uint256 snapshotIdForGasReclaim, bytes calldata data) external;
//    {
//        _reclaimGas(snapshotIdForGasReclaim);
//        PushReceiver(target).onPushReceived(snapshotId, msg.sender, _balanceOfAtSnapshot(msg.sender, snapshotId), data);
//    }

    function pushSnapshotWithValueAndReclaimGas(uint256 snapshotId, uint256 snapshotKey, address target, uint256 snapshotIdForGasReclaim, bytes calldata data) external payable;
//    {
//        _reclaimGas(snapshotIdForGasReclaim);
//        PushValueReceiver(target).onPushValueReceived{value: msg.value}(snapshotId, msg.sender, _balanceOfAtSnapshot(msg.sender, snapshotId, snapshotKey), data);
//    }

    function pushSnapshotWithValueAndReclaimGas(uint256 snapshotId, address target, uint256 snapshotIdForGasReclaim, bytes calldata data) external payable;
//    {
//        _reclaimGas(snapshotIdForGasReclaim);
//        PushValueReceiver(target).onPushValueReceived{value: msg.value}(snapshotId, msg.sender, _balanceOfAtSnapshot(msg.sender, snapshotId), data);
//    }

}