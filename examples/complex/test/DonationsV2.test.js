const DonationsV2 = artifacts.require('DonationsV2');
const MintableERC721Token = artifacts.require('MintableERC721Token');

const shouldBehaveLikeDonations = require('./DonationsV1.test.js');
const assertRevert = require('./helpers/assertRevert.js');
const getBalance = require('./helpers/getBalance.js');
const should = require('chai').should();

contract('DonationsV2', (accounts) => {

  const owner = accounts[0];
  const donor1 = accounts[1];
  const tokenName = 'DonationToken';
  const tokenSymbol = 'DON';

  let token;
  let donations;

  describe('implementation', function() {

    async function setToken(_donations) {

      // Deploy and intialize a new ERC721 token.
      token = await MintableERC721Token.new();
      await token.initialize(_donations.address, tokenName, tokenSymbol);

      // Set token on donations contract.
      donations = _donations;
      await donations.setToken(token.address, {from: owner});
    }

    shouldBehaveLikeDonations(DonationsV2, accounts, setToken);

    describe('token', function() {

      it('is owned by the contract', async function() {
        (await token.owner()).should.be.eq(donations.address);
      });

      it('has the correct token name', async function() {
        (await token.name()).should.be.eq(tokenName);
      });

      it('has the correct token symbol', async function() {
        (await token.symbol()).should.be.eq(tokenSymbol);
      });

      it('cannot be set a second time', async function() {
        await assertRevert(
          donations.setToken(token.address, {from: owner})
        );
      });
    });

    describe('donate', function() {

      it('has a token', async function() {
        (await donations.token()).should.be.eq(token.address);
      });

      it('increments token id', async function() {
        await donations.donate({from: donor1, value: web3.toWei(1, 'ether')});
        (await donations.numEmittedTokens()).toNumber().should.be.eq(1);
      });

      // TODO
      // it('mints tokens', async function() {
      // });
    });
  });
});
