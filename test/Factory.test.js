'use strict';

const Registry = artifacts.require('Registry')
const Factory = artifacts.require('Factory')
const OwnedUpgradeabilityProxy = artifacts.require('OwnedUpgradeabilityProxy')
const assertRevert = require('./helpers/assertRevert')

contract('Factory', ([_, owner, implementation]) => {
  beforeEach(async function () {
    this.registry = await Registry.new()
    this.factory = await Factory.new(this.registry.address)
  })

  describe('createProxy', function () {
    const version = '0'

    describe('when the requested version was not registered', function () {
      it('reverts', async function () {
        await assertRevert(this.factory.createProxy(version, { from: owner }))
      })
    })

    describe('when the requested version was already registered', function () {
      beforeEach(async function () {
        await this.registry.addVersion(version, implementation)
        const { logs } = await this.factory.createProxy(version, { from: owner })
        this.logs = logs
        this.proxyAddress = this.logs.find(l => l.event === 'ProxyCreated').args.proxy
        this.proxy = await OwnedUpgradeabilityProxy.at(this.proxyAddress)
      })

      it('creates a proxy with the given registry', async function () {
        const registry = await this.proxy.registry()
        const factoryRegistry = await this.factory.registry()
        assert.equal(registry, factoryRegistry)
      })

      it('upgrades that proxy to the requested version', async function () {
        const version = await this.proxy.version()
        assert.equal(version, '0')

        const implementation = await this.proxy.implementation()
        assert.equal(implementation, implementation)
      })

      it('emits an event', async function () {
        assert.equal(this.logs.length, 1)

        assert.equal(this.logs[0].event, 'ProxyCreated')
        assert.equal(this.logs[0].args.proxy, this.proxyAddress)
      })
    })
  })
})
