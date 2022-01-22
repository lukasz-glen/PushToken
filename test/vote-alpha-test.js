const { assert, expect } = require('chai');
const { ethers, waffle } = require("hardhat");

describe('VoteTokenAlpha test', async function () {
    beforeEach(async () => {
        [
            alice,
            bob,
            charlie,
            owner,
        ] = await ethers.getSigners();

        VoteTokenAlphaDev = await ethers.getContractFactory("VoteTokenAlphaDev");
        voteTokenAlphaInstance = await VoteTokenAlphaDev.connect(owner).deploy();
        await voteTokenAlphaInstance.deployed();

        TouchFactory = await ethers.getContractFactory("Touch");
        touch = await TouchFactory.connect(owner).deploy();
        await touch.deployed();

    });

    it('sender', async () => {
        const provider = waffle.provider;

        let firstSnapshotId = await provider.getBlockNumber();
        await voteTokenAlphaInstance.mint(owner.address, 1000000);  // +1 block
        await voteTokenAlphaInstance.transfer(alice.address, 100000);   // +1 block
        let balance = await voteTokenAlphaInstance.balanceOf(owner.address);
        assert(balance == 1000000-100000, 'wrong balance 1');
        let recordedSnapshotId = await voteTokenAlphaInstance.recordedSnapshotId(owner.address);
        assert(recordedSnapshotId == firstSnapshotId + 2, 'wrong recordedSnapshotId 1');
        let lastSnapshotId = await voteTokenAlphaInstance.lastSnapshotId();
        assert(recordedSnapshotId == lastSnapshotId.toNumber() + 1, 'wrong recordedSnapshotId 1.1');

        // await voteTokenAlphaInstance.snapshot();  // not supported, touch instead to move block
        await touch.touch();  // +1 block
        lastSnapshotId = await voteTokenAlphaInstance.lastSnapshotId();
        assert(lastSnapshotId.toNumber() + 1 == firstSnapshotId + 3, 'wrong snapshot 2');
        balance = await voteTokenAlphaInstance.balanceOf(owner.address);
        assert(balance == 1000000-100000, 'wrong balance 2');
        recordedSnapshotId = await voteTokenAlphaInstance.recordedSnapshotId(owner.address);
        assert(recordedSnapshotId == firstSnapshotId + 2, 'wrong recordedSnapshotId 2');
        await voteTokenAlphaInstance.transfer(alice.address, 100000);  // +1 block
        balance = await voteTokenAlphaInstance.balanceOf(owner.address);
        assert(balance == 1000000-200000, 'wrong balance 3');
        let snapshotKey = (firstSnapshotId + 2).toString(16).padStart(12, "0") + (firstSnapshotId + 4).toString(16).padStart(12, "0");
        balance = await voteTokenAlphaInstance.balanceOfAt(owner.address + snapshotKey);
        assert(balance == 1000000-100000, 'wrong balance 4');
        recordedSnapshotId = await voteTokenAlphaInstance.recordedSnapshotId(owner.address);
        assert(recordedSnapshotId == firstSnapshotId + 4, 'wrong recordedSnapshotId 3');

        // await voteTokenAlphaInstance.snapshot();  // not supported, touch instead to move block
        // await voteTokenAlphaInstance.snapshot();  // not supported, touch instead to move block
        await touch.touch();  // +1 block
        await touch.touch();  // +1 block
        lastSnapshotId = await voteTokenAlphaInstance.lastSnapshotId();
        assert(lastSnapshotId.toNumber() + 1 == firstSnapshotId + 6, 'wrong snapshot 3');
        balance = await voteTokenAlphaInstance.balanceOf(owner.address);
        assert(balance == 1000000-200000, 'wrong balance 5');
        recordedSnapshotId = await voteTokenAlphaInstance.recordedSnapshotId(owner.address);
        assert(recordedSnapshotId == firstSnapshotId + 4, 'wrong recordedSnapshotId 4');
        await voteTokenAlphaInstance.transfer(alice.address, 100000);  // +1 block
        balance = await voteTokenAlphaInstance.balanceOf(owner.address);
        assert(balance == 1000000-300000, 'wrong balance 6');
        snapshotKey = (firstSnapshotId + 4).toString(16).padStart(12, "0") + (firstSnapshotId + 7).toString(16).padStart(12, "0");
        balance = await voteTokenAlphaInstance.balanceOfAt(owner.address + snapshotKey);
        assert(balance == 1000000-200000, 'wrong balance 7');
        recordedSnapshotId = await voteTokenAlphaInstance.recordedSnapshotId(owner.address);
        assert(recordedSnapshotId == firstSnapshotId + 7, 'wrong recordedSnapshotId 5');
    });

    it('receiver', async () => {
        const provider = waffle.provider;

        let firstSnapshotId = await provider.getBlockNumber();
        await voteTokenAlphaInstance.mint(owner.address, 1000000);  // +1 block
        await voteTokenAlphaInstance.transfer(alice.address, 100000);  // +1 block
        let balance = await voteTokenAlphaInstance.balanceOf(alice.address);
        assert(balance == 100000, 'wrong balance 1');
        let recordedSnapshotId = await voteTokenAlphaInstance.recordedSnapshotId(alice.address);
        assert(recordedSnapshotId == firstSnapshotId + 2, 'wrong recordedSnapshotId 1');
        let lastSnapshotId = await voteTokenAlphaInstance.lastSnapshotId();
        assert(recordedSnapshotId == lastSnapshotId.toNumber() + 1, 'wrong recordedSnapshotId 1.1');

        // await voteTokenAlphaInstance.snapshot();  // not supported, touch instead to move block
        await touch.touch();  // +1 block
        lastSnapshotId = await voteTokenAlphaInstance.lastSnapshotId();
        assert(lastSnapshotId.toNumber() + 1 == firstSnapshotId + 3, 'wrong snapshot 2');
        balance = await voteTokenAlphaInstance.balanceOf(alice.address);
        assert(balance == 100000, 'wrong balance 2');
        recordedSnapshotId = await voteTokenAlphaInstance.recordedSnapshotId(alice.address);
        assert(recordedSnapshotId == firstSnapshotId + 2, 'wrong recordedSnapshotId 2');
        await voteTokenAlphaInstance.transfer(alice.address, 100000);  // +1 block
        balance = await voteTokenAlphaInstance.balanceOf(alice.address);
        assert(balance == 200000, 'wrong balance 3');
        let snapshotKey = (firstSnapshotId + 2).toString(16).padStart(12, "0") + (firstSnapshotId + 4).toString(16).padStart(12, "0");
        balance = await voteTokenAlphaInstance.balanceOfAt(alice.address + snapshotKey);
        assert(balance == 100000, 'wrong balance 4');
        recordedSnapshotId = await voteTokenAlphaInstance.recordedSnapshotId(alice.address);
        assert(recordedSnapshotId == firstSnapshotId + 4, 'wrong recordedSnapshotId 3');

        // await voteTokenAlphaInstance.snapshot();  // not supported, touch instead to move block
        // await voteTokenAlphaInstance.snapshot();  // not supported, touch instead to move block
        await touch.touch();  // +1 block
        await touch.touch();  // +1 block
        lastSnapshotId = await voteTokenAlphaInstance.lastSnapshotId();
        assert(lastSnapshotId.toNumber() + 1 == firstSnapshotId + 6, 'wrong snapshot 3');
        balance = await voteTokenAlphaInstance.balanceOf(alice.address);
        assert(balance == 200000, 'wrong balance 5');
        recordedSnapshotId = await voteTokenAlphaInstance.recordedSnapshotId(alice.address);
        assert(recordedSnapshotId == firstSnapshotId + 4, 'wrong recordedSnapshotId 4');
        await voteTokenAlphaInstance.transfer(alice.address, 100000);  // +1 block
        balance = await voteTokenAlphaInstance.balanceOf(alice.address);
        assert(balance == 300000, 'wrong balance 6');
        snapshotKey = (firstSnapshotId + 4).toString(16).padStart(12, "0") + (firstSnapshotId + 7).toString(16).padStart(12, "0");
        balance = await voteTokenAlphaInstance.balanceOfAt(alice.address + snapshotKey);
        assert(balance == 200000, 'wrong balance 7');
        recordedSnapshotId = await voteTokenAlphaInstance.recordedSnapshotId(alice.address);
        assert(recordedSnapshotId == firstSnapshotId + 7, 'wrong recordedSnapshotId 5');
    });

    it('transfer and reclaim gas', async () => {
        const provider = waffle.provider;

        let firstSnapshotId = await provider.getBlockNumber();
        await voteTokenAlphaInstance.mint(owner.address, 1000000);  // +1 block
        // await voteTokenAlphaInstance.snapshot();  // not supported, without touch
        await voteTokenAlphaInstance.transfer(alice.address, 100000);  // +1 block

        let snapshotKey = (firstSnapshotId + 1).toString(16).padStart(12, "0") + (firstSnapshotId + 2).toString(16).padStart(12, "0");
        await voteTokenAlphaInstance.transferAndReclaimGas(alice.address, 100000, owner.address + snapshotKey);
        let balance = await voteTokenAlphaInstance.balanceOfAt(owner.address + snapshotKey);
        assert(balance == 0, 'wrong snapshot balance');

    });

    it('burn', async () => {
        const provider = waffle.provider;

        let firstSnapshotId = await provider.getBlockNumber();
        await voteTokenAlphaInstance.mint(owner.address, 1000000);  // +1 block
        await voteTokenAlphaInstance.transfer(alice.address, 100000);  // +1 block
        await voteTokenAlphaInstance.burn(alice.address, 10000);  // +1 block
        // await voteTokenAlphaInstance.snapshot();  // not supported, without touch
        await voteTokenAlphaInstance.transfer(alice.address, 100000);  // +1 block

        let snapshotKey = (firstSnapshotId + 3).toString(16).padStart(12, "0") + (firstSnapshotId + 4).toString(16).padStart(12, "0");
        let balance = await voteTokenAlphaInstance.balanceOfAt(alice.address + snapshotKey);
        assert(balance == 100000-10000, 'wrong snapshot balance');

    });

});
