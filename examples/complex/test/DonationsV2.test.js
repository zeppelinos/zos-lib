const DonationsV2 = artifacts.require('DonationsV2');

const shouldBehaveLikeDonations = require('./DonationsV1.test.js');
const assertRevert = require('./helpers/assertRevert.js');
const should = require('chai').should();

contract('DonationsV2', (accounts) => {

  describe('implementation', function() {

    async function setToken(donations) {
      // TODO: set erc721 token here
    }

    shouldBehaveLikeDonations(DonationsV2, accounts, setToken);
  });
});
