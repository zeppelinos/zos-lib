import Logger from '../utils/Logger'

const log = new Logger('Package')

export default class Package {

  constructor(_package, txParams = {}) {
    this.package = _package
    this.txParams = txParams
  }

  get address() {
    return this.package.address
  }

  async hasVersion(version) {
    return this.package.hasVersion(version, this.txParams)
  }

  async getImplementation(version, contractName) {
    return this.package.getImplementation(version, contractName)
  }

  async setImplementation(version, contractClass, contractName) {
    log.info(`Setting implementation of ${contractName} in version ${version}...`)
    const implementation = await contractClass.new(this.txParams)
    const directory = await this.getImplementationDirectory(version)
    await directory.setImplementation(contractName, implementation.address, this.txParams)
    log.info(`Implementation set ${implementation.address}`)
    return implementation
  }

  async newVersion(version, stdlibAddress) {
    log.info('Adding new version...')
    const directory = await this.newDirectory(stdlibAddress)
    await this.package.addVersion(version, directory.address, this.txParams)
    log.info(`Added version ${version}`)
    return directory
  }

  async getImplementationDirectory(version) {
    const directoryAddress = await this.package.getVersion(version)
    return this.wrapImplementationDirectory(directoryAddress)
  }

  async wrapImplementationDirectory() {
    throw Error('Cannot call abstract method wrapImplementationDirectory()')
  }

  async newDirectory() {
    throw Error('Cannot call abstract method newDirectory()')
  }
}
