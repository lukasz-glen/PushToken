// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

import "./BaseToken.sol";

/**
 * @notice This is ERC20 token with snapshots with intention to support voting.
 * A snapshot is all balances at a given point of time.
 * Typically, the contract should be inherited and snapshot(), mint() and/or burn() functions should be provided.
 * A snapshot is taken at the end of block when {_snaphost()} is called. This prevents voting with flash loans.
 * So there can be at most one snapshot at a block.
 * Delegation is not supported so far.
 * Access to a balance at a snapshot requires to know a snapshot key.
 * See {_snapshots} for structure and {balanceOfAtSnapshot(address,uint256,uint256)}
 * and {balanceOfAtSnapshot(address,uint256)} for usage.
 * Snapshot keys can be reconstructed by reading events, there is no direct way. But access is constant time and cheap.
 * If a token holder is absolutely sure that a snapshot key will not be further used,
 * it can delete it and reclaim gas.
 */
contract VoteTokenBeta is BaseToken {

    /**
     * capped by 2^208
     */
    // uint256 internal _totalSupply;

    /**
     * @dev last snapshot created
     * The snapshot 0 is considered as genesis snapshot and has no balances
     * This is composed of block number and actual id, id is incremental (last 48 bits)
     * Maximal value of id is 2**48-2.
     */
    uint256 internal _lastSnapshotId;

    /**
     * @dev
     * The structure holds past snapshots. The structure is tightly packed and optimized.
     * The keys are uint256 instead of address.
     * The keys for past snapshots are of the form [20 bytes address][6 bytes from snapshotId][6 bytes to snapshotId],
     * 'from snapshotId' is inclusive, 'to snapshotId' is exclusive.
     * The values for past snapshot are of the form [6 bytes of zeros][26 bytes balance].
     */
    mapping(uint256 => uint256) internal _snapshots;

    /**
     * @dev
     * The structure holds current balances. The structure is tightly packed and optimized.
     * The values for current balances are of the form [6 bytes snapshotId][26 bytes balance],
     * 'snapshotId' is the snapshotId+1 of the last balance modification.
     * +1 is for technical reason - like next future snapshot.
     */
    mapping(address => uint256) internal _balances;

    /**
     * @dev Emitted by {_snapshot} when a snapshot identified by `id` is created.
     */
    event Snapshot(uint256 id);

    /**
     * @notice the sender's balance at a snapshot within the snapshot key
     * @dev the value must be in {_snapshots}, there must be an in or out transfer after the requested snapshot
     * @return a past balance at a given snapshot key
     */
    function balanceOfAt(uint256 snapshotKey) external view returns (uint256) {
        return _snapshots[snapshotKey];
    }

    /**
     * @notice the account's balance at a snapshot within the snapshot key,
     * if there was a transfer after the snapshot
     * @dev The value must be in {_snapshots}, there must be an in or out transfer after the requested snapshot.
     * It is verified that snapshot id is within the snapshot key.
     * @return a past balance at a given snapshot
     */
    function balanceOfAtSnapshot(address account, uint256 snapshotId, uint256 snapshotKey) external view returns (uint256) {
        return _balanceOfAtSnapshot(account, snapshotId, snapshotKey);
    }

    /**
     * @notice the account's balance at a snapshot,
     * if there was not a transfer after the snapshot
     * @dev The value must be in {_balances}, there can't be an in or out transfer after the requested snapshot.
     * It is verified that snapshot id is valid.
     * @return a past balance at a given snapshot
     */
    function balanceOfAtSnapshot(address account, uint256 snapshotId) external view returns (uint256) {
        return _balanceOfAtSnapshot(account, snapshotId);
    }

    /**
     * @notice Transfer the amount and deletes the snapshot key entry in order to reclaim some gas.
     * Make sure that you will not need the snapshot key in the future, the operation is irreversible.
     * @dev See also {IERC20-transfer}.
     */
    function transferAndReclaimGas(address recipient, uint256 amount, uint256 snapshotKey) external virtual returns (bool) {
        _reclaimGas(snapshotKey);
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    /**
     * @notice Creates a new snapshot and returns its snapshot id.
     * @dev {_lastSnapshotId} holds both id and a block number, both are updated.
     *
     * Emits a {Snapshot} event that contains the same id.
     *
     * An attack with a large number of snapshots is not harmful.
     */
    function _snapshot() internal virtual returns (uint256) {
        uint256 lastSnapshotId_ = _lastSnapshotId;
        uint256 blockNumber = lastSnapshotId_ >> 48;
        if (blockNumber == block.number) {
            return lastSnapshotId_;
        }
        uint256 id = lastSnapshotId_ & 0x0000000000000000000000000000000000000000000000000000FFFFFFFFFFFF;
        lastSnapshotId_ = (block.number << 48) + id + 1;
        _lastSnapshotId = lastSnapshotId_;
        return lastSnapshotId_;
    }

    function getLastSnapshotId() internal view returns (uint256) {
        return _lastSnapshotId;
    }

    /**
     * @notice the last snapshot id globally
     * @dev this is not exactly {_lastSnapshotId}, just id is extracted
     */
    function lastSnapshotId() external view returns (uint256) {
        return _lastSnapshotId & 0x0000000000000000000000000000000000000000000000000000FFFFFFFFFFFF;
    }

    /**
     * @notice the block of last snapshot id
     * @dev the block number is extracted from {_lastSnapshotId}
     */
    function lastSnapshotBlock() external view returns (uint256) {
        return _lastSnapshotId  >> 48;
    }

    /**
     * @notice This is a technical function.
     * The recorded snapshot id is lastSnapshotId + 1
     * at the moment of last incoming/outgoing transfer to/from the account
     */
    function recordedSnapshotId(address account) external view returns (uint256) {
        uint256 snapshot =  _balances[account];
        return snapshot >> 208;
    }

    function _balanceOfAtSnapshot(address account, uint256 snapshotId, uint256 snapshotKey) internal view returns (uint256 balance) {
        require(
            uint256(bytes32(bytes20(account))) == (snapshotKey & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF000000000000000000000000),
            "PushToken: snapshot does not belong to caller"
        );
        require(
            snapshotId >= ((snapshotKey & 0x0000000000000000000000000000000000000000FFFFFFFFFFFF000000000000) >> 48),
            "PushToken: snapshot incompatible with snapshot key, >="
        );
        require(
            snapshotId < (snapshotKey & 0x0000000000000000000000000000000000000000000000000000FFFFFFFFFFFF),
            "PushToken: snapshot incompatible with snapshot key, <"
        );
        balance = _snapshots[snapshotKey];
    }

    function _balanceOfAtSnapshot(address account, uint256 snapshotId) internal view returns (uint256 balance) {
        uint256 snapshot =  _balances[account];
        uint256 accountSnapshotId = snapshot >> 208;
        require(
            snapshotId >= accountSnapshotId,
            "PushToken: snapshotId is outdated"
        );
        // maybe it is unnecessary, target should recognize snapshotId
        require(snapshotId < block.number, "PushToken: snapshot id in the future");
        balance = snapshot & 0x000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
    }

    function _reclaimGas(uint256 snapshotKey) internal {
        require(
            uint256(bytes32(bytes20(msg.sender))) == (snapshotKey & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF000000000000000000000000),
            "PushToken: snapshot does not belong to caller"
        );
        require(
            uint256(bytes32(bytes20(msg.sender))) != snapshotKey,
            "PushToken: cannot delete current balance"
        );
        delete _snapshots[snapshotKey];
    }


    /////////////////////////// ERC20 //////////////////////////

    /**
     * @dev See {IERC20-balanceOf}.
     */
    function balanceOf(address account) public view virtual override returns (uint256) {
        uint256 snapshot =  _balances[account];
        return snapshot & 0x000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
    }

    /**
     * @dev See {ERC20-_transfer}
     * Creating snapshots is added.
     */
    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal virtual override {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");

        _beforeTokenTransfer(sender, recipient, amount);

        uint256 senderSnapshot =  _balances[sender];
        uint256 senderBalance = senderSnapshot & 0x000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
        uint256 senderSnapshotId = senderSnapshot >> 208;
        uint256 recipientSnapshot =  _balances[recipient];
        uint256 recipientBalance = recipientSnapshot & 0x000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
        uint256 recipientSnapshotId = recipientSnapshot >> 208;
        uint256 nextSnapshotId;  // stack too deep prevention
        {
            uint256 lastSnapshotId_ = getLastSnapshotId();
            uint256 blockNumber = lastSnapshotId_ >> 48;
            uint256 id = lastSnapshotId_ & 0x0000000000000000000000000000000000000000000000000000FFFFFFFFFFFF;
            nextSnapshotId = blockNumber == block.number ? id : id+1;  // assumption: blockNumber <= block.number
        }
        require(senderBalance >= amount, "ERC20: transfer amount exceeds balance");
        unchecked {
            if (nextSnapshotId > senderSnapshotId && senderBalance > 0) {
                _snapshots[uint256(bytes32(bytes20(sender))) + (senderSnapshotId << 48) + nextSnapshotId] = senderBalance;
            }
            if (senderBalance == amount) {
                delete _balances[sender];
            } else {
                _balances[sender] = (nextSnapshotId << 208) + senderBalance - amount;
            }
            if (nextSnapshotId > recipientSnapshotId && recipientBalance > 0) {
                _snapshots[uint256(bytes32(bytes20(recipient))) + (recipientSnapshotId << 48) + nextSnapshotId] = recipientBalance;
            }
            if (recipientBalance > 0 || amount > 0) {
                _balances[recipient] = (nextSnapshotId << 208) + recipientBalance + amount;
            }
        }

        emit Transfer(sender, recipient, amount);

        _afterTokenTransfer(sender, recipient, amount);
    }

    /**
     * @dev See {ERC20-_mint}
     * Creating snapshots is added.
     */
    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");

        _beforeTokenTransfer(address(0), account, amount);

        uint256 totalSupply_ = _totalSupply + amount;
        require(totalSupply_ < 2**208, "PushToken: maximal total supply exceeded");
        _totalSupply = totalSupply_;

        uint256 recipientSnapshot =  _balances[account];
        uint256 recipientBalance = recipientSnapshot & 0x000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
        uint256 recipientSnapshotId = recipientSnapshot >> 208;
        uint256 lastSnapshotId_ = getLastSnapshotId();
        uint256 blockNumber = lastSnapshotId_ >> 48;
        uint256 id = lastSnapshotId_ & 0x0000000000000000000000000000000000000000000000000000FFFFFFFFFFFF;
        uint256 nextSnapshotId = blockNumber == block.number ? id : id+1;
        unchecked {
            if (nextSnapshotId > recipientSnapshotId && recipientBalance > 0) {
                _snapshots[uint256(bytes32(bytes20(account))) + (recipientSnapshotId << 48) + nextSnapshotId];
            }
            if (recipientBalance > 0 || amount > 0) {
                _balances[account] = (nextSnapshotId << 208) + recipientBalance + amount;
            }
        }

        emit Transfer(address(0), account, amount);

        _afterTokenTransfer(address(0), account, amount);
    }

    /**
     * @dev See {ERC20-_burn}
     * Creating snapshots is added.
     */
    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: burn from the zero address");

        _beforeTokenTransfer(account, address(0), amount);

        uint256 senderSnapshot =  _balances[account];
        uint256 senderBalance = senderSnapshot & 0x000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
        uint256 senderSnapshotId = senderSnapshot >> 208;
        uint256 lastSnapshotId_ = getLastSnapshotId();
        uint256 blockNumber = lastSnapshotId_ >> 48;
        uint256 id = lastSnapshotId_ & 0x0000000000000000000000000000000000000000000000000000FFFFFFFFFFFF;
        uint256 nextSnapshotId = blockNumber == block.number ? id : id+1;
        require(senderBalance >= amount, "ERC20: transfer amount exceeds balance");
        unchecked {
            if (nextSnapshotId > senderSnapshotId && senderBalance > 0) {
                _snapshots[uint256(bytes32(bytes20(account))) + (senderSnapshotId << 48) + nextSnapshotId] = senderBalance;
            }
            if (senderBalance == amount) {
                delete _balances[account];
            } else {
                _balances[account] = (nextSnapshotId << 208) + senderBalance - amount;
            }
        }

        _totalSupply -= amount;

        emit Transfer(account, address(0), amount);

        _afterTokenTransfer(account, address(0), amount);
    }

}