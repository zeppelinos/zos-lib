import Logger from '../utils/Logger'
import Contracts from '../utils/Contracts'

import Package from './Package'
import PackageDeployer from './PackageDeployer'
import PackageProvider from './PackageProvider'
import AppDirectoryDeployer from '../directory/AppDirectoryDeployer'

const log = new Logger('Package')

export default class PackageWithAppDirectories extends Package {

  static async fetch(address, txParams = {}) {
    const provider = new PackageProvider(txParams)
    return await provider.fetchForAppDirectories(address)
  }

  static async deploy(txParams = {}) {
    const deployer = new PackageDeployer(txParams)
    return await deployer.deployForAppDirectories()
  }

  async getImplementationDirectory(version) {
    const directoryAddress = await this.package.getVersion(version)
    const AppDirectory = Contracts.getFromLib('AppDirectory')
    return new AppDirectory(directoryAddress)
  }

  async newVersion(version, stdlibAddress) {
    log.info('Adding new version...')
    const deployer = new AppDirectoryDeployer(this.txParams)
    const directory = await deployer.deploy(stdlibAddress)
    await this.package.addVersion(version, directory.address, this.txParams)
    log.info(`Added version ${version}`)
    return directory
  }
}
