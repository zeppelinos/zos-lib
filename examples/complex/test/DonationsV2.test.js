const DonationsV2 = artifacts.require('DonationsV2');
const MintableERC721Token = artifacts.require('MintableERC721Token');

const shouldBehaveLikeDonations = require('./Donations.behavior.js');
const assertRevert = require('./helpers/assertRevert.js');
const getBalance = require('./helpers/getBalance.js');
const should = require('chai').should();

contract('DonationsV2', (accounts) => {

  const owner = accounts[0];
  const donor1 = accounts[1];
  const tokenName = 'DonationToken';
  const tokenSymbol = 'DON';

  beforeEach(async function() {
    this.donations = await DonationsV2.new(); await this.donations.initialize(owner);
    this.token = await MintableERC721Token.new();
    await this.token.initialize(this.donations.address, tokenName, tokenSymbol);
    await this.donations.setToken(this.token.address, {from: owner});
  });

  shouldBehaveLikeDonations(accounts);

  describe('token', function() {

    it('is owned by the contract', async function() {
      (await this.token.owner()).should.be.eq(this.donations.address);
    });

    it('has the correct token name', async function() {
      (await this.token.name()).should.be.eq(tokenName);
    });

    it('has the correct token symbol', async function() {
      (await this.token.symbol()).should.be.eq(tokenSymbol);
    });

    it('cannot be set a second time', async function() {
      await assertRevert(
        this.donations.setToken(this.token.address, {from: owner})
      );
    });
  });

  describe('donate', function() {

    it('has a token', async function() {
      (await this.donations.token()).should.be.eq(this.token.address);
    });

    it('increments token id', async function() {
      await this.donations.donate({from: donor1, value: web3.toWei(1, 'ether')});
      (await this.donations.numEmittedTokens()).toNumber().should.be.eq(1);
    });

    it('mints tokens', async function() {
      await this.donations.donate({from: donor1, value: web3.toWei(1, 'ether')});
      (await this.token.balanceOf(donor1)).toNumber().should.be.eq(1);
    });
  });
});
