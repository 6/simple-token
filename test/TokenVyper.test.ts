import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, Contract, ContractFactory, constants } from 'ethers';

const TOTAL_SUPPLY = BigNumber.from(1000000000);

describe('TokenVyper contract', () => {
  let TokenContract: ContractFactory;
  let token: Contract;
  let owner: SignerWithAddress;
  let signers: Array<SignerWithAddress>;

  beforeEach(async () => {
    TokenContract = await ethers.getContractFactory('TokenVyper');
    token = await TokenContract.deploy();
    [owner, ...signers] = await ethers.getSigners();
  });

  describe('initial deployment', () => {
    it('sets the correct total supply', async () => {
      const totalSupply = await token.totalSupply();
      expect(totalSupply).toEqual(TOTAL_SUPPLY);
    });

    it('assigns total supply of tokens to the owner', async () => {
      const ownerBalance = await token.balanceOf(owner.address);
      expect(ownerBalance).toEqual(TOTAL_SUPPLY);
    });

    it('sets the correct contract owner', async () => {
      expect(await token.owner()).toEqual(owner.address);
    });

    it('sets token name and symbol', async () => {
      expect(await token.name()).toEqual('Simple Token');
      expect(await token.symbol()).toEqual('SMPL');
    });
  });

  describe('transfers', () => {
    it('transfers tokens between accounts, updating balances correctly', async () => {
      const [signer1, signer2] = signers;

      expect(await token.balanceOf(owner.address)).toEqual(TOTAL_SUPPLY);
      expect(await token.balanceOf(signer1.address)).toEqual(BigNumber.from(0));
      expect(await token.balanceOf(signer2.address)).toEqual(BigNumber.from(0));

      // Transfer 50 tokens from owner to signer1
      await token.transfer(signer1.address, 50);
      expect(await token.balanceOf(owner.address)).toEqual(TOTAL_SUPPLY.sub(50));
      expect(await token.balanceOf(signer1.address)).toEqual(BigNumber.from(50));

      // Transfer 30 tokens from signer1 to signer2
      await token.connect(signer1).transfer(signer2.address, 30);
      expect(await token.balanceOf(signer1.address)).toEqual(BigNumber.from(20));
      expect(await token.balanceOf(signer2.address)).toEqual(BigNumber.from(30));
    });

    it('emits a Transfer event', async () => {
      const [signer1] = signers;

      const tx = await token.transfer(signer1.address, 50);
      expect(tx).toHaveEmittedWith(token, 'Transfer', [
        owner.address,
        signer1.address,
        BigNumber.from(50),
      ]);
    });

    it('reverts when insufficient balance', async () => {
      const [signer1] = signers;
      const initialOwnerBalance = await token.balanceOf(owner.address);

      await expect(token.connect(signer1).transfer(owner.address, 1)).toBeRevertedWith(
        'Not enough tokens',
      );

      // Owner balance shouldn't have changed.
      expect(await token.balanceOf(owner.address)).toEqual(initialOwnerBalance);
    });

    it('reverts when transferring 0 amount', async () => {
      const [signer1] = signers;

      await expect(token.transfer(signer1.address, 0)).toBeRevertedWith(
        'Transfer amount must be >0',
      );
    });

    it('reverts when transferring negative amount', async () => {
      const [signer1] = signers;

      await expect(token.transfer(signer1.address, -50)).toBeReverted();
    });

    it('reverts when sender is the zero address', async () => {
      const initialOwnerBalance = await token.balanceOf(owner.address);

      await expect(token.transfer(constants.AddressZero, 50)).toBeRevertedWith(
        'Cannot transfer to zero address',
      );

      // Owner balance shouldn't have changed.
      expect(await token.balanceOf(owner.address)).toEqual(initialOwnerBalance);
    });

    it('reverts when recipient is self', async () => {
      const initialOwnerBalance = await token.balanceOf(owner.address);

      await expect(token.transfer(owner.address, 50)).toBeRevertedWith('Cannot transfer to self');

      // Owner balance shouldn't have changed.
      expect(await token.balanceOf(owner.address)).toEqual(initialOwnerBalance);
    });
  });
});
