import Package from './Package'
import Contracts from '../utils/Contracts'
import PackageWithAppDirectories from './PackageWithAppDirectories'
import PackageWithFreezableDirectories from './PackageWithFreezableDirectories'
import PackageWithNonFreezableDirectories from './PackageWithNonFreezableDirectories'

export default class PackageProvider {
  constructor(txParams = {}) {
    this.txParams = txParams
  }

  fetch(address) {
    this._fetchPackage(address);
    return new PackageWithNonFreezableDirectories(this.package, this.txParams)
  }

  fetchForFrezzableDirectories(address) {
    this._fetchPackage(address);
    return new PackageWithFreezableDirectories(this.package, this.txParams)
  }

  fetchForAppDirectories(address) {
    this._fetchPackage(address);
    return new PackageWithAppDirectories(this.package, this.txParams)
  }

  _fetchPackage(address) {
    const Package = Contracts.getFromLib('Package')
    this.package = new Package(address)
  }
}
