'use strict';

import Logger from '../utils/Logger'
import { sendTransaction } from '../utils/Transactions'

import AppDirectoryDeployer from './AppDirectoryDeployer'
import ImplementationDirectory from './ImplementationDirectory'
import AppDirectoryProvider from './AppDirectoryProvider'

export default class AppDirectory extends ImplementationDirectory {

  static fetch(address, txParams = {}) {
    const provider = new AppDirectoryProvider(txParams)
    return provider.fetch(address)
  }

  static async deploy(txParams = {}) {
    const deployer = new AppDirectoryDeployer(txParams)
    return deployer.deploy()
  }

  constructor(directory, txParams = {}) {
    const log = new Logger('AppDirectory');
    super(directory, txParams, log)
  }

  async getPackageImplementation(packageName, contractName) {
    return await this.directory.getPackageImplementation(packageName, contractName, this.txParams)
  }

  async setDependency(name, dependencyAddress) {
    this.log.info(`Setting dependency ${name} to ${dependencyAddress}...`)
    await sendTransaction(this.directory.setDependency, [name, dependencyAddress], this.txParams)
    this.log.info(`Dependency ${name} set to ${dependencyAddress}`)
    return dependencyAddress
  }

  async unsetDependency(name) {
    this.log.info(`Removing dependency ${name}...`)
    await sendTransaction(this.directory.unsetDependency, [name], this.txParams)
    this.log.info(`Dependency ${name} was removed`)
  }

  async getDependency(name) {
    return this.directory.getDependency(name);
  }
}
