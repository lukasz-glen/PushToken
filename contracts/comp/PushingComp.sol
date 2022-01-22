pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;

import "./Comp.sol";

contract PushingComp is Comp {

    constructor(address account) Comp(account) public { }

    function pushVotes(uint256 blockNumber, uint32 checkpointId, address target, bytes calldata data) external {
        PushReceiver(target).onPushReceived(blockNumber, msg.sender, _votesAt(msg.sender, blockNumber, checkpointId), data);
    }

    function pushVotesWithValue(uint256 blockNumber, uint32 checkpointId, address target, bytes calldata data) external payable {
        PushValueReceiver(target).onPushValueReceived.value(msg.value)(blockNumber, msg.sender, _votesAt(msg.sender, blockNumber, checkpointId), data);
    }

    function votesAt(address account, uint256 blockNumber, uint32 checkpointId) view external returns(uint96) {
        return _votesAt(account, blockNumber, checkpointId);
    }

    function _votesAt(address account, uint256 blockNumber, uint32 checkpointId) view internal returns(uint96) {
        uint32 nCheckpoints = numCheckpoints[account];
        require(checkpointId < nCheckpoints, "PushingComp: checkpointId out of range");
        require(checkpoints[account][checkpointId].fromBlock <= blockNumber, "PushingComp: invalid block number");
        if (nCheckpoints-1 == checkpointId) {
            require(blockNumber < block.number, "PushingComp: the block number should be in the past");
        } else {
            require(blockNumber < checkpoints[account][checkpointId+1].fromBlock, "PushingComp: invalid checkpoint id");
        }
        return checkpoints[account][checkpointId].votes;
    }

}

interface PushReceiver {
    function onPushReceived(uint256 snapshotId, address sender, uint256 balance, bytes calldata data) external;
}

interface PushValueReceiver {
    function onPushValueReceived(uint256 snapshotId, address sender, uint256 balance, bytes calldata data) payable external;
}
