'use strict'

const encodeCall = require('./helpers/encodeCall')
const decodeLogs = require('./helpers/decodeLogs')
const assertRevert = require('./helpers/assertRevert')
const shouldBehaveLikeOwnable = require('./ownership/Ownable.behavior')
const Registry = artifacts.require('Registry')
const ProjectController = artifacts.require('ProjectController')
const InitializableMock = artifacts.require('InitializableMock')
const OwnedUpgradeabilityProxy = artifacts.require('OwnedUpgradeabilityProxy')
const ImplementationProviderMock = artifacts.require('ImplementationProviderMock')
const UpgradeabilityProxyFactory = artifacts.require('UpgradeabilityProxyFactory')

contract('ProjectController', ([_, controllerOwner, registryOwner, anAddress, anotherAccount, implementation_v0, implementation_v1]) => {
  const version_0 = 'version_0'
  const version_1 = 'version_1'
  const contractName = 'ERC721'

  beforeEach(async function () {
    this.registry = await Registry.new({ from: registryOwner })
    this.factory = await UpgradeabilityProxyFactory.new()
    this.implementationsProvider = await ImplementationProviderMock.new(anAddress)
    this.controller = await ProjectController.new(this.registry.address, this.factory.address, 0x0, { from: controllerOwner })
    this.controllerWithProvider = await ProjectController.new(this.registry.address, this.factory.address, this.implementationsProvider.address, { from: controllerOwner })
  })

  describe('ownership', function () {
    beforeEach(function () {
      this.ownable = this.controller
    })

    shouldBehaveLikeOwnable(controllerOwner, anotherAccount)
  })

  it('must receive a registry and a factory', async function () {
    await assertRevert(ProjectController.new(0x0, this.factory.address, this.implementationsProvider.address))
    await assertRevert(ProjectController.new(this.registry.address, 0x0, this.implementationsProvider.address))
  })

  describe('owner', function () {
    it('sets the creator as the owner of the controller', async function () {
      const owner = await this.controller.owner()
      assert.equal(controllerOwner, owner)
    })
  })

  describe('factory', function () {
    it('returns the proxy factory being used by the controller', async function () {
      const factory = await this.controller.factory()

      assert.equal(factory, this.factory.address)
    })
  })

  describe('registry', function () {
    it('returns the registry being used by the controller', async function () {
      const registry = await this.controller.registry()

      assert.equal(registry, this.registry.address)
    })
  })

  describe('implementationsProvider', function () {
    it('returns the fallback implementations provider being used by the controller', async function () {
      const implementationsProvider = await this.controllerWithProvider.implementationsProvider()

      assert.equal(implementationsProvider, this.implementationsProvider.address)
    })
  })

  describe('create', function () {
    describe('when the given version was registered', function () {
      beforeEach(async function () {
        await this.registry.addImplementation(version_0, contractName, implementation_v0, { from: registryOwner })

        const { receipt } = await this.controller.create(version_0, contractName)
        this.logs = decodeLogs([receipt.logs[0]], UpgradeabilityProxyFactory, this.factory.address);
        this.proxyAddress = this.logs.find(l => l.event === 'ProxyCreated').args.proxy
        this.proxy = await OwnedUpgradeabilityProxy.at(this.proxyAddress)
      })

      it('creates a proxy pointing to the requested implementation', async function () {
        const implementation = await this.proxy.implementation()
        assert.equal(implementation, implementation_v0)
      })

      it('transfers the ownership to the controller', async function () {
        const proxyOwner = await this.proxy.proxyOwner()
        assert.equal(proxyOwner, this.controller.address)
      })
    })

    describe('when the given version was not registered', function () {
      it('reverts', async function () {
        await assertRevert(this.controller.create(version_0, contractName))
      })
    })
  })

  describe('createAndCall', function () {
    const value = 1e5
    const initializeData = encodeCall('initialize', ['uint256'], [42])

    beforeEach(async function () {
      this.behavior = await InitializableMock.new()
    })

    describe('when the given version was registered', function () {
      beforeEach(async function () {
        await this.registry.addImplementation(version_0, contractName, this.behavior.address, { from: registryOwner })

        const { receipt } = await this.controller.createAndCall(version_0, contractName, initializeData, { value })
        this.logs = decodeLogs([receipt.logs[0]], UpgradeabilityProxyFactory, this.factory.address);
        this.proxyAddress = this.logs.find(l => l.event === 'ProxyCreated').args.proxy
        this.proxy = await OwnedUpgradeabilityProxy.at(this.proxyAddress)
      })

      it('creates a proxy pointing to the requested implementation', async function () {
        const implementation = await this.proxy.implementation()
        assert.equal(implementation, this.behavior.address)
      })

      it('transfers the ownership to the controller', async function () {
        const proxyOwner = await this.proxy.proxyOwner()
        assert.equal(proxyOwner, this.controller.address)
      })

      it('calls "initialize" function', async function() {
        const initializable = InitializableMock.at(this.proxyAddress);
        const x = await initializable.x();
        assert.equal(x, 42);
      })

      it('sends given value to the delegated implementation', async function() {
        const balance = await web3.eth.getBalance(this.proxyAddress)
        assert(balance.eq(value))
      })

      it('uses the storage of the proxy', async function () {
        // fetch the x value of Initializable at position 0 of the storage
        const storedValue = await web3.eth.getStorageAt(this.proxyAddress, 1);
        assert.equal(storedValue, 42);
      })
    })

    describe('when the given version was not registered', function () {
      it('reverts', async function () {
        await assertRevert(this.controller.createAndCall(version_0, contractName, initializeData, { value }))
      })
    })
  })

  describe('upgradeTo', function () {
    beforeEach(async function () {
      await this.registry.addImplementation(version_0, contractName, implementation_v0, { from: registryOwner })
      const { receipt } = await this.controller.create(version_0, contractName)
      this.logs = decodeLogs([receipt.logs[0]], UpgradeabilityProxyFactory, this.factory.address);
      this.proxyAddress = this.logs.find(l => l.event === 'ProxyCreated').args.proxy
      this.proxy = await OwnedUpgradeabilityProxy.at(this.proxyAddress)
    })

    describe('when the sender is the controller owner', function () {
      const from = controllerOwner

      describe('when the given version was registered', function () {
        beforeEach(async function () {
          await this.registry.addImplementation(version_1, contractName, implementation_v1, { from: registryOwner })
        })

        it('upgrades to the requested implementation', async function () {
          await this.controller.upgradeTo(this.proxyAddress, version_1, contractName, { from })

          const implementation = await this.proxy.implementation()
          assert.equal(implementation, implementation_v1)
        })
      })

      describe('when the given version was not registered', function () {
        it('reverts', async function () {
          await assertRevert(this.controller.upgradeTo(this.proxyAddress, version_1, contractName, { from }))
        })
      })
    })

    describe('when the sender is not the controller owner', function () {
      const from = anotherAccount

      it('reverts', async function () {
        await this.registry.addImplementation(version_1, contractName, implementation_v1, { from: registryOwner })
        await assertRevert(this.controller.upgradeTo(this.proxyAddress, version_1, contractName, { from }))
      })
    })
  })

  describe('upgradeToAndCall', function () {
    const initializeData = encodeCall('initialize', ['uint256'], [42])

    beforeEach(async function () {
      await this.registry.addImplementation(version_0, contractName, implementation_v0, { from: registryOwner })
      const { receipt } = await this.controller.create(version_0, contractName)
      this.logs = decodeLogs([receipt.logs[0]], UpgradeabilityProxyFactory, this.factory.address);
      this.proxyAddress = this.logs.find(l => l.event === 'ProxyCreated').args.proxy
      this.proxy = await OwnedUpgradeabilityProxy.at(this.proxyAddress)
      this.behavior = await InitializableMock.new()
    })

    describe('when the sender is the controller owner', function () {
      const from = controllerOwner
      const value = 1e5

      describe('when the given version was registered', function () {
        beforeEach(async function () {
          await this.registry.addImplementation(version_1, contractName, this.behavior.address, { from: registryOwner })
          await this.controller.upgradeToAndCall(this.proxyAddress, version_1, contractName, initializeData, { from, value })
        })

        it('upgrades to the requested implementation', async function () {
          const implementation = await this.proxy.implementation()
          assert.equal(implementation, this.behavior.address)
        })

        it('calls the "initialize" function', async function() {
          const initializable = InitializableMock.at(this.proxyAddress)
          const x = await initializable.x()
          assert.equal(x, 42)
        })

        it('sends given value to the delegated implementation', async function() {
          const balance = await web3.eth.getBalance(this.proxyAddress)
          assert(balance.eq(value))
        })

        it('uses the storage of the proxy', async function () {
          // fetch the x value of Initializable at position 0 of the storage
          const storedValue = await web3.eth.getStorageAt(this.proxyAddress, 1);
          assert.equal(storedValue, 42);
        })
      })

      describe('when the given version was not registered', function () {
        it('reverts', async function () {
          await assertRevert(this.controller.upgradeToAndCall(this.proxyAddress, version_1, contractName, initializeData, { from, value }))
        })
      })
    })

    describe('when the sender is not the controller owner', function () {
      const from = anotherAccount

      it('reverts', async function () {
        await this.registry.addImplementation(version_1, contractName, this.behavior.address, { from: registryOwner })
        await assertRevert(this.controller.upgradeToAndCall(this.proxyAddress, version_1, contractName, initializeData, { from }))
      })
    })
  })

  describe('getImplementation', function () {

    describe('when the requested contract name and version is registered in the project registry', function () {
      beforeEach(async function () {
        await this.registry.addImplementation(version_0, contractName, implementation_v0, { from: registryOwner })
      })

      it('fetches the requested implementation from the registry', async function () {
        const implementation = await this.controller.getImplementation(version_0, contractName)
        assert.equal(implementation, implementation_v0);
      })
    })

    describe('when the requested contract name and version is not registered in the project registry', function () {
      describe('when there is an fallback implementations provider', function () {
        it('fetches the requested implementation from the fallback implementations provider', async function () {
          const fallbackProviderImplementation = await this.implementationsProvider.implementation()
          const implementation = await this.controllerWithProvider.getImplementation(version_0, contractName)
          assert.equal(implementation, fallbackProviderImplementation);
        })
      })

      describe('when there is no fallback implementations provider', function () {
        it('returns a zero address', async function () {
          const implementation = await this.controller.getImplementation(version_0, contractName)
          assert.equal(implementation, 0x0);
        })
      })
    })
  })
})
