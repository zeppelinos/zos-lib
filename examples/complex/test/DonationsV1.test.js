const DonationsV1 = artifacts.require('DonationsV1');

const assertRevert = require('./helpers/assertRevert.js');
const getBalance = require('./helpers/getBalance.js');
const should = require('chai').should();

contract('DonationsV1', (accounts) => {
  describe('implementation', function() {
    shouldBehaveLikeDonations(DonationsV1, accounts);
  });
});

function shouldBehaveLikeDonations(ContractClass, accounts, extraBeforeEach) {

  const owner = accounts[0];
  const donor1 = accounts[1];
  const wallet = accounts[4];

  let donations;

  beforeEach(async function() {
    donations = await ContractClass.new();
    donations.initialize(owner);
    if(extraBeforeEach) extraBeforeEach(donations);
  });

  describe('donate', function () {

    describe('when the donation is zero', function() {
      it('reverts', async function() {
        await assertRevert(
          donations.donate({from: donor1, value: web3.toWei(0, 'ether')})
        );
      });
    });

    describe('when the donation is greater than zero', function() {

      it('accepts the donation', async function() {
        await donations.donate({from: donor1, value: web3.toWei(1, 'ether')});
      });

      it('increases contract balance', async function() {
        await donations.donate({from: donor1, value: web3.toWei(1, 'ether')});
        (await getBalance(donations.address)).should.be.above(0);
      });

    });
  });

  describe('withdraw', function() {

    describe('when called by the owner', function() {
      it('transfers all funds to the designated wallet', async function() {
        const initialWalletBalance = await getBalance(wallet);
        await donations.donate({from: donor1, value: web3.toWei(1, 'ether')});
        await donations.withdraw(wallet, {from: owner});
        (await getBalance(wallet)).should.be.eqt (initialWalletBalance + 1);
      });
    });

    describe('when called by someone who is not the owner', function() {
      it('reverts', async function() {
        await assertRevert(
          donations.withdraw(donor1, {from: donor1})
        );
      });
    });

  });

  describe('getDonationBalance', function() {

    describe('when called for someone who has made a donation', function() {
      it('returns the donors balance', async function() {
        await donations.donate({from: donor1, value: web3.toWei(1, 'ether')});
        (+web3.fromWei((await donations.getDonationBalance(donor1)).toNumber(), 'ether')).should.be.eq(1);
      });
    });

    describe('when called for someone who has not made a donation', async function() {
      it('returns the donors balance', async function() {
        (+web3.fromWei((await donations.getDonationBalance(donor1)).toNumber(), 'ether')).should.be.eq(0);
      });
    });

  });
}

module.exports = shouldBehaveLikeDonations;
