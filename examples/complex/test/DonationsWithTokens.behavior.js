const shouldBehaveLikeDonations = require('./Donations.behavior.js');
const assertRevert = require('./helpers/assertRevert.js');
const getBalance = require('./helpers/getBalance.js');
const should = require('chai').should();

function shouldBehaveLikeDonationsWithTokens(accounts) {

  const owner = accounts[0];
  const donor1 = accounts[1];
  const tokenName = 'DonationToken';
  const tokenSymbol = 'DON';

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

    it('is the token set in the donations contract', async function() {
      (await this.donations.token()).should.be.eq(this.token.address);
    });

  });

  describe('donate', function() {

    describe('when receiving a donation that is greater than zero', function() {

      const donationValue = 1;
      const donation = {from: donor1, value: web3.toWei(donationValue, 'ether')};

      beforeEach(async function() {
        await this.donations.donate(donation);
      });

      it('increments token id', async function() {
        (await this.donations.numEmittedTokens()).toNumber().should.be.eq(donationValue);
      });

      it('mints tokens', async function() {
        (await this.token.balanceOf(donor1)).toNumber().should.be.eq(donationValue);
      });

    });

  });

}

module.exports = shouldBehaveLikeDonationsWithTokens;
