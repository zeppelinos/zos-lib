'use strict'
require('../../setup')

import Contracts from '../../../src/utils/Contracts'
import assertRevert from '../../../src/test/helpers/assertRevert'
import PackageWithFreezableDirectories from '../../../src/package/PackageWithFreezableDirectories'

const DummyImplementation = Contracts.getFromLocal('DummyImplementation')

contract('PackageWithFreezableDirectories', function ([_, owner]) {
  const txParams = { from: owner }
  const contractName = 'DummyImplementation'
  const version = "1.0"

  const shouldInitialize = function () {
    it('instantiates the package', async function() {
      this.package.address.should.not.be.null
    })
  }

  beforeEach('deploying package with freezable directories', async function () {
    this.package = await PackageWithFreezableDirectories.deploy(txParams)
  })

  describe('deploy', function () {
    shouldInitialize()
  })

  describe('fetch', function () {
    beforeEach("connecting to existing instance", async function () {
      this.package = await PackageWithFreezableDirectories.fetch(this.package.address, txParams)
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

  describe('freeze', function() {
    beforeEach('adding a new version', addNewVersion)

    it('should not be frozen by default', async function () {
      const frozen = await this.package.isFrozen(version)
      frozen.should.be.false
    })

    it('should be freezable', async function () {
      await this.package.freeze(version)
      const frozen = await this.package.isFrozen(version)
      frozen.should.be.true
    })
  })

  describe('get and set implementation', function () {
    beforeEach('adding a new version', addNewVersion)

    describe('when current version is not frozen', async function() {

      it('allows to register new implementations', async function() {
        const newImplementation = await this.package.setImplementation(version, DummyImplementation, contractName)

        const implementation = await this.package.getImplementation(version, contractName)
        implementation.should.eq(newImplementation.address)
      })
    })

    describe('when current version is frozen', async function() {
      beforeEach('freezing', async function() {
        await this.package.freeze(version)
      })

      it('does not allow to register new implementations', async function() {
        await assertRevert(this.package.setImplementation(version, DummyImplementation, contractName))
      })
    })
  })
})
