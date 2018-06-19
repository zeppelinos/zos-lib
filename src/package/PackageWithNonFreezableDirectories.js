import Contracts from '../utils/Contracts'

import Package from './Package'
import ImplementationDirectoryDeployer from "../directory/ImplementationDirectoryDeployer";

export default class PackageWithNonFreezableDirectories extends Package {

  async wrapImplementationDirectory(directoryAddress) {
    const ImplementationDirectory = Contracts.getFromLib('ImplementationDirectory');
    return new ImplementationDirectory(directoryAddress)
  }

  async newDirectory() {
    return ImplementationDirectoryDeployer.nonFreezable(this.txParams).deployLocal()
  }
}
