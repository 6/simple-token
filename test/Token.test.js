const { expect } = require("chai");

const TOTAL_SUPPLY = 1000000000;

describe("Token contract", () => {
  it('has the correct total supply', async () => {
    const Token = await ethers.getContractFactory("Token");
    const hardhatToken = await Token.deploy();

    const totalSupply = await hardhatToken.totalSupply();
    expect(totalSupply).to.equal(TOTAL_SUPPLY);
  });

  it("assigns total supply of tokens to the owner upon deploy", async () => {
    const [owner] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    const hardhatToken = await Token.deploy();

    const ownerBalance = await hardhatToken.balanceOf(owner.address);
    expect(ownerBalance).to.equal(TOTAL_SUPPLY);
  });
});
