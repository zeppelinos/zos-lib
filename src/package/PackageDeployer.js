import Logger from '../utils/Logger'
import Contracts from '../utils/Contracts'
import PackageWithAppDirectories from './PackageWithAppDirectories'
import PackageWithFreezableDirectories from './PackageWithFreezableDirectories'
import PackageWithNonFreezableDirectories from './PackageWithNonFreezableDirectories'

const log = new Logger('PackageDeployer')

export default class PackageDeployer {
  constructor(txParams = {}) {
    this.txParams = txParams
  }

  async deploy() {
    await this._createPackage()
    return new PackageWithNonFreezableDirectories(this.package, this.txParams)
  }

  async deployForFreezableDirectories() {
    await this._createPackage()
    return new PackageWithFreezableDirectories(this.package, this.txParams)
  }

  async deployForAppDirectories() {
    await this._createPackage()
    return new PackageWithAppDirectories(this.package, this.txParams)
  }

  async _createPackage() {
    log.info('Deploying new Package...')
    const Package = Contracts.getFromLib('Package')
    this.package = await Package.new(this.txParams)
    log.info(`Deployed Package ${this.package.address}`)
  }
}
