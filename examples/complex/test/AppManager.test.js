const OwnedUpgradeabilityProxy = artifacts.require('OwnedUpgradeabilityProxy.sol');
const UpgradeabilityProxyFactory = artifacts.require('UpgradeabilityProxyFactory');
const Package = artifacts.require('Package');
const AppDirectory = artifacts.require('AppDirectory');
const ContractDirectory = artifacts.require('ContractDirectory');
const AppManager = artifacts.require('PackagedAppManager');
const MintableERC721Token = artifacts.require('MintableERC721Token');

const DonationsV1 = artifacts.require('DonationsV1');
const DonationsV2 = artifacts.require('DonationsV2');

const decodeLogs = require('zos-lib').decodeLogs;
const encodeCall = require('zos-lib').encodeCall;
const validateAddress = require('./helpers/validateAddress.js');
const shouldBehaveLikeDonations = require('./Donations.behavior.js');
const shouldBehaveLikeDonationsWithTokens = require('./DonationsWithTokens.behavior.js');
const should = require('chai').should();
const deploy = require('../index.js');

contract.only('AppManager', (accounts) => {

  before(function() {
    this.owner = accounts[1];
    this.donor = accounts[2];
    this.wallet = accounts[4];
    this.initialVersion = '0.0.1';
    this.updatedVersion = '0.0.2';
    this.contractName = "Donations";
    this.tokenClass = 'MintableERC721Token';
    this.tokenName = 'DonationToken';
    this.tokenSymbol = 'DON';
    this.txParams = {
      from: this.owner
    };
  });

  describe('setup', function() {

    beforeEach(deploy.setupAppManager);

    describe('package', function() {

      describe('when queried for the initial version', function() {
        it('claims to have it', async function() {
          (await this.appManager.package.hasVersion(this.initialVersion)).should.be.true;
        });
      });

      describe('when queried for the updated version', function() {
        it('doesnt claim to have it', async function() {
          (await this.appManager.package.hasVersion(this.updatedVersion)).should.be.false;
        });
      });

    });

    describe('version 0.0.1', function() {
      
      beforeEach(deploy.deployVersion1);
      
      describe('directory', function() {
        describe('when queried for the implementation', function() {
          it('returns a valid address', async function() {
            validateAddress(await this.appManager.directories[this.initialVersion].getImplementation(this.contractName)).should.be.true;
          });
        });
      });

      describe('implementation', function() {
        shouldBehaveLikeDonations();
      });

      describe.only('version 0.0.2', function() {

        beforeEach(deploy.deployVersion2);

        describe('implementation', function() {
          shouldBehaveLikeDonationsWithTokens();
        });
      });
    });
  });
});
