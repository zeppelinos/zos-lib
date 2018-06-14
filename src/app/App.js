'use strict'

import Logger from '../utils/Logger'
import Contracts from '../utils/Contracts'
import decodeLogs from '../helpers/decodeLogs'
import encodeCall from '../helpers/encodeCall'

import AppProvider from './AppProvider'
import AppDeployer from './AppDeployer'

const log = new Logger('App')

export default class App {

  static async fetch(address, txParams = {}) {
    const provider = new AppProvider(txParams)
    return await provider.from(address)
  }

  static async deploy(version, txParams = {}) {
    const deployer = new AppDeployer(txParams)
    return await deployer.deploy(version)
  }

  static async deployWithStdlib(version, stdlibAddress, txParams = {}) {
    const deployer = new AppDeployer(txParams)
    return await deployer.deployWithStdlib(version, stdlibAddress)
  }

  constructor(_app, factory, appDirectory, _package, version, txParams = {}) {
    this._app = _app
    this.factory = factory
    this.package = _package
    this.version = version
    this.directories = {}
    this.directories[version] = appDirectory
    this.txParams = txParams
  }

  get address() {
    return this._app.address
  }

  currentDirectory() {
    return this.directories[this.version]
  }

  async currentStdlib() {
    return this.currentDirectory().stdlib()
  }

  async getImplementation(contractName) {
    return this.package.getImplementation(this.version, contractName)
  }

  async getProxyImplementation(proxyAddress) {
    return this._app.getProxyImplementation(proxyAddress, this.txParams)
  }

  async setImplementation(contractClass, contractName) {
    return this.package.setImplementation(this.version, contractClass, contractName)
  }

  async setStdlib(stdlibAddress = 0x0) {
    return this.currentDirectory().setStdlib(stdlibAddress)
  }

  async newVersion(version, stdlibAddress = 0x0) {
    const directory = await this.package.newVersion(version, stdlibAddress)
    await this._app.setVersion(version, this.txParams)
    log.info(`Version set`)
    this.directories[version] = directory
    this.version = version
  }

  async createProxy(contractClass, contractName, initMethodName, initArgs) {
    if (!contractName) contractName = contractClass.contractName;
    const { receipt } = typeof(initArgs) === 'undefined'
      ? await this._createProxy(contractName)
      : await this._createProxyAndCall(contractClass, contractName, initMethodName, initArgs)

    log.info(`TX receipt received: ${receipt.transactionHash}`)
    const UpgradeabilityProxyFactory = Contracts.getFromLib('UpgradeabilityProxyFactory')
    const logs = decodeLogs(receipt.logs, UpgradeabilityProxyFactory)
    const address = logs.find(l => l.event === 'ProxyCreated').args.proxy
    log.info(`${contractName} proxy: ${address}`)
    return new contractClass(address)
  }

  async upgradeProxy(proxyAddress, contractClass, contractName, initMethodName, initArgs) {
    if (!contractName) contractName = contractClass.contractName;
    const { receipt } = typeof(initArgs) === 'undefined'
      ? await this._upgradeProxy(proxyAddress, contractName)
      : await this._upgradeProxyAndCall(proxyAddress, contractClass, contractName, initMethodName, initArgs)
    log.info(`TX receipt received: ${receipt.transactionHash}`)
  }

  async _createProxy(contractName) {
    log.info(`Creating ${contractName} proxy without initializing...`)
    return this._app.create(contractName, this.txParams)
  }

  async _createProxyAndCall(contractClass, contractName, initMethodName, initArgs) {    
    const initMethod = this._validateInitMethod(contractClass, initMethodName, initArgs)
    const initArgTypes = initMethod.inputs.map(input => input.type)
    log.info(`Creating ${contractName} proxy and calling ${this._callInfo(initMethod, initArgs)}...`)
    const callData = encodeCall(initMethodName, initArgTypes, initArgs)
    return this._app.createAndCall(contractName, callData, this.txParams)
  }

  async _upgradeProxy(proxyAddress, contractName) {
    log.info(`Upgrading ${contractName} proxy without running migrations...`)
    return this._app.upgrade(proxyAddress, contractName, this.txParams)
  }

  async _upgradeProxyAndCall(proxyAddress, contractClass, contractName, initMethodName, initArgs) {
    const initMethod = this._validateInitMethod(contractClass, initMethodName, initArgs)
    const initArgTypes = initMethod.inputs.map(input => input.type)
    log.info(`Upgrading ${contractName} proxy and calling ${this._callInfo(initMethod, initArgs)}...`)
    const callData = encodeCall(initMethodName, initArgTypes, initArgs)
    return this._app.upgradeAndCall(proxyAddress, contractName, callData, this.txParams)
  }

  _validateInitMethod(contractClass, initMethodName, initArgs) {
    const initMethod = contractClass.abi.find(fn => fn.name === initMethodName && fn.inputs.length === initArgs.length)
    if (!initMethod) throw `Could not find initialize method '${initMethodName}' with ${initArgs.length} arguments in contract class`
    return initMethod
  }

  _callInfo(initMethod, initArgs) {
    return `${initMethod.name}(${initMethod.inputs.map(i => i.type).join(',')}) with ${JSON.stringify(initArgs).replace(/^\[|\]$/g, "")}`;
  }
}
