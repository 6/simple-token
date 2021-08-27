const { expect } = require("chai");

const TOTAL_SUPPLY = 1000000000;

describe("Token contract", () => {
  let TokenContract;
  let token;
  let owner;
  let signers;

  beforeEach(async () => {
    TokenContract = await ethers.getContractFactory("Token");
    token = await TokenContract.deploy();
    [owner, ...signers] = await ethers.getSigners();
  });

  describe('initial deployment', () => {
    it('sets the correct total supply', async () => {
      const totalSupply = await token.totalSupply();
      expect(totalSupply).to.equal(TOTAL_SUPPLY);
    });

    it("assigns total supply of tokens to the owner", async () => {
      const ownerBalance = await token.balanceOf(owner.address);
      expect(ownerBalance).to.equal(TOTAL_SUPPLY);
    });

    it("sets the correct contract owner", async () => {
      expect(await token.owner()).to.equal(owner.address);
    });
  });

  describe('transfer', () => {
    it('transfers tokens between accounts', async () => {
      const [signer1, signer2] = signers;

      // Transfer 50 tokens from owner to signer1
      await token.transfer(signer1.address, 50);
      expect(await token.balanceOf(signer1.address)).to.equal(50);

      // Transfer 50 tokens from signer1 to signer2
      await token.connect(signer1).transfer(signer2.address, 50);
      expect(await token.balanceOf(signer2.address)).to.equal(50);
    });
  });
});
