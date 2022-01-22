const { assert, expect } = require('chai');
const { ethers } = require("hardhat");

describe('SnapshotToken transfers', async function () {
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

    it('transfers', async () => {
        await snapshotTokenInstance.mint(alice.address, 1000000);
        let instance = snapshotTokenInstance.connect(alice);
        await instance.transfer(bob.address, 100000);
        await instance.transfer(bob.address, 100000);
        await instance.transfer(charlie.address, 100000);
        await instance.transfer(charlie.address, 100000);

        await ERC20SnapshotDevInstance.mint(alice.address, 1000000);
        let instanceERC20 = ERC20SnapshotDevInstance.connect(alice);
        await instanceERC20.transfer(bob.address, 100000);
        await instanceERC20.transfer(bob.address, 100000);
        await instanceERC20.transfer(charlie.address, 100000);
        await instanceERC20.transfer(charlie.address, 100000);
    });
});
