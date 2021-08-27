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

    it('sets token name and symbol', async () => {
      expect(await token.name()).to.equal('Simple Token');
      expect(await token.symbol()).to.equal('SMPL');
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

    it('reverts when transferring 0 amount', async () => {
      const [signer1] = signers;

      await expect(
        token.transfer(signer1.address, 0)
      ).to.be.revertedWith("Transfer amount must be greater than zero");
    });

    it('reverts when transferring negative amount', async () => {
      const [signer1] = signers;

      await expect(
        token.transfer(signer1.address, -50)
      ).to.be.reverted;
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

  describe('freeze / unfreeze', () => {
    it('allows owner to freeze/unfreeze and address', async () => {
      const [signer1, signer2] = signers;

      expect(await token.isFrozen(signer1.address)).to.equal(false);
      expect(await token.isFrozen(signer2.address)).to.equal(false);

      await token.freeze(signer2.address);

      expect(await token.isFrozen(signer1.address)).to.equal(false);
      expect(await token.isFrozen(signer2.address)).to.equal(true);

      await token.unfreeze(signer2.address);

      expect(await token.isFrozen(signer1.address)).to.equal(false);
      expect(await token.isFrozen(signer2.address)).to.equal(false);
    });

    it('disables transfers sent from/to a frozen address', async () => {
      const [signer1, signer2] = signers;

      await token.transfer(signer1.address, 50);

      await token.freeze(signer1.address);

      // Can't do any transfers after frozen:
      await expect(
        token.connect(signer1).transfer(signer2.address, 10)
      ).to.be.revertedWith('Sender address is frozen');

      await expect(
        token.transfer(signer1.address, 100)
      ).to.be.revertedWith('Recipient address is frozen');

      expect(await token.balanceOf(signer1.address)).to.equal(50);

      // Once unfrozen, can transfer again:
      await token.unfreeze(signer1.address);
      await token.connect(signer1).transfer(signer2.address, 10);
      await token.transfer(signer1.address, 100);

      expect(await token.balanceOf(signer1.address)).to.equal(140);
    });

    it('disallows non-owner from freezing/unfreezing', async () => {
      const [signer1, signer2] = signers;

      await expect(
        token.connect(signer1).freeze(signer2.address)
      ).to.be.revertedWith('Must be owner to call this function');

      expect(await token.isFrozen(signer2.address)).to.equal(false);

      await expect(
        token.connect(signer1).unfreeze(signer2.address)
      ).to.be.revertedWith('Must be owner to call this function');

      expect(await token.isFrozen(signer2.address)).to.equal(false);
    });
  });

  describe('transferOwnership', () => {
    it('transfers ownership to the provided new owner', async() => {
      const [signer1] = signers;

      await token.transferOwnership(signer1.address);

      expect(await token.owner()).to.equal(signer1.address);
    });

    it('cannot be called by a non-owner', async() => {
      const [signer1, signer2] = signers;

      await expect(
        token.connect(signer1).transferOwnership(signer2.address)
      ).to.be.revertedWith('Must be owner to call this function');

      expect(await token.owner()).to.equal(owner.address);
    });
  });
});
