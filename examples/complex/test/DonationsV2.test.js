const DonationsV2 = artifacts.require('DonationsV2');
const MintableERC721Token = artifacts.require('MintableERC721Token');

const shouldBehaveLikeDonations = require('./DonationsV1.test.js');
const assertRevert = require('./helpers/assertRevert.js');
const getBalance = require('./helpers/getBalance.js');
const should = require('chai').should();

contract('DonationsV2', (accounts) => {

  const owner = accounts[0];
  const donor1 = accounts[1];

  let token;
  let donations;

  describe('implementation', function() {

    async function setToken(_donations) {

      // Deploy and intialize a new ERC721 token.
      token = await MintableERC721Token.new();
      await token.initialize(owner, 'DonationToken', 'DON');

      // Set token on donations contract.
      donations = _donations;
      donations.setToken(token.address);
    }

    shouldBehaveLikeDonations(DonationsV2, accounts, setToken);
  });
});
