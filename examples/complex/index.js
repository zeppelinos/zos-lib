const decodeLogs = require('zos-lib').decodeLogs;
const encodeCall = require('zos-lib').encodeCall;

const OwnedUpgradeabilityProxy = artifacts.require('zos-lib/contracts/upgradeability/OwnedUpgradeabilityProxy.sol');
const ContractDirectory = artifacts.require('ContractDirectory');
const MintableERC721Token = artifacts.require('MintableERC721Token');
const UpgradeabilityProxyFactory = artifacts.require('UpgradeabilityProxyFactory');
const Package = artifacts.require('Package');
const AppDirectory = artifacts.require('AppDirectory');
const AppManager = artifacts.require('PackagedAppManager');

const DonationsV1 = artifacts.require('DonationsV1');
const DonationsV2 = artifacts.require('DonationsV2');

const owner = web3.eth.accounts[1];
const contractName = "Donations";
const tokenClass = 'MintableERC721Token';
const tokenName = 'DonationToken';
const tokenSymbol = 'DON';

const txParams = {
  from: owner,
  gas: 2000000,
  gasPrice: 120000000000
};

function log(msg) {
  if(!this.log) return;
  console.log(msg);
}

async function setupAppManager() {

  const initialVersion = '0.0.1';

  log("<< Setting up AppManager >>");

  // Setup a proxy factory that will be in charge of creating proxy contracts
  // for all of the project's upgradeable contracts.
  log(`Deploying proxy factory...`);
  this.factory = await UpgradeabilityProxyFactory.new(txParams);
  log(`Deployed proxy factory at ${this.factory.address}`);

  // A package keeps track of the project's versions, each of which is a
  // contract directory, i.e. a list of contracts.
  log(`Deploying application package...`);
  this.package = await Package.new(txParams);
  log(`Deployed application package at ${this.package.address}`);

  // For each version, a directory keeps track of the project's contract implementations.
  log(`Deploying application directory for version ${initialVersion}...`);
  this.directory = await AppDirectory.new(0, txParams);
  log(`Deployed application directory for initial version at ${this.directory.address}`);

  // Initialize the package with the first contract directory.
  log(`Adding version to package...`);
  await this.package.addVersion(initialVersion, this.directory.address, txParams);
  log(`Added application directory to package`);

  // With a proxy factory and a package, the project's app manager is bootstrapped and ready for use.
  log(`Deploying application manager...`);
  this.appManager = await AppManager.new(this.package.address, initialVersion, this.factory.address, txParams);
  log(`Deployed application manager at ${this.appManager.address}`);
}

async function deployVersion1Implementation() {

  log("\n<< Deploying version 1 >>");

  // Deploy an implementation that defines the behavior of the main contract.
  log(`Deploying first implementation of ${contractName}...`);
  const implementation = await DonationsV1.new(txParams);
  log(`Deployed first implementation at ${implementation.address}`);

  // Register the implementation in the current version of the app.
  log(`Registering implementation...`);
  await this.directory.setImplementation(contractName, implementation.address, txParams);
  log(`Registered implementation in current contract directory`);

  // Create a proxy that wraps the implementation, making it upgradeable.
  // At this point, the proxy's address is usable by any dapp, but can also be upgraded
  // without having to use a new address or losing the contract's storage.
  log(`Creating proxy for ${contractName}...`);
  const callData = encodeCall('initialize', ['address'], [owner]);
  const {receipt} = await this.appManager.createAndCall(contractName, callData, txParams);
  const logs = decodeLogs([receipt.logs[1]], UpgradeabilityProxyFactory, 0x0);
  const proxyAddress = logs.find(l => l.event === 'ProxyCreated').args.proxy;
  this.proxy = OwnedUpgradeabilityProxy.at(proxyAddress);
  log(`Proxy for ${contractName} created at ${proxyAddress}`);
}

async function deployVersion2() {

  log("\n<< Deploying version 2 >>");

  const versionName = '0.0.2';

  // const stdlib = {address ;"0xA739d10Cc20211B973dEE09DB8F0D75736E2D817"};
  this.stdlib = await ContractDirectory.new(txParams);
  const tokenImplementation = await MintableERC721Token.new();
  await this.stdlib.setImplementation(tokenClass, tokenImplementation.address, txParams);

  // Prepare a new version for the app that will hold the new implementation for the main contract.
  log(`Deploying new application directory...`);
  this.directory = await AppDirectory.new(this.stdlib.address, txParams);
  log(`Deployed application directory for new version ${versionName} at ${this.directory.address}`);

  // Deploy contract implementation.
  log(`Deploying new contract implementation...`);
  const implementation = await DonationsV2.new(txParams);
  log(`Deploying new implementation of ${contractName} at ${implementation.address}`);

  // Register the new implementation in the current version.
  log(`Registering new contract implementation...`);
  await this.directory.setImplementation(contractName, implementation.address, txParams);
  log(`Registered implementation in current contract directory`);

  // Create a new application version with the new directory and
  // update the app's version to it.
  log(`Adding new application version ${versionName}`);
  await this.package.addVersion(versionName, this.directory.address, txParams);
  log(`Setting the app's version to ${versionName}`);
  await this.appManager.setVersion(versionName, txParams);

  // Upgrade the proxy to the application's latest version.
  log(`Upgrading proxy for ${contractName}`);
  await this.appManager.upgradeTo(this.proxy.address, contractName, txParams);
  log(`Upgraded contract proxy for ${contractName} to latest app version ${versionName}`);

  // Add an ERC721 token implementation to the project.
  log(`Creating proxy for ERC721 token, for use in ${contractName}...`);
  const callData = encodeCall(
    'initialize',
    ['address', 'string', 'string'],
    [this.proxy.address, tokenName, tokenSymbol]
  );
  const {receipt} = await this.appManager.createAndCall(tokenClass, callData, txParams);
  const logs = decodeLogs([receipt.logs[1]], UpgradeabilityProxyFactory, 0x0);
  const proxyAddress = logs.find(l => l.event === 'ProxyCreated').args.proxy;
  this.tokenProxy = OwnedUpgradeabilityProxy.at(proxyAddress);
  log(`Token proxy created at ${proxyAddress}`);

  // Set the token in the new implementation.
  log(`Setting application's token...`);
  const donations = DonationsV2.at(this.proxy.address);
  await donations.setToken(proxyAddress, txParams);
  log(`Token set succesfully`);
}

module.exports = async function() {
  this.log = true;
  await setupAppManager();
  await deployVersion1Implementation();
  await deployVersion2();
};

module.exports.setupAppManager = setupAppManager;
module.exports.deployVersion1Implementation = deployVersion1Implementation;
module.exports.deployVersion2 = deployVersion2;
