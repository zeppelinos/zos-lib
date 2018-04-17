const AppDirectory = artifacts.require('AppDirectory')
const assertRevert = require('../../helpers/assertRevert')
const ContractDirectory = artifacts.require('ContractDirectory')
const shouldBehaveLikeContractDirectory = require('../versioning/ContractDirectory.behavior')

contract('ContractDirectory', ([_, owner, fallbackOwner, anotherAddress, implementation_v0, implementation_v1, fallbackImplementation]) => {
  beforeEach(async function () {
    this.directory = await AppDirectory.new(0x0, { from: owner })
    this.stdlib = await ContractDirectory.new({ from: fallbackOwner })
  })

  shouldBehaveLikeContractDirectory(owner, anotherAddress, implementation_v0, implementation_v1)

  describe('getImplementation', function () {
    const contract = 'ERC721'

    describe('when no stdlib was set', function () {
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

    describe('when a stdlib was set', function () {
      beforeEach(async function () {
        await this.directory.setStdlib(this.stdlib.address, { from: owner })
      })

      describe('when the requested contract was registered in the directory', function () {
        beforeEach(async function () {
          await this.directory.setImplementation(contract, implementation_v0, { from: owner })
        })

        describe('when the requested contract was registered in the stdlib', function () {
          beforeEach(async function () {
            await this.stdlib.setImplementation(contract, fallbackImplementation, { from: fallbackOwner })
          })

          it('returns the implementation of the directory', async function () {
            const implementation = await this.directory.getImplementation(contract)
            assert.equal(implementation, implementation_v0)
          })
        })

        describe('when the requested contract was not registered in the stdlib', function () {
          it('returns the implementation of the directory', async function () {
            const implementation = await this.directory.getImplementation(contract)
            assert.equal(implementation, implementation_v0)
          })
        })
      })

      describe('when the requested contract was not registered in the directory', function () {
        describe('when the requested contract was registered in the stdlib', function () {
          beforeEach(async function () {
            await this.stdlib.setImplementation(contract, fallbackImplementation, { from: fallbackOwner })
          })

          it('returns the implementation of the stdlib', async function () {
            const implementation = await this.directory.getImplementation(contract)
            assert.equal(implementation, fallbackImplementation)
          })
        })

        describe('when the requested contract was not registered in the stdlib', function () {
          it('returns the zero address', async function () {
            const implementation = await this.directory.getImplementation(contract)
            assert.equal(implementation, 0x0)
          })
        })
      })
    })
  })

  describe('setStdlib', function () {
    describe('when the sender is the owner', function () {
      const from = owner

      beforeEach(async function () {
        await this.directory.setStdlib(this.stdlib.address, { from })
      })

      it('a stdlib can be set', async function () {
        const stdlib = await this.directory.stdlib()
        assert.equal(stdlib, this.stdlib.address)
      })

      it('a stdlib can be unset', async function () {
        await this.directory.setStdlib(0, { from })
        const stdlib = await this.directory.stdlib()
        assert.equal(stdlib, 0x0)
      })
    })

    describe('when the sender is not the owner', function () {
      it('reverts', async function () {
        await assertRevert(this.directory.setStdlib(this.stdlib.address, { from: anotherAddress }))
      })
    })
  })
})
