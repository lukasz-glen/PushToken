const { assert, expect } = require('chai');
const { ethers } = require("hardhat");

describe('VoteTokenAlpha transfers', async function () {
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

        ERC20VotesDev = await ethers.getContractFactory("ERC20VotesDev");
        ERC20VotesDevInstance = await ERC20VotesDev.connect(owner).deploy('test');
        await ERC20VotesDevInstance.deployed();

        Comp = await ethers.getContractFactory("Comp");
        compInstance = await Comp.connect(owner).deploy(owner.address);
        await compInstance.deployed();

    });

    it('transfers', async () => {
        await voteTokenAlphaInstance.mint(alice.address, 1000000);
        let instance = voteTokenAlphaInstance.connect(alice);
        await instance.transfer(bob.address, 100000);
        await instance.transfer(bob.address, 100000);
        await instance.transfer(charlie.address, 100000);
        await instance.transfer(charlie.address, 100000);

        // Comparison with full record of votes
        await ERC20VotesDevInstance.connect(alice).delegate(alice.address);
        await ERC20VotesDevInstance.connect(bob).delegate(bob.address);
        await ERC20VotesDevInstance.connect(charlie).delegate(charlie.address);
        await ERC20VotesDevInstance.mint(alice.address, 1000000);
        let instanceERC20 = ERC20VotesDevInstance.connect(alice);
        await instanceERC20.transfer(bob.address, 100000);
        await instanceERC20.transfer(bob.address, 100000);
        await instanceERC20.transfer(charlie.address, 100000);
        await instanceERC20.transfer(charlie.address, 100000);

        // owner has all tokens
        await compInstance.connect(owner).delegate(owner.address);
        await compInstance.connect(bob).delegate(bob.address);
        await compInstance.connect(charlie).delegate(charlie.address);
        await compInstance.transfer(bob.address, 100000);
        await compInstance.transfer(bob.address, 100000);
        await compInstance.transfer(charlie.address, 100000);
        await compInstance.transfer(charlie.address, 100000);
    });
});
