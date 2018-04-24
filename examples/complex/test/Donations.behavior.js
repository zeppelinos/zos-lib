const getBalance = require('./helpers/getBalance.js');
const assertRevert = require('./helpers/assertRevert.js');

function shouldBehaveLikeDonations(accounts) {

  const owner = accounts[0];
  const donor1 = accounts[1];
  const wallet = accounts[4];

  describe('donate', function () {

    describe('when the donation is zero', function() {
      it('reverts', async function() {
        await assertRevert(
          this.donations.donate({from: donor1, value: web3.toWei(0, 'ether')})
        );
      });
    });

    describe('when the donation is greater than zero', function() {

      it('accepts the donation', async function() {
        await this.donations.donate({from: donor1, value: web3.toWei(1, 'ether')});
      });

      it('increases contract balance', async function() {
        await this.donations.donate({from: donor1, value: web3.toWei(1, 'ether')});
        (await getBalance(this.donations.address)).should.be.above(0);
      });

    });
  });

  describe('withdraw', function() {

    describe('when called by the owner', function() {
      it('transfers all funds to the designated wallet', async function() {
        const initialWalletBalance = await getBalance(wallet);
        await this.donations.donate({from: donor1, value: web3.toWei(1, 'ether')});
        await this.donations.withdraw(wallet, {from: owner});
        (await getBalance(wallet)).should.be.eq(initialWalletBalance + 1);
      });
    });

    describe('when called by someone who is not the owner', function() {
      it('reverts', async function() {
        await assertRevert(
          this.donations.withdraw(donor1, {from: donor1})
        );
      });
    });

  });

  describe('getDonationBalance', function() {

    describe('when called for someone who has made a donation', function() {
      it('returns the donors balance', async function() {
        await this.donations.donate({from: donor1, value: web3.toWei(1, 'ether')});
        (+web3.fromWei((await this.donations.getDonationBalance(donor1)).toNumber(), 'ether')).should.be.eq(1);
      });
    });

    describe('when called for someone who has not made a donation', async function() {
      it('returns the donors balance', async function() {
        (+web3.fromWei((await this.donations.getDonationBalance(donor1)).toNumber(), 'ether')).should.be.eq(0);
      });
    });

  });
}

module.exports = shouldBehaveLikeDonations;
