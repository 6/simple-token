const { expect } = require("chai");
const { constants } = require('@openzeppelin/test-helpers');

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

  describe('transfers', () => {
    it('transfers tokens between accounts, updating balances correctly', async () => {
      const [signer1, signer2] = signers;

      expect(await token.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY);
      expect(await token.balanceOf(signer1.address)).to.equal(0);
      expect(await token.balanceOf(signer2.address)).to.equal(0);

      // Transfer 50 tokens from owner to signer1
      await token.transfer(signer1.address, 50);
      expect(await token.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY - 50);
      expect(await token.balanceOf(signer1.address)).to.equal(50);

      // Transfer 30 tokens from signer1 to signer2
      await token.connect(signer1).transfer(signer2.address, 30);
      expect(await token.balanceOf(signer1.address)).to.equal(20);
      expect(await token.balanceOf(signer2.address)).to.equal(30);
    });

    it('reverts when insufficient balance', async () => {
      const [signer1] = signers;
      const initialOwnerBalance = await token.balanceOf(owner.address);

      await expect(
        token.connect(signer1).transfer(owner.address, 1)
      ).to.be.revertedWith("Not enough tokens");

      // Owner balance shouldn't have changed.
      expect(await token.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });

    it('reverts when sender is the zero address', async () => {
      const initialOwnerBalance = await token.balanceOf(owner.address);

      await expect(
        token.transfer(constants.ZERO_ADDRESS, 50)
      ).to.be.revertedWith("Cannot transfer to zero address");

      // Owner balance shouldn't have changed.
      expect(await token.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });

    it('reverts when recipient is self', async () => {
      const initialOwnerBalance = await token.balanceOf(owner.address);

      await expect(
        token.transfer(owner.address, 50)
      ).to.be.revertedWith("Cannot transfer to self");

      // Owner balance shouldn't have changed.
      expect(await token.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });
  });
});
