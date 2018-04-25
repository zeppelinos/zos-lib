const DonationsV2 = artifacts.require('DonationsV2');
const MintableERC721Token = artifacts.require('MintableERC721Token');

const shouldBehaveLikeDonationsWithTokens = require('./DonationsWithTokens.behavior.js');

contract('DonationsV2', (accounts) => {

  beforeEach(async function() {
    this.owner = accounts[1];
    this.donor1 = accounts[2];
    this.wallet = accounts[4];
    this.tokenName = 'DonationToken';
    this.tokenSymbol = 'DON';
    this.donations = await DonationsV2.new();
    await this.donations.initialize(this.owner);
    this.token = await MintableERC721Token.new();
    await this.token.initialize(this.donations.address, this.tokenName, this.tokenSymbol);
    await this.donations.setToken(this.token.address, {from: this.owner});
  });

  shouldBehaveLikeDonationsWithTokens();
});
