import Contracts from '../utils/Contracts'

import Package from './Package'
import PackageDeployer from './PackageDeployer'
import PackageProvider from './PackageProvider'
import AppDirectoryDeployer from '../directory/AppDirectoryDeployer'

export default class PackageWithAppDirectories extends Package {

  static async fetch(address, txParams = {}) {
    const provider = new PackageProvider(txParams)
    return await provider.fetchForAppDirectories(address)
  }

  static async deploy(txParams = {}) {
    const deployer = new PackageDeployer(txParams)
    return await deployer.deployForAppDirectories()
  }

  async wrapImplementationDirectory(directoryAddress) {
    const AppDirectory = Contracts.getFromLib('AppDirectory');
    return new AppDirectory(directoryAddress)
  }

  async newDirectory(stdlibAddress) {
    const deployer = new AppDirectoryDeployer(this.txParams)
    return deployer.deploy(stdlibAddress)
  }
}
