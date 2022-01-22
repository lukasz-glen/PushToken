const { assert, expect } = require('chai');
const { ethers, waffle } = require("hardhat");

describe('VoteTokenAlpha logs', async function () {
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

    });

    it('logs', async () => {
        const provider = waffle.provider;
        let fromBlockNumber = await provider.getBlockNumber();

        await(await voteTokenAlphaInstance.mint(owner.address, 1000000)).wait();
        await(await voteTokenAlphaInstance.mint(alice.address, 200000)).wait();
        await(await voteTokenAlphaInstance.connect(alice).transfer(bob.address, 100000)).wait();
        await(await voteTokenAlphaInstance.transfer(bob.address, 100000)).wait();
        await(await voteTokenAlphaInstance.transfer(alice.address, 100000)).wait();

        let events = await voteTokenAlphaInstance.queryFilter('Transfer', fromBlockNumber);
        let lastBlockNumber = -1;
        let snapshotKeys = [];
        for (let event of events) {
            if (event.args.to != alice.address && event.args.from != alice.address) {
                continue;
            }
            if (lastBlockNumber == -1) {
                lastBlockNumber = event.blockNumber;
                continue;
            }
            if (lastBlockNumber == event.blockNumber) {
                continue;
            }
            let snapshotKey = (lastBlockNumber).toString(16).padStart(12, "0") + (event.blockNumber).toString(16).padStart(12, "0");
            snapshotKeys.push(snapshotKey);
            lastBlockNumber = event.blockNumber;
        }

        for (let snapshotKey of snapshotKeys) {
            let balance = await voteTokenAlphaInstance.balanceOfAt(alice.address+snapshotKey);
            assert(balance > 0, 'wrong snapshot balance');
        }

    });

});
