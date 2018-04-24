const DonationsV1 = artifacts.require('DonationsV1');

const assertRevert = require('./helpers/assertRevert.js');
const getBalance = require('./helpers/getBalance.js');
const shouldBehaveLikeDonations = require('./Donations.behavior.js');
const should = require('chai').should();

contract('DonationsV1', (accounts) => {

  const owner = accounts[0];

  beforeEach(async function() {
    this.donations = await DonationsV1.new();
    await this.donations.initialize(owner);
  });

  shouldBehaveLikeDonations(accounts);
});

