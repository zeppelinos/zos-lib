global.artifacts = artifacts;
global.ContractsProvider = require('zos-lib/src/utils/ContractsProvider').default;
const network = process.argv[5];

const ContractDirectory = artifacts.require('ContractDirectory');
const MintableERC721Token = artifacts.require('MintableERC721Token');
const { decodeLogs, Logger, AppManagerDeployer, ContractsProvider } = require('zos-lib')
const log = new Logger('ComplexExample')

const owner = web3.eth.accounts[1];
const contractName = "Donations";
const tokenClass = 'MintableERC721Token';
const txParams = {
  from: owner,
  gas: 6721975,
  gasPrice: 100000000000
};

async function setupAppManager() {

  // On-chain, single entry point of the entire application.
  log.info("<< Setting up AppManager >>")
  const initialVersion = '0.0.1'
  this.appManager = await AppManagerDeployer.call(initialVersion, txParams)

}

async function deployVersion1() {

  // Register the first implementation of "Basil", and request a proxy for it.
  log.info("<< Deploying version 1 >>")
  const DonationsV1 = ContractsProvider.getByName('DonationsV1')
  await this.appManager.setImplementation(DonationsV1, contractName);
  this.donations = await this.appManager.createProxy(DonationsV1, contractName, 'initialize', [owner])

}

async function deployVersion2() {

  // Create a new version of the app, liked to the zeppelin_os standard library.
  // Register a new implementation for "Basil" and upgrade it's proxy to use the new implementation.
  log.info("<< Deploying version 2 >>")
  const secondVersion = '0.0.2'
  await this.appManager.newVersion(secondVersion, await getStdLib())
  const DonationsV2 = ContractsProvider.getByName('DonationsV2')
  await this.appManager.setImplementation(DonationsV2, contractName);
  await this.appManager.upgradeProxy(this.donations.address, null, contractName)

  // Add an ERC721 token implementation to the project, request a proxy for it,
  // and set the token on "Basil".
  log.info(`Creating ERC721 token proxy to use in ${contractName}...`)
  this.token = await this.appManager.createProxy(
    MintableERC721Token, 
    tokenClass,
    'initialize'
    [this.donations.address, 'BasilToken', 'BSL']
  )
  log.info(`Token proxy created at ${this.token.address}`)
  log.info("Setting application's token...")
  this.donations = DonationsV2.at(this.donations.address);
  await this.donations.setToken(this.token.address, txParams)
  log.info("Token set succesfully")

}

async function getStdLib() {

  // Use deployed standard library, or simulate one in local networks.
  if(!network || network === 'development') {
    const stdlib = await ContractDirectory.new(txParams);
    const tokenImplementation = await MintableERC721Token.new();
    await stdlib.setImplementation(tokenClass, tokenImplementation.address, txParams);
    return stdlib.address;
  }
  else if(network === 'ropsten') return "0xA739d10Cc20211B973dEE09DB8F0D75736E2D817";

}

module.exports = async function() {
  await setupAppManager();
  await deployVersion1();
  await deployVersion2();
};

// Used in tests:
module.exports.setupAppManager = setupAppManager;
module.exports.deployVersion1 = deployVersion1;
module.exports.deployVersion2 = deployVersion2;
