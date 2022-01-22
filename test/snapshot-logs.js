const { assert, expect } = require('chai');
const { ethers } = require("hardhat");

describe('SnapshotToken events', async function () {
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

    it('snapshots', async () => {
        const provider = waffle.provider;
        let fromBlockNumber = await provider.getBlockNumber();

        await snapshotTokenInstance.snapshot();
        await snapshotTokenInstance.mint(alice.address, 10000000);
        await snapshotTokenInstance.snapshot();
        let aliceInstance = snapshotTokenInstance.connect(alice);
        await aliceInstance.transfer(bob.address, 1000000);
        await aliceInstance.transfer(bob.address, 1000000);
        await snapshotTokenInstance.snapshot();
        await snapshotTokenInstance.snapshot();
        await aliceInstance.transfer(bob.address, 1000000);
        await snapshotTokenInstance.snapshot();

        let transferEvents = await snapshotTokenInstance.queryFilter('Transfer', fromBlockNumber);
        let snapshotEvents = await snapshotTokenInstance.queryFilter('Snapshot', fromBlockNumber);
        let events =  transferEvents.concat(snapshotEvents);
        function compareEvents(e1, e2) {
            if (e1.blockNumber != e2.blockNumber) {
                return e1.blockNumber - e2.blockNumber;
            }
            return e1.logIndex - e2.logIndex;
        }
        events.sort(compareEvents);
        let lastSnapshotId = -1;
        let nextSnapshotId = -1;  // for alice
        let snapshotKeys = [];
        for (let event of events) {
            if (event.eventSignature == 'Snapshot(uint256)') {
                lastSnapshotId = event.args.id.toNumber();
            } else if (event.eventSignature == 'Transfer(address,address,uint256)') {
                if (lastSnapshotId == -1) {  // current snapshot is unknown, skip it
                    continue;
                }
                if (event.args.to != alice.address && event.args.from != alice.address) {
                    continue;
                }
                if (nextSnapshotId > lastSnapshotId) {  // no new snapshot was called
                    continue;
                }
                if (nextSnapshotId > -1) {  // if we know when was the last change of balance
                    let snapshotKey = nextSnapshotId.toString(16).padStart(12, "0") + (lastSnapshotId+1).toString(16).padStart(12, "0");
                    snapshotKeys.push(snapshotKey);
                }
                nextSnapshotId = lastSnapshotId + 1;
            }
        }

        for (let snapshotKey of snapshotKeys) {
            let balance = await snapshotTokenInstance.balanceOfAt(alice.address+snapshotKey);
            assert(balance > 0, 'wrong snapshot balance');
        }
    });
});
