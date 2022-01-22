const { assert, expect } = require('chai');
const { ethers, waffle } = require("hardhat");

describe('PushingSnapshotToken test', async function () {

    beforeEach(async () => {
        [
            alice,
            bob,
            charlie,
            owner,
        ] = await ethers.getSigners();

        PushingSnapshotTokenDev = await ethers.getContractFactory("PushingSnapshotTokenDev");
        pushingTokenInstance = await PushingSnapshotTokenDev.connect(owner).deploy();
        await pushingTokenInstance.deployed();

    });

    it('receive push', async () => {
        PushReceiverDev = await ethers.getContractFactory("PushReceiverDev");
        pushReceiverDevInstance = await PushReceiverDev.connect(owner).deploy();
        await pushReceiverDevInstance.deployed();

        await pushingTokenInstance.mint(owner.address, 1000000);
        await pushingTokenInstance.snapshot();  // snapshot 1

        let tx = await (await pushingTokenInstance['pushSnapshot(uint256,address,bytes)'](1, pushReceiverDevInstance.address, '0x01')).wait();
        let event = pushReceiverDevInstance.interface.parseLog(tx.events[0]);
        assert(event.name == 'PushReceived', 'wrong event name 1');
        assert(event.args['snapshotId'] == 1, 'wrong snapshot id 1');
        assert(event.args['sender'] == owner.address, 'wrong sender 1');
        assert(event.args['balance'] == 1000000, 'wrong balance 1');

        await pushingTokenInstance.transfer(alice.address, 100000);
        await pushingTokenInstance.snapshot();  // snapshot 2

        tx = await (await pushingTokenInstance['pushSnapshot(uint256,address,bytes)'](2, pushReceiverDevInstance.address, '0x02')).wait();
        event = pushReceiverDevInstance.interface.parseLog(tx.events[0]);
        assert(event.name == 'PushReceived', 'wrong event name 2');
        assert(event.args['snapshotId'] == 2, 'wrong snapshot id 2');
        assert(event.args['sender'] == owner.address, 'wrong sender 2');
        assert(event.args['balance'] == 1000000-100000, 'wrong balance 2');

        let snapshotKey = owner.address+'000000000001000000000002';
        tx = await (await pushingTokenInstance['pushSnapshot(uint256,uint256,address,bytes)'](1, snapshotKey, pushReceiverDevInstance.address, '0x03')).wait();
        event = pushReceiverDevInstance.interface.parseLog(tx.events[0]);
        assert(event.name == 'PushReceived', 'wrong event name 3');
        assert(event.args['snapshotId'] == 1, 'wrong snapshot id 3');
        assert(event.args['sender'] == owner.address, 'wrong sender 3');
        assert(event.args['balance'] == 1000000, 'wrong balance 3');
    });

    it('receive push with value', async () => {
        PushValueReceiverDev = await ethers.getContractFactory("PushValueReceiverDev");
        pushValueReceiverDevInstance = await PushValueReceiverDev.connect(owner).deploy();
        await pushValueReceiverDevInstance.deployed();

        await pushingTokenInstance.mint(owner.address, 1000000);
        await pushingTokenInstance.snapshot();  // snapshot 1

        let tx = await (await pushingTokenInstance['pushSnapshotWithValue(uint256,address,bytes)'](1, pushValueReceiverDevInstance.address, '0x01')).wait();
        let event = pushValueReceiverDevInstance.interface.parseLog(tx.events[0]);
        assert(event.name == 'PushValueReceived', 'wrong event name 1');
        assert(event.args['snapshotId'] == 1, 'wrong snapshot id 1');
        assert(event.args['sender'] == owner.address, 'wrong sender 1');
        assert(event.args['balance'] == 1000000, 'wrong balance 1');
        assert(event.args['value'] == 0, 'wrong eth value 1');

        await pushingTokenInstance.transfer(alice.address, 100000);
        await pushingTokenInstance.snapshot();  // snapshot 2

        tx = await (await pushingTokenInstance['pushSnapshotWithValue(uint256,address,bytes)'](2, pushValueReceiverDevInstance.address, '0x02', {value: 1000})).wait();
        event = pushValueReceiverDevInstance.interface.parseLog(tx.events[0]);
        assert(event.name == 'PushValueReceived', 'wrong event name 2');
        assert(event.args['snapshotId'] == 2, 'wrong snapshot id 2');
        assert(event.args['sender'] == owner.address, 'wrong sender 2');
        assert(event.args['balance'] == 1000000-100000, 'wrong balance 2');
        assert(event.args['value'] == 1000, 'wrong eth value 2');

        let snapshotKey = owner.address+'000000000001000000000002';
        tx = await (await pushingTokenInstance['pushSnapshotWithValue(uint256,uint256,address,bytes)'](1, snapshotKey, pushValueReceiverDevInstance.address, '0x03', {value: 3000})).wait();
        event = pushValueReceiverDevInstance.interface.parseLog(tx.events[0]);
        assert(event.name == 'PushValueReceived', 'wrong event name 3');
        assert(event.args['snapshotId'] == 1, 'wrong snapshot id 3');
        assert(event.args['sender'] == owner.address, 'wrong sender 3');
        assert(event.args['balance'] == 1000000, 'wrong balance 3');
        assert(event.args['value'] == 3000, 'wrong eth value 3');

        const provider = waffle.provider;
        let contractBalance = await provider.getBalance(pushValueReceiverDevInstance.address);
        assert(contractBalance == 4000, 'wrong final eth balance');
    });

});
