import Contracts from '../utils/Contracts'

import Package from './Package'
import PackageDeployer from './PackageDeployer'
import PackageProvider from './PackageProvider'
import ImplementationDirectoryDeployer from "../directory/ImplementationDirectoryDeployer";

export default class PackageWithNonFreezableDirectories extends Package {

  static fetch(address, txParams = {}) {
    const provider = new PackageProvider(txParams)
    return provider.fetch(address)
  }

  static async deploy(txParams = {}) {
    const deployer = new PackageDeployer(txParams)
    return await deployer.deploy()
  }

  async wrapImplementationDirectory(directoryAddress) {
    const ImplementationDirectory = Contracts.getFromLib('ImplementationDirectory');
    return new ImplementationDirectory(directoryAddress)
  }

  async newDirectory() {
    return ImplementationDirectoryDeployer.nonFreezable(this.txParams).deployLocal()
  }
}
