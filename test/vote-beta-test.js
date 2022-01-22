const { assert, expect } = require('chai');
const { ethers, waffle } = require("hardhat");

describe('VoteTokenBeta test', async function () {
    beforeEach(async () => {
        [
            alice,
            bob,
            charlie,
            owner,
        ] = await ethers.getSigners();

        VoteTokenBetaDev = await ethers.getContractFactory("VoteTokenBetaDev");
        voteTokenInstance = await VoteTokenBetaDev.connect(owner).deploy();
        await voteTokenInstance.deployed();

    });

    it('sender', async () => {
        let lastSnapshotId = await voteTokenInstance.lastSnapshotId();
        assert(lastSnapshotId == 0, 'wrong snapshot 1');
        await voteTokenInstance.mint(owner.address, 1000000);
        await voteTokenInstance.transfer(alice.address, 100000);
        let balance = await voteTokenInstance.balanceOf(owner.address);
        assert(balance == 1000000-100000, 'wrong balance 1');
        let recordedSnapshotId = await voteTokenInstance.recordedSnapshotId(owner.address);
        assert(recordedSnapshotId == 1, 'wrong recordedSnapshotId 1');

        await voteTokenInstance.snapshot();
        lastSnapshotId = await voteTokenInstance.lastSnapshotId();
        assert(lastSnapshotId == 1, 'wrong snapshot 2');
        balance = await voteTokenInstance.balanceOf(owner.address);
        assert(balance == 1000000-100000, 'wrong balance 2');
        recordedSnapshotId = await voteTokenInstance.recordedSnapshotId(owner.address);
        assert(recordedSnapshotId == 1, 'wrong recordedSnapshotId 2');
        await voteTokenInstance.transfer(alice.address, 100000);
        balance = await voteTokenInstance.balanceOf(owner.address);
        assert(balance == 1000000-200000, 'wrong balance 3');
        balance = await voteTokenInstance.balanceOfAt(owner.address+'000000000001000000000002');
        assert(balance == 1000000-100000, 'wrong balance 4');
        recordedSnapshotId = await voteTokenInstance.recordedSnapshotId(owner.address);
        assert(recordedSnapshotId == 2, 'wrong recordedSnapshotId 3');

        await voteTokenInstance.snapshot();
        await voteTokenInstance.snapshot();
        lastSnapshotId = await voteTokenInstance.lastSnapshotId();
        assert(lastSnapshotId == 3, 'wrong snapshot 3');
        balance = await voteTokenInstance.balanceOf(owner.address);
        assert(balance == 1000000-200000, 'wrong balance 5');
        recordedSnapshotId = await voteTokenInstance.recordedSnapshotId(owner.address);
        assert(recordedSnapshotId == 2, 'wrong recordedSnapshotId 4');
        await voteTokenInstance.transfer(alice.address, 100000);
        balance = await voteTokenInstance.balanceOf(owner.address);
        assert(balance == 1000000-300000, 'wrong balance 6');
        balance = await voteTokenInstance.balanceOfAt(owner.address+'000000000002000000000004');
        assert(balance == 1000000-200000, 'wrong balance 7');
        recordedSnapshotId = await voteTokenInstance.recordedSnapshotId(owner.address);
        assert(recordedSnapshotId == 4, 'wrong recordedSnapshotId 5');
    });

    it('receiver', async () => {
        let lastSnapshotId = await voteTokenInstance.lastSnapshotId();
        assert(lastSnapshotId == 0, 'wrong snapshot 1');
        await voteTokenInstance.mint(owner.address, 1000000);
        await voteTokenInstance.transfer(alice.address, 100000);
        let balance = await voteTokenInstance.balanceOf(alice.address);
        assert(balance == 100000, 'wrong balance 1');
        let recordedSnapshotId = await voteTokenInstance.recordedSnapshotId(alice.address);
        assert(recordedSnapshotId == 1, 'wrong recordedSnapshotId 1');

        await voteTokenInstance.snapshot();
        lastSnapshotId = await voteTokenInstance.lastSnapshotId();
        assert(lastSnapshotId == 1, 'wrong snapshot 2');
        balance = await voteTokenInstance.balanceOf(alice.address);
        assert(balance == 100000, 'wrong balance 2');
        recordedSnapshotId = await voteTokenInstance.recordedSnapshotId(alice.address);
        assert(recordedSnapshotId == 1, 'wrong recordedSnapshotId 2');
        await voteTokenInstance.transfer(alice.address, 100000);
        balance = await voteTokenInstance.balanceOf(alice.address);
        assert(balance == 200000, 'wrong balance 3');
        balance = await voteTokenInstance.balanceOfAt(alice.address+'000000000001000000000002');
        assert(balance == 100000, 'wrong balance 4');
        recordedSnapshotId = await voteTokenInstance.recordedSnapshotId(alice.address);
        assert(recordedSnapshotId == 2, 'wrong recordedSnapshotId 3');

        await voteTokenInstance.snapshot();
        await voteTokenInstance.snapshot();
        lastSnapshotId = await voteTokenInstance.lastSnapshotId();
        assert(lastSnapshotId == 3, 'wrong snapshot 3');
        balance = await voteTokenInstance.balanceOf(alice.address);
        assert(balance == 200000, 'wrong balance 5');
        recordedSnapshotId = await voteTokenInstance.recordedSnapshotId(alice.address);
        assert(recordedSnapshotId == 2, 'wrong recordedSnapshotId 4');
        await voteTokenInstance.transfer(alice.address, 100000);
        balance = await voteTokenInstance.balanceOf(alice.address);
        assert(balance == 300000, 'wrong balance 6');
        balance = await voteTokenInstance.balanceOfAt(alice.address+'000000000002000000000004');
        assert(balance == 200000, 'wrong balance 7');
        recordedSnapshotId = await voteTokenInstance.recordedSnapshotId(alice.address);
        assert(recordedSnapshotId == 4, 'wrong recordedSnapshotId 5');
    });

    it('transfer and reclaim gas', async () => {
        await voteTokenInstance.mint(owner.address, 1000000);
        await voteTokenInstance.snapshot();  // snapshot 1
        await voteTokenInstance.transfer(alice.address, 100000);

        let snapshotKey = owner.address+'000000000001000000000002';
        await voteTokenInstance.transferAndReclaimGas(alice.address, 100000, snapshotKey);
        let balance = await voteTokenInstance.balanceOfAt(owner.address+'000000000001000000000002');
        assert(balance == 0, 'wrong snapshot balance');

    });

    it('burn', async () => {
        await voteTokenInstance.mint(owner.address, 1000000);
        await voteTokenInstance.transfer(alice.address, 100000);
        await voteTokenInstance.burn(alice.address, 10000)
        await voteTokenInstance.snapshot();  // snapshot 1
        await voteTokenInstance.transfer(alice.address, 100000);

        let snapshotKey = owner.address+'000000000001000000000002';
        let balance = await voteTokenInstance.balanceOfAt(alice.address+'000000000001000000000002');
        assert(balance == 100000-10000, 'wrong snapshot balance');

    });

});
