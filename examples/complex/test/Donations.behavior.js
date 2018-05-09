import assertRevert from 'zos-lib/lib/helpers/assertRevert';

const getBalance = require('./helpers/getBalance.js');
const should = require('chai').should();

module.exports = function() {

  describe('donate', function () {

    describe('when the donation is zero', function() {

      beforeEach(function() {
        this.donation = {from: this.donor1, value: web3.toWei(0, 'ether')};
      });

      it('reverts', async function() {
        await assertRevert(
          this.donations.donate()
        );
      });

    });

    describe('when the donation is greater than zero', function() {

      beforeEach(function() {
        this.donation = {from: this.donor1, value: web3.toWei(1, 'ether')};
      });

      it('accepts the donation', async function() {
        await this.donations.donate(this.donation);
      });

      it('increases contract balance', async function() {
        await this.donations.donate(this.donation);
        (await getBalance(this.donations.address)).should.be.above(0);
      });

    });
  });

  describe('withdraw', function() {

    describe('when called by the owner', function() {

      beforeEach(function() {
        this.caller = this.owner;
      });

      it('transfers all funds to the designated wallet', async function() {
        const initialWalletBalance = await getBalance(this.wallet);
        await this.donations.donate({from: this.donor1, value: web3.toWei(1, 'ether')});
        await this.donations.withdraw(this.wallet, {from: this.caller});
        (await getBalance(this.wallet)).should.be.eq(initialWalletBalance + 1);
      });

    });

    describe('when called by someone who is not the owner', function() {

      beforeEach(function() {
        this.caller = this.donor1;
      });

      it('reverts', async function() {
        await assertRevert(
          this.donations.withdraw(this.donor1, {from: this.caller})
        );
      });

    });

  });

  describe('getDonationBalance', function() {

    beforeEach(function() {
      this.donor = this.donor1;
    });

    describe('when called for someone who has made a donation', async function() {

      beforeEach(async function() {
        this.donation = {from: this.donor, value: web3.toWei(1, 'ether')};
        await this.donations.donate(this.donation);
      });

      it('returns the donors balance', async function() {
        (+web3.fromWei((await this.donations.getDonationBalance(this.donor)).toNumber(), 'ether')).should.be.eq(1);
      });

    });

    describe('when called for someone who has not made a donation', function() {

      it('returns the donors balance', async function() {
        (+web3.fromWei((await this.donations.getDonationBalance(this.donor)).toNumber(), 'ether')).should.be.eq(0);
      });

    });

  });
}
