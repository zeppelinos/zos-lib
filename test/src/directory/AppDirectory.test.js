'use strict'
require('../../setup')

import Contracts from '../../../src/utils/Contracts'
import AppDirectory from '../../../src/directory/AppDirectory'

const DummyImplementation = Contracts.getFromLocal('DummyImplementation')
const ImplementationDirectory = Contracts.getFromLocal('ImplementationDirectory')

contract('AppDirectory', ([_, appOwner, depOwner, anotherAddress]) => {
  const txParams = { from: appOwner }

  beforeEach('deploying app directory', async function () {
    this.directory = await AppDirectory.deploy(txParams)
  })

  it('has an address', async function () {
    (await this.directory.address).should.not.be.null
  })

  it('has an owner', async function () {
    (await this.directory.owner()).should.be.equal(appOwner)
  })

  it('can set new implementations', async function () {
    const implementation = await DummyImplementation.new()
    await this.directory.setImplementation('DummyImplementation', implementation.address)

    const currentImplementation = await this.directory.getImplementation('DummyImplementation')
    currentImplementation.should.be.eq(implementation.address)
  })

  it('can unset implementations', async function () {
    const implementation = await DummyImplementation.new()
    await this.directory.setImplementation('DummyImplementation', implementation.address)
    await this.directory.unsetImplementation('DummyImplementation')

    const currentImplementation = await this.directory.getImplementation('DummyImplementation')
    currentImplementation.should.be.zeroAddress
  })

  describe('with dependencies', function () {
    beforeEach('setting dependency', async function () {
      this.dependency = await ImplementationDirectory.new({ from: depOwner })
      await this.directory.setDependency("MyDependency", this.dependency.address)
    })

    it('gets a dependency by name', async function () {
      (await this.directory.getDependency("MyDependency")).should.eq(this.dependency.address);
    })
  
    it('can retrieve an implementation from a dependency', async function () {
      const implementation = await DummyImplementation.new();
      await this.dependency.setImplementation('DummyImplementation', implementation.address, { from: depOwner });
  
      const implementationFromApp = await this.directory.getImplementation('DummyImplementation');
      implementationFromApp.should.be.zeroAddress;
      
      const implementationFromPackage = await this.directory.getPackageImplementation('MyDependency', 'DummyImplementation');
      implementationFromPackage.should.eq(implementation.address);
    })
  })  
})
