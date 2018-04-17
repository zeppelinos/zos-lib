const assertRevert = require('../../helpers/assertRevert')
const ContractDirectory = artifacts.require('ContractDirectory')
const AppDirectory = artifacts.require('AppDirectory')
const shouldBehaveLikeContractDirectory = require('./ContractDirectory.behavior')

contract('ContractDirectory', ([_, owner, fallbackOwner, anotherAddress, implementation_v0, implementation_v1, fallbackImplementation]) => {
  beforeEach(async function () {
    this.directory = await AppDirectory.new(0x0, { from: owner })
    this.fallbackProvider = await ContractDirectory.new({ from: fallbackOwner })
  })

  shouldBehaveLikeContractDirectory(owner, anotherAddress, implementation_v0, implementation_v1)

  describe('getImplementation', function () {
    const contract = 'ERC721'

    describe('when no fallback provider was set', function () {
      describe('when the requested contract was registered in the directory', function () {
        beforeEach(async function () {
          await this.directory.setImplementation(contract, implementation_v0, { from: owner })
        })

        it('returns the implementation of the directory', async function () {
          const implementation = await this.directory.getImplementation(contract)
          assert.equal(implementation, implementation_v0)
        })
      })

      describe('when the requested contract was not registered in the directory', function () {
        it('returns the zero address', async function () {
          const implementation = await this.directory.getImplementation(contract)
          assert.equal(implementation, 0x0)
        })
      })
    })

    describe('when a fallback provider was set', function () {
      beforeEach(async function () {
        await this.directory.setFallbackProvider(this.fallbackProvider.address, { from: owner })
      })

      describe('when the requested contract was registered in the directory', function () {
        beforeEach(async function () {
          await this.directory.setImplementation(contract, implementation_v0, { from: owner })
        })

        describe('when the requested contract was registered in the fallback provider', function () {
          beforeEach(async function () {
            await this.fallbackProvider.setImplementation(contract, fallbackImplementation, { from: fallbackOwner })
          })

          it('returns the implementation of the directory', async function () {
            const implementation = await this.directory.getImplementation(contract)
            assert.equal(implementation, implementation_v0)
          })
        })

        describe('when the requested contract was not registered in the fallback provider', function () {
          it('returns the implementation of the directory', async function () {
            const implementation = await this.directory.getImplementation(contract)
            assert.equal(implementation, implementation_v0)
          })
        })
      })

      describe('when the requested contract was not registered in the directory', function () {
        describe('when the requested contract was registered in the fallback provider', function () {
          beforeEach(async function () {
            await this.fallbackProvider.setImplementation(contract, fallbackImplementation, { from: fallbackOwner })
          })

          it('returns the implementation of the fallback provider', async function () {
            const implementation = await this.directory.getImplementation(contract)
            assert.equal(implementation, fallbackImplementation)
          })
        })

        describe('when the requested contract was not registered in the fallback provider', function () {
          it('returns the zero address', async function () {
            const implementation = await this.directory.getImplementation(contract)
            assert.equal(implementation, 0x0)
          })
        })
      })
    })
  })

  describe('setFallbackProvider', function () {
    describe('when the sender is the owner', function () {
      const from = owner

      beforeEach(async function () {
        await this.directory.setFallbackProvider(this.fallbackProvider.address, { from })
      })

      it('a fallback provider can be set', async function () {
        const fallbackProvider = await this.directory.fallbackProvider()
        assert.equal(fallbackProvider, this.fallbackProvider.address)
      })

      it('a fallback provider can be unset', async function () {
        await this.directory.setFallbackProvider(0, { from })
        const fallbackProvider = await this.directory.fallbackProvider()
        assert.equal(fallbackProvider, 0x0)
      })
    })

    describe('when the sender is not the owner', function () {
      it('reverts', async function () {
        await assertRevert(this.directory.setFallbackProvider(this.fallbackProvider.address, { from: anotherAddress }))
      })
    })
  })
})
