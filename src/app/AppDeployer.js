'use strict';

import Logger from '../utils/Logger'
import Contracts from '../utils/Contracts'
import App from './App'
import PackageDeployer from "../package/PackageDeployer";
import AppDirectoryDeployer from "../directory/AppDirectoryDeployer";

const log = new Logger('AppDeployer')

export default class AppDeployer {
  constructor(txParams = {}) {
    this.txParams = txParams
  }

  async deploy(version) {
    return this.deployWithStdlib(version, 0x0)
  }

  async deployWithStdlib(version, stdlibAddress) {
    await this.createFactory()
    await this.createPackage()
    await this.addVersion(version, stdlibAddress)
    await this.createApp(version)
    return new App(this.packagedApp, this.factory, this.appDirectory, this.package, this.version, this.txParams)
  }

  async createApp(version) {
    log.info('Deploying new PackagedApp...')
    const PackagedApp = Contracts.getFromLib('PackagedApp')
    this.packagedApp = await PackagedApp.new(this.package.address, version, this.factory.address, this.txParams)
    log.info(`Deployed PackagedApp ${this.packagedApp.address}`)
  }

  async createFactory() {
    log.info('Deploying new UpgradeabilityProxyFactory...')
    const UpgradeabilityProxyFactory = Contracts.getFromLib('UpgradeabilityProxyFactory')
    this.factory = await UpgradeabilityProxyFactory.new(this.txParams)
    log.info(`Deployed UpgradeabilityProxyFactory ${this.factory.address}`)
  }

  async createPackage() {
    const deployer = new PackageDeployer(this.txParams);
    this.package = await deployer.deployForAppDirectories()
  }

  async addVersion(version, stdlibAddress) {
    this.version = version
    this.appDirectory = await this.package.newVersion(version, stdlibAddress)
  }
}
