import Package from './Package'
import AppDirectory from '../directory/AppDirectory'

export default class PackageWithAppDirectories extends Package {
  wrapImplementationDirectory(directoryAddress) {
    return AppDirectory.fetch(directoryAddress, this.txParams)
  }

  async newDirectory() {
    return AppDirectory.deploy(this.txParams)
  }
}
