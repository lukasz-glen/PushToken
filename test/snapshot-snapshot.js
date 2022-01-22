const { assert, expect } = require('chai');
const { ethers } = require("hardhat");

describe('SnapshotToken snapshots', async function () {
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

        ERC20SnapshotDev = await ethers.getContractFactory("ERC20SnapshotDev");
        ERC20SnapshotDevInstance = await ERC20SnapshotDev.connect(owner).deploy('test', 'test');
        await ERC20SnapshotDevInstance.deployed();

    });

    it('snapshots', async () => {
        await snapshotTokenInstance.mint(alice.address, 10000000);
        let instance = snapshotTokenInstance.connect(alice);
        await ERC20SnapshotDevInstance.mint(alice.address, 10000000);
        let instanceERC20 = ERC20SnapshotDevInstance.connect(alice);

        for(let i = 0 ; i < 5 ; i++) {
            await instance.transfer(bob.address, 100000);
            await instance.transfer(charlie.address, 100000);

            await instanceERC20.transfer(bob.address, 100000);
            await instanceERC20.transfer(charlie.address, 100000);

            await snapshotTokenInstance.snapshot();
            await ERC20SnapshotDevInstance.snapshot();
        }
    });
});
