// test/SimpleToken.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleToken", function () {
    let SimpleToken, token, owner, addr1, addr2;

    beforeEach(async function () {
        SimpleToken = await ethers.getContractFactory("SimpleToken");
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        token = await SimpleToken.deploy();
        await token.deployed();

        // Initialize the contract
        await token.initialize("My Token", "MTK", 1000);
    });

    it("Should have correct name, symbol, and total supply", async function () {
        expect(await token.name()).to.equal("My Token");
        expect(await token.symbol()).to.equal("MTK");
        expect(await token.totalSupply()).to.equal(ethers.utils.parseUnits("1000", 18));
        expect(await token.balanceOf(owner.address)).to.equal(ethers.utils.parseUnits("1000", 18));
    });

    it("Should transfer tokens between accounts", async function () {
        // Transfer 50 tokens from owner to addr1
        await token.transfer(addr1.address, ethers.utils.parseUnits("50", 18));
        expect(await token.balanceOf(owner.address)).to.equal(ethers.utils.parseUnits("950", 18));
        expect(await token.balanceOf(addr1.address)).to.equal(ethers.utils.parseUnits("50", 18));
    });

    it("Should approve and transfer tokens via allowance", async function () {
        // Approve addr1 to spend 100 tokens on behalf of owner
        await token.approve(addr1.address, ethers.utils.parseUnits("100", 18));
        expect(await token.allowance(owner.address, addr1.address)).to.equal(ethers.utils.parseUnits("100", 18));

        // Transfer 50 tokens from owner to addr2 via addr1
        await token.connect(addr1).transferFrom(owner.address, addr2.address, ethers.utils.parseUnits("50", 18));
        expect(await token.balanceOf(owner.address)).to.equal(ethers.utils.parseUnits("950", 18));
        expect(await token.balanceOf(addr2.address)).to.equal(ethers.utils.parseUnits("50", 18));
    });

    it("Should mint and burn tokens", async function () {
        // Mint 100 tokens to addr1
        await token.mint(addr1.address, 100);
        expect(await token.totalSupply()).to.equal(ethers.utils.parseUnits("1100", 18));
        expect(await token.balanceOf(addr1.address)).to.equal(ethers.utils.parseUnits("100", 18));

        // Burn 50 tokens from addr1
        await token.burn(addr1.address, 50);
        expect(await token.totalSupply()).to.equal(ethers.utils.parseUnits("1050", 18));
        expect(await token.balanceOf(addr1.address)).to.equal(ethers.utils.parseUnits("50", 18));
    });
});
