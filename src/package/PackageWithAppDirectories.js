import Contracts from '../utils/Contracts'

import Package from './Package'
import AppDirectoryDeployer from '../directory/AppDirectoryDeployer'

export default class PackageWithAppDirectories extends Package {
  async wrapImplementationDirectory(directoryAddress) {
    const AppDirectory = Contracts.getFromLib('AppDirectory');
    return new AppDirectory(directoryAddress)
  }

  async newDirectory(stdlibAddress) {
    const deployer = new AppDirectoryDeployer(this.txParams)
    return deployer.deploy(stdlibAddress)
  }
}
