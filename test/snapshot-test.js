const { assert, expect } = require('chai');
const { ethers, waffle } = require("hardhat");

describe('SnapshotToken test', async function () {
    beforeEach(async () => {
        [
            alice,
            bob,
            charlie,
            owner,
        ] = await ethers.getSigners();

        SnapshotTokenDev = await ethers.getContractFactory("SnapshotTokenDev");
        snapshotTokenInstance = await SnapshotTokenDev.connect(owner).deploy();
        await snapshotTokenInstance.deployed();

    });

    it('sender', async () => {
        let lastSnapshotId = await snapshotTokenInstance.lastSnapshotId();
        assert(lastSnapshotId == 0, 'wrong snapshot 1');
        await snapshotTokenInstance.mint(owner.address, 1000000);
        await snapshotTokenInstance.transfer(alice.address, 100000);
        let balance = await snapshotTokenInstance.balanceOf(owner.address);
        assert(balance == 1000000-100000, 'wrong balance 1');
        let recordedSnapshotId = await snapshotTokenInstance.recordedSnapshotId(owner.address);
        assert(recordedSnapshotId == 1, 'wrong recordedSnapshotId 1');

        await snapshotTokenInstance.snapshot();
        lastSnapshotId = await snapshotTokenInstance.lastSnapshotId();
        assert(lastSnapshotId == 1, 'wrong snapshot 2');
        balance = await snapshotTokenInstance.balanceOf(owner.address);
        assert(balance == 1000000-100000, 'wrong balance 2');
        recordedSnapshotId = await snapshotTokenInstance.recordedSnapshotId(owner.address);
        assert(recordedSnapshotId == 1, 'wrong recordedSnapshotId 2');
        await snapshotTokenInstance.transfer(alice.address, 100000);
        balance = await snapshotTokenInstance.balanceOf(owner.address);
        assert(balance == 1000000-200000, 'wrong balance 3');
        balance = await snapshotTokenInstance.balanceOfAt(owner.address+'000000000001000000000002');
        assert(balance == 1000000-100000, 'wrong balance 4');
        recordedSnapshotId = await snapshotTokenInstance.recordedSnapshotId(owner.address);
        assert(recordedSnapshotId == 2, 'wrong recordedSnapshotId 3');

        await snapshotTokenInstance.snapshot();
        await snapshotTokenInstance.snapshot();
        lastSnapshotId = await snapshotTokenInstance.lastSnapshotId();
        assert(lastSnapshotId == 3, 'wrong snapshot 3');
        balance = await snapshotTokenInstance.balanceOf(owner.address);
        assert(balance == 1000000-200000, 'wrong balance 5');
        recordedSnapshotId = await snapshotTokenInstance.recordedSnapshotId(owner.address);
        assert(recordedSnapshotId == 2, 'wrong recordedSnapshotId 4');
        await snapshotTokenInstance.transfer(alice.address, 100000);
        balance = await snapshotTokenInstance.balanceOf(owner.address);
        assert(balance == 1000000-300000, 'wrong balance 6');
        balance = await snapshotTokenInstance.balanceOfAt(owner.address+'000000000002000000000004');
        assert(balance == 1000000-200000, 'wrong balance 7');
        recordedSnapshotId = await snapshotTokenInstance.recordedSnapshotId(owner.address);
        assert(recordedSnapshotId == 4, 'wrong recordedSnapshotId 5');
    });

    it('receiver', async () => {
        let lastSnapshotId = await snapshotTokenInstance.lastSnapshotId();
        assert(lastSnapshotId == 0, 'wrong snapshot 1');
        await snapshotTokenInstance.mint(owner.address, 1000000);
        await snapshotTokenInstance.transfer(alice.address, 100000);
        let balance = await snapshotTokenInstance.balanceOf(alice.address);
        assert(balance == 100000, 'wrong balance 1');
        let recordedSnapshotId = await snapshotTokenInstance.recordedSnapshotId(alice.address);
        assert(recordedSnapshotId == 1, 'wrong recordedSnapshotId 1');

        await snapshotTokenInstance.snapshot();
        lastSnapshotId = await snapshotTokenInstance.lastSnapshotId();
        assert(lastSnapshotId == 1, 'wrong snapshot 2');
        balance = await snapshotTokenInstance.balanceOf(alice.address);
        assert(balance == 100000, 'wrong balance 2');
        recordedSnapshotId = await snapshotTokenInstance.recordedSnapshotId(alice.address);
        assert(recordedSnapshotId == 1, 'wrong recordedSnapshotId 2');
        await snapshotTokenInstance.transfer(alice.address, 100000);
        balance = await snapshotTokenInstance.balanceOf(alice.address);
        assert(balance == 200000, 'wrong balance 3');
        balance = await snapshotTokenInstance.balanceOfAt(alice.address+'000000000001000000000002');
        assert(balance == 100000, 'wrong balance 4');
        recordedSnapshotId = await snapshotTokenInstance.recordedSnapshotId(alice.address);
        assert(recordedSnapshotId == 2, 'wrong recordedSnapshotId 3');

        await snapshotTokenInstance.snapshot();
        await snapshotTokenInstance.snapshot();
        lastSnapshotId = await snapshotTokenInstance.lastSnapshotId();
        assert(lastSnapshotId == 3, 'wrong snapshot 3');
        balance = await snapshotTokenInstance.balanceOf(alice.address);
        assert(balance == 200000, 'wrong balance 5');
        recordedSnapshotId = await snapshotTokenInstance.recordedSnapshotId(alice.address);
        assert(recordedSnapshotId == 2, 'wrong recordedSnapshotId 4');
        await snapshotTokenInstance.transfer(alice.address, 100000);
        balance = await snapshotTokenInstance.balanceOf(alice.address);
        assert(balance == 300000, 'wrong balance 6');
        balance = await snapshotTokenInstance.balanceOfAt(alice.address+'000000000002000000000004');
        assert(balance == 200000, 'wrong balance 7');
        recordedSnapshotId = await snapshotTokenInstance.recordedSnapshotId(alice.address);
        assert(recordedSnapshotId == 4, 'wrong recordedSnapshotId 5');
    });

    it('transfer and reclaim gas', async () => {
        await snapshotTokenInstance.mint(owner.address, 1000000);
        await snapshotTokenInstance.snapshot();  // snapshot 1
        await snapshotTokenInstance.transfer(alice.address, 100000);

        let snapshotKey = owner.address+'000000000001000000000002';
        await snapshotTokenInstance.transferAndReclaimGas(alice.address, 100000, snapshotKey);
        let balance = await snapshotTokenInstance.balanceOfAt(owner.address+'000000000001000000000002');
        assert(balance == 0, 'wrong snapshot balance');

    });

    it('burn', async () => {
        await snapshotTokenInstance.mint(owner.address, 1000000);
        await snapshotTokenInstance.transfer(alice.address, 100000);
        await snapshotTokenInstance.burn(alice.address, 10000)
        await snapshotTokenInstance.snapshot();  // snapshot 1
        await snapshotTokenInstance.transfer(alice.address, 100000);

        let snapshotKey = owner.address+'000000000001000000000002';
        let balance = await snapshotTokenInstance.balanceOfAt(alice.address+'000000000001000000000002');
        assert(balance == 100000-10000, 'wrong snapshot balance');

    });

});
