import Logger from '../utils/Logger'
import Contracts from '../utils/Contracts'

const log = new Logger('ImplementationDirectoryDeployer')

export default class ImplementationDirectoryDeployer {
  static freezable(txParams = {}) {
    const contractClass = Contracts.getFromLib('FreezableImplementationDirectory')
    return new ImplementationDirectoryDeployer(contractClass, txParams)
  }

  static nonFreezable(txParams = {}) {
    const contractClass = Contracts.getFromLib('ImplementationDirectory')
    return new ImplementationDirectoryDeployer(contractClass, txParams)
  }

  constructor(contractClass, txParams = {}) {
    this.contractClass = contractClass
    this.txParams = txParams
  }

  async deployLocal(contracts) {
    await this.deployImplementationDirectory()
    const deployMethod = async contractName => this._deployLocalContract(contractName)
    await this.deployAndRegisterContracts(contracts, deployMethod)
    return this.directory
  }

  async deployDependency(dependencyName, contracts) {
    await this.deployImplementationDirectory()
    const deployMethod = async contractName => this._deployDependencyContract(dependencyName, contractName)
    await this.deployAndRegisterContracts(contracts, deployMethod)
    return this.directory
  }

  async deployImplementationDirectory() {
    log.info(`Deploying a new ${this.contractClass.contractName}...`)
    this.directory = await this.contractClass.new(this.txParams)
    log.info(`Deployed at ${this.directory.address}`)
  }

  async deployAndRegisterContracts(contracts, deployMethod) {
    await Promise.all(contracts.map(async contract => {
      const { alias: contractAlias, name: contractName } = contract
      const implementation = await deployMethod(contractName)
      log.info('Registering implementation in implementation directory...')
      await this.directory.setImplementation(contractAlias, implementation.address, this.txParams)
    }))
  }

  async _deployLocalContract(contractName) {
    const contractClass = Contracts.getFromLib(contractName)
    log.info(`Deploying new ${contractName}...`)
    const implementation = await contractClass.new()
    log.info(`Deployed ${contractName} ${implementation.address}`)
    return implementation
  }

  async _deployDependencyContract(dependencyName, contractName) {
    const contractClass = await Contracts.getFromNodeModules(dependencyName, contractName)
    log.info(`Deploying new ${contractName} from dependency ${dependencyName}...`)
    const implementation = await contractClass.new()
    log.info(`Deployed ${contractName} ${implementation.address}`)
    return implementation
  }
}
