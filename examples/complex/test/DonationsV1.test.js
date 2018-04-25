const DonationsV1 = artifacts.require('DonationsV1');

const assertRevert = require('./helpers/assertRevert.js');
const getBalance = require('./helpers/getBalance.js');
const shouldBehaveLikeDonations = require('./Donations.behavior.js');
const should = require('chai').should();

contract('DonationsV1', (accounts) => {

  beforeEach(async function() {
    this.owner = accounts[1];
    this.donor1 = accounts[2];
    this.wallet = accounts[4];
    this.donations = await DonationsV1.new();
    await this.donations.initialize(this.owner);
  });

  shouldBehaveLikeDonations();
});

