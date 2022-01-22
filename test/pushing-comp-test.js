const { assert, expect } = require('chai');
const { ethers, waffle } = require("hardhat");

describe('PushingComp test', async function () {

    beforeEach(async () => {
        [
            alice,
            bob,
            charlie,
            owner,
        ] = await ethers.getSigners();

        PushingCompFactory = await ethers.getContractFactory("PushingComp");
        pushingTokenInstance = await PushingCompFactory.connect(owner).deploy(owner.address);
        await pushingTokenInstance.deployed();

    });

    it('receive push', async () => {
        PushReceiverDev = await ethers.getContractFactory("PushReceiverDev");
        pushReceiverDevInstance = await PushReceiverDev.connect(owner).deploy();
        await pushReceiverDevInstance.deployed();

        const provider = waffle.provider;
        let pushingTokenAlice = pushingTokenInstance.connect(alice);
        await pushingTokenAlice.delegate(alice.address);

        await pushingTokenInstance.transfer(alice.address, 1000000);
        let blockNumber1 = await provider.getBlockNumber();

        let tx = await (await pushingTokenAlice.pushVotes(blockNumber1, 0, pushReceiverDevInstance.address, '0x01')).wait();
        let event = pushReceiverDevInstance.interface.parseLog(tx.events[0]);
        assert(event.name == 'PushReceived', 'wrong event name 1');
        assert(event.args['snapshotId'] == blockNumber1, 'wrong snapshot id 1');
        assert(event.args['sender'] == alice.address, 'wrong sender 1');
        assert(event.args['balance'] == 1000000, 'wrong balance 1');

        await pushingTokenAlice.transfer(bob.address, 100000);
        let blockNumber2 = await provider.getBlockNumber();

        tx = await (await pushingTokenAlice.pushVotes(blockNumber2, 1, pushReceiverDevInstance.address, '0x02')).wait();
        event = pushReceiverDevInstance.interface.parseLog(tx.events[0]);
        assert(event.name == 'PushReceived', 'wrong event name 2');
        assert(event.args['snapshotId'] == blockNumber2, 'wrong snapshot id 2');
        assert(event.args['sender'] == alice.address, 'wrong sender 2');
        assert(event.args['balance'] == 1000000-100000, 'wrong balance 2');

        tx = await (await pushingTokenAlice.pushVotes(blockNumber1, 0, pushReceiverDevInstance.address, '0x03')).wait();
        event = pushReceiverDevInstance.interface.parseLog(tx.events[0]);
        assert(event.name == 'PushReceived', 'wrong event name 3');
        assert(event.args['snapshotId'] == blockNumber1, 'wrong snapshot id 3');
        assert(event.args['sender'] == alice.address, 'wrong sender 3');
        assert(event.args['balance'] == 1000000, 'wrong balance 3');
    });

    it('receive push with value', async () => {
        PushValueReceiverDev = await ethers.getContractFactory("PushValueReceiverDev");
        pushValueReceiverDevInstance = await PushValueReceiverDev.connect(owner).deploy();
        await pushValueReceiverDevInstance.deployed();

        const provider = waffle.provider;
        let pushingTokenAlice = pushingTokenInstance.connect(alice);
        await pushingTokenAlice.delegate(alice.address);

        await pushingTokenInstance.transfer(alice.address, 1000000);
        let blockNumber1 = await provider.getBlockNumber();

        let tx = await (await pushingTokenAlice.pushVotesWithValue(blockNumber1, 0, pushValueReceiverDevInstance.address, '0x01')).wait();
        let event = pushValueReceiverDevInstance.interface.parseLog(tx.events[0]);
        assert(event.name == 'PushValueReceived', 'wrong event name 1');
        assert(event.args['snapshotId'] == blockNumber1, 'wrong snapshot id 1');
        assert(event.args['sender'] == alice.address, 'wrong sender 1');
        assert(event.args['balance'] == 1000000, 'wrong balance 1');
        assert(event.args['value'] == 0, 'wrong eth value 1');

        await pushingTokenAlice.transfer(bob.address, 100000);
        let blockNumber2 = await provider.getBlockNumber();

        tx = await (await pushingTokenAlice.pushVotesWithValue(blockNumber2, 1, pushValueReceiverDevInstance.address, '0x02', {value: 1000})).wait();
        event = pushValueReceiverDevInstance.interface.parseLog(tx.events[0]);
        assert(event.name == 'PushValueReceived', 'wrong event name 2');
        assert(event.args['snapshotId'] == blockNumber2, 'wrong snapshot id 2');
        assert(event.args['sender'] == alice.address, 'wrong sender 2');
        assert(event.args['balance'] == 1000000-100000, 'wrong balance 2');
        assert(event.args['value'] == 1000, 'wrong eth value 2');

        tx = await (await pushingTokenAlice.pushVotesWithValue(blockNumber1, 0, pushValueReceiverDevInstance.address, '0x03', {value: 3000})).wait();
        event = pushValueReceiverDevInstance.interface.parseLog(tx.events[0]);
        assert(event.name == 'PushValueReceived', 'wrong event name 3');
        assert(event.args['snapshotId'] == blockNumber1, 'wrong snapshot id 3');
        assert(event.args['sender'] == alice.address, 'wrong sender 3');
        assert(event.args['balance'] == 1000000, 'wrong balance 3');
        assert(event.args['value'] == 3000, 'wrong eth value 3');

        let contractBalance = await provider.getBalance(pushValueReceiverDevInstance.address);
        assert(contractBalance == 4000, 'wrong final eth balance');
    });

});
