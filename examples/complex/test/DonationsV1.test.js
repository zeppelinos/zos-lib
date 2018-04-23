const DonationsV1 = artifacts.require('DonationsV1');

const assertRevert = require('./helpers/assertRevert.js');
const should = require('chai').should();

contract('DonationsV1', (accounts) => {
  describe('implementation', function() {
    shouldBehaveLikeDonations(DonationsV1, accounts);
  });
});

function shouldBehaveLikeDonations(ContractClass, accounts) {

  const owner = accounts[0];
  const donor1 = accounts[1];

  let donations;

  async function getBalance(address) {
    return new Promise(function(resolve, reject) {
      web3.eth.getBalance(address, function(error, result) {
        if(error) reject(error);
        else resolve(+web3.fromWei(result.toNumber(), 'ether'));
      });
    });
  }

  beforeEach(async function() {
    donations = await ContractClass.new();
    donations.initialize(owner);
  });

  describe('donate', function () {

    describe('when the donation is zero', function() {
      it('reverts', async function() {
        await assertRevert(
          donations.donate({from: donor1, value: web3.toWei(0, 'ether')})
        );
      });
    });

    describe('when the donation is greated than zero', function() {

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
        const initialOwnerBalance = await getBalance(owner);
        await donations.donate({from: donor1, value: web3.toWei(1, 'ether')});
        await donations.withdraw(owner, {from: owner});
        (await getBalance(owner)).should.be.closeTo(initialOwnerBalance + 1, 0.01); 
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

    // describe('when called for someone who has made a donation');

    // describe('when called for someone who has not made a donation');

  });
}
