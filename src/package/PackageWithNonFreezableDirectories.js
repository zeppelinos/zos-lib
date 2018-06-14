import Logger from '../utils/Logger'
import Contracts from '../utils/Contracts'

import Package from './Package'
import PackageDeployer from './PackageDeployer'
import PackageProvider from './PackageProvider'

const log = new Logger('Package')

export default class PackageWithNonFreezableDirectories extends Package {

  static async fetch(address, txParams = {}) {
    const provider = new PackageProvider(txParams)
    return await provider.fetch(address)
  }

  static async deploy(txParams = {}) {
    const deployer = new PackageDeployer(txParams)
    return await deployer.deploy()
  }

  async getImplementationDirectory(version) {
    const directoryAddress = await this.package.getVersion(version)
    const ImplementationDirectory = Contracts.getFromLib('ImplementationDirectory')
    return new ImplementationDirectory(directoryAddress)
  }

  async newVersion(version) {
    log.info('Adding new version...')
    const ImplementationDirectory = Contracts.getFromLib('ImplementationDirectory')
    const directory = await ImplementationDirectory.new(this.txParams)
    log.info(`App directory created at ${directory.address}`)
    await this.package.addVersion(version, directory.address, this.txParams)
    log.info(`Added version ${version}`)
    return directory
  }
}
