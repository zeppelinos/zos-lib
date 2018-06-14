'use strict'
require('../../setup')

import Contracts from '../../../src/utils/Contracts'
import PackageWithAppDirectories from '../../../src/package/PackageWithAppDirectories'

const DummyImplementation = Contracts.getFromLocal('DummyImplementation')

contract('PackageWithAppDirectories', function ([_, owner]) {
  const txParams = { from: owner }
  const contractName = 'DummyImplementation'
  const version = "1.0"

  const shouldInitialize = function () {
    it('instantiates the package', async function() {
      this.package.address().should.not.be.null
    })
  }

  beforeEach('deploying package with app directories', async function () {
    this.package = await PackageWithAppDirectories.deploy(txParams)
  })

  describe('deploy', function () {
    shouldInitialize()
  })

  describe('fetch', function () {
    beforeEach("connecting to existing instance", async function () {
      this.package = await PackageWithAppDirectories.fetch(this.package.address(), txParams)
    })

    shouldInitialize()
  })

  const addNewVersion = async function () {
    await this.package.newVersion(version)
  }

  describe('newVersion', function () {
    beforeEach('adding a new version', addNewVersion)

    it('registers new version on package', async function () {
      const hasVersion = await this.package.hasVersion(version)
      hasVersion.should.be.true
    })
  })

  describe('get and set implementation', function () {
    beforeEach('adding a new version', addNewVersion)

    it('allows to register new implementations', async function() {
      const newImplementation = await this.package.setImplementation(version, DummyImplementation, contractName)

      const implementation = await this.package.getImplementation(version, contractName)
      implementation.should.eq(newImplementation.address)
    })

    it('allows to register the same implementations twice', async function() {
      await this.package.setImplementation(version, DummyImplementation, contractName)
      const newImplementation = await this.package.setImplementation(version, DummyImplementation, contractName)

      const implementation = await this.package.getImplementation(version, contractName)
      implementation.should.eq(newImplementation.address)
    })
  })
})
