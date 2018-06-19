import Logger from '../utils/Logger'
import Contracts from '../utils/Contracts'

import Package from './Package'
import PackageDeployer from './PackageDeployer'
import PackageProvider from './PackageProvider'
import ImplementationDirectoryDeployer from '../directory/ImplementationDirectoryDeployer'

const log = new Logger('Package')

export default class PackageWithFreezableDirectories extends Package {

  static fetch(address, txParams = {}) {
    const provider = new PackageProvider(txParams)
    return provider.fetchForFreezableDirectories(address)
  }

  static async deploy(txParams = {}) {
    const deployer = new PackageDeployer(txParams)
    return await deployer.deployForFreezableDirectories()
  }

  async wrapImplementationDirectory(directoryAddress) {
    const FreezableImplementationDirectory = Contracts.getFromLib('FreezableImplementationDirectory');
    return new FreezableImplementationDirectory(directoryAddress)
  }

  async newDirectory() {
    return ImplementationDirectoryDeployer.freezable(this.txParams).deployLocal()
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
