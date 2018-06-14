import Logger from '../utils/Logger'
import Contracts from '../utils/Contracts'

import Package from './Package'
import PackageDeployer from './PackageDeployer'
import PackageProvider from './PackageProvider'

const log = new Logger('Package')

export default class PackageWithFreezableDirectories extends Package {

  static async fetch(address, txParams = {}) {
    const provider = new PackageProvider(txParams)
    return await provider.fetchForFrezzableDirectories(address)
  }

  static async deploy(txParams = {}) {
    const deployer = new PackageDeployer(txParams)
    return await deployer.deployForFreezableDirectories()
  }

  async getImplementationDirectory(version) {
    const directoryAddress = await this.package.getVersion(version)
    const FreezableImplementationDirectory = Contracts.getFromLib('FreezableImplementationDirectory')
    return new FreezableImplementationDirectory(directoryAddress)
  }

  async newVersion(version) {
    log.info('Adding new version...')
    const FreezableImplementationDirectory = Contracts.getFromLib('FreezableImplementationDirectory')
    const directory = await FreezableImplementationDirectory.new(this.txParams)
    log.info(`App directory created at ${directory.address}`)
    await this.package.addVersion(version, directory.address, this.txParams)
    log.info(`Added version ${version}`)
    return directory
  }

  async isFrozen(version) {
    const directory = await this.getImplementationDirectory(version)
    return await directory.frozen()
  }

  async freeze(version) {
    log.info('Freezing new implementation directory...')
    const directory = await this.getImplementationDirectory(version)
    await directory.freeze(this.txParams)
    log.info('Implementation directory frozen')
  }
}
