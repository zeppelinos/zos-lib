const DonationsV1 = artifacts.require('DonationsV1');
const shouldBehaveLikeDonations = require('./Donations.behavior.js');

contract('DonationsV1', (accounts) => {

  beforeEach(async function() {
    this.owner = accounts[1];
    this.donor = accounts[2];
    this.wallet = accounts[4];
    this.donations = await DonationsV1.new();
    await this.donations.initialize(this.owner);
  });

  shouldBehaveLikeDonations();
});
