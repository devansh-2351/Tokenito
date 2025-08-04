const { expect } = require("chai");
const { ethers, parseEther } = require("ethers");
const hre = require("hardhat");

describe("SimpleToken", function () {
  let SimpleToken, simpleToken, owner, addr1, initialSupply;

  beforeEach(async function () {
    [owner, addr1] = await hre.ethers.getSigners();
    initialSupply = parseEther("1000");
    SimpleToken = await hre.ethers.getContractFactory("SimpleToken");
    simpleToken = await SimpleToken.deploy(initialSupply);
    // await simpleToken.deployed(); // Not needed in ethers v6
  });

  it("Should assign the initial supply to the owner", async function () {
    expect(await simpleToken.balanceOf(owner.address)).to.equal(initialSupply);
  });

  it("Should transfer tokens between accounts", async function () {
    await simpleToken.transfer(addr1.address, parseEther("100"));
    expect(await simpleToken.balanceOf(addr1.address)).to.equal(parseEther("100"));
  });
}); 