const OwnedUpgradeabilityProxy = artifacts.require('zos-lib/contracts/upgradeability/OwnedUpgradeabilityProxy.sol');
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

contract('AppManager', (accounts) => {

  const owner = accounts[0];
  const initialVersion = '0.0.1';
  const updatedVersion = '0.0.2';
  const contractName = "Donations";
  const txParams = {
    from: owner
  };

  describe('setup', function() {

    beforeEach(async function() {

      // Bootstrap project.
      this.factory = await UpgradeabilityProxyFactory.new(txParams);
      this.package = await Package.new(txParams);
      this.directory = await AppDirectory.new(0, txParams);
      await this.package.addVersion(initialVersion, this.directory.address, txParams);
      this.appManager = await AppManager.new(this.package.address, initialVersion, this.factory.address, txParams);
    });

    describe('package', function() {

      describe('when queried for the initial version', function() {

        it('claims to have it', async function() {
          (await this.package.hasVersion(initialVersion)).should.be.true;
        });

      });

      describe('when queried for the updated version', function() {

        it('doesnt claim to have it', async function() {
          (await this.package.hasVersion(updatedVersion)).should.be.false;
        });

      });

    });

    describe('version 0.0.1', function() {

      beforeEach(async function() {

        // Deploy version 0.0.1.
        const implementation = await DonationsV1.new(txParams);
        await this.directory.setImplementation(contractName, implementation.address, txParams);
        const callData = encodeCall('initialize', ['address'], [owner]);
        const {receipt} = await this.appManager.createAndCall(contractName, callData, txParams);
        const logs = decodeLogs([receipt.logs[1]], UpgradeabilityProxyFactory, 0x0);
        const proxyAddress = logs.find(l => l.event === 'ProxyCreated').args.proxy;
        this.proxy = OwnedUpgradeabilityProxy.at(proxyAddress);
      });

      describe('directory', function() {

        describe('when queried for the implementation', function() {

          it('returns a valid address', async function() {
            validateAddress(await this.directory.getImplementation(contractName)).should.be.true;
          });

        });
      });

      describe('implementation', function() {

        beforeEach(async function() {
          this.donations = DonationsV1.at(this.proxy.address);
        });

        shouldBehaveLikeDonations(accounts);
      });

      describe('version 0.0.2', function() {

        const tokenClass = 'MintableERC721Token';
        const tokenName = 'DonationToken';
        const tokenSymbol = 'DON';

        beforeEach(async function() {

          // Simulate stdlib.
          this.stdlib = await ContractDirectory.new(txParams);
          const tokenImplementation = await MintableERC721Token.new();
          await this.stdlib.setImplementation(tokenClass, tokenImplementation.address, txParams);

          // Deploy version 0.0.2.
          this.directory = await AppDirectory.new(this.stdlib.address, txParams);
          const implementation = await DonationsV2.new(txParams);
          await this.directory.setImplementation(contractName, implementation.address, txParams);
          await this.package.addVersion(updatedVersion, this.directory.address, txParams);
          await this.appManager.setVersion(updatedVersion, txParams);
          await this.appManager.upgradeTo(this.proxy.address, contractName, txParams);
          const callData = encodeCall(
            'initialize',
            ['address', 'string', 'string'],
            [this.proxy.address, tokenName, tokenSymbol]
          );
          const {receipt} = await this.appManager.createAndCall(tokenClass, callData, txParams);
          const logs = decodeLogs([receipt.logs[1]], UpgradeabilityProxyFactory, 0x0);
          const proxyAddress = logs.find(l => l.event === 'ProxyCreated').args.proxy;
          this.tokenProxy = OwnedUpgradeabilityProxy.at(proxyAddress);
          const donations = DonationsV2.at(this.proxy.address);
          await donations.setToken(proxyAddress, txParams);
        });

        describe('implementation', function() {

          beforeEach(async function() {
            this.token = MintableERC721Token.at(this.tokenProxy.address);
            this.donations = DonationsV2.at(this.proxy.address);
          });

          shouldBehaveLikeDonationsWithTokens(accounts);
        });

      });

    });

  });

});
