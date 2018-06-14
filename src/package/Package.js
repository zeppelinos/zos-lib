import Logger from '../utils/Logger'

const log = new Logger('Package')

export default class Package {

  constructor(_package, txParams = {}) {
    this.package = _package
    this.txParams = txParams
  }

  address() {
    return this.package.address
  }

  async hasVersion(version) {
    return this.package.hasVersion(version, this.txParams)
  }

  async getImplementation(version, contractName) {
    const implementationDirectory = await this.getImplementationDirectory(version)
    return implementationDirectory.getImplementation(contractName)
  }

  async setImplementation(version, contractClass, contractName) {
    log.info(`Setting implementation of ${contractName} in version ${version}...`)
    const implementation = await contractClass.new(this.txParams)
    const directory = await this.getImplementationDirectory(version)
    await directory.setImplementation(contractName, implementation.address, this.txParams)
    log.info(`Implementation set ${implementation.address}`)
    return implementation
  }

  async getImplementationDirectory() {
    throw Error('Cannot call abstract method')
  }

  async newVersion() {
    throw Error('Cannot call abstract method')
  }
}
