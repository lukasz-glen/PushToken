const { assert, expect } = require('chai');
const { ethers } = require("hardhat");

describe('VoteTokenBeta events', async function () {
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

    it('snapshots', async () => {
        const provider = waffle.provider;
        let fromBlockNumber = await provider.getBlockNumber();

        await voteTokenInstance.snapshot();
        await voteTokenInstance.mint(alice.address, 10000000);
        await voteTokenInstance.snapshot();
        let aliceInstance = voteTokenInstance.connect(alice);
        await aliceInstance.transfer(bob.address, 1000000);
        await aliceInstance.transfer(bob.address, 1000000);
        await voteTokenInstance.snapshot();
        await voteTokenInstance.snapshot();
        await aliceInstance.transfer(bob.address, 1000000);
        await voteTokenInstance.snapshot();

        let transferEvents = await voteTokenInstance.queryFilter('Transfer', fromBlockNumber);
        let snapshotEvents = await voteTokenInstance.queryFilter('Snapshot', fromBlockNumber);
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
            let balance = await voteTokenInstance.balanceOfAt(alice.address+snapshotKey);
            assert(balance > 0, 'wrong snapshot balance');
        }
    });
});
