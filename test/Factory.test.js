'use strict';

const abi = require('ethereumjs-abi')
const assertRevert = require('./helpers/assertRevert')
const Factory = artifacts.require('Factory')
const Registry = artifacts.require('Registry')
const InitializableMock = artifacts.require('InitializableMock')
const OwnedUpgradeabilityProxy = artifacts.require('OwnedUpgradeabilityProxy')

contract('Factory', ([_, owner, implementation_v0]) => {
  beforeEach(async function () {
    this.registry = await Registry.new()
    this.factory = await Factory.new(this.registry.address)
  })

  it('sets the correct registry', async function () {
    const registry = await this.factory.registry();
    assert.equal(registry, this.registry.address);
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
        await this.registry.addVersion(version, implementation_v0)
        const { logs } = await this.factory.createProxy(version, { from: owner })
        this.logs = logs
        this.proxyAddress = this.logs.find(l => l.event === 'ProxyCreated').args.proxy
        this.proxy = await OwnedUpgradeabilityProxy.at(this.proxyAddress)
      })

      it('upgrades that proxy to the requested version', async function () {
        const implementation = await this.proxy.implementation()
        assert.equal(implementation, implementation_v0)
      })

      it('emits an event', async function () {
        assert.equal(this.logs.length, 1)
        assert.equal(this.logs[0].event, 'ProxyCreated')
        assert.equal(this.logs[0].args.proxy, this.proxyAddress)
      })
    })
  })

  describe('createProxyAndCall', function () {
    const version = '0'
    const value = 42;
    const type = 'uint256';
    const methodId = abi.methodID('initialize', [type]).toString('hex')
    const params = abi.rawEncode([type], [value]).toString('hex');
    const initializeData = '0x' + methodId + params;

    beforeEach(async function () {
      this.behavior = await InitializableMock.new()
      await this.registry.addVersion(version, this.behavior.address)
      const { logs } = await this.factory.createProxyAndCall(version, initializeData, { from: owner })
      this.logs = logs
      this.proxyAddress = logs.find(l => l.event === 'ProxyCreated').args.proxy
      this.proxy = await OwnedUpgradeabilityProxy.at(this.proxyAddress)
    })

    it('upgrades that proxy to the requested version', async function () {
      const implementation = await this.proxy.implementation()
      assert.equal(implementation, this.behavior.address)
    })

    it('emits an event', async function () {
      assert.equal(this.logs.length, 1)
      assert.equal(this.logs[0].event, 'ProxyCreated')
      assert.equal(this.logs[0].args.proxy, this.proxyAddress)
    })

    it('calls "initialize" function', async function() {
      const initializable = InitializableMock.at(this.proxyAddress);
      const x = await initializable.x();
      assert.equal(x, 42);
    })
  })
})
