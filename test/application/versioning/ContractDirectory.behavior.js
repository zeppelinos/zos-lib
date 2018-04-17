const assertRevert = require('../../helpers/assertRevert')
const ContractDirectory = artifacts.require('ContractDirectory')
const shouldBehaveLikeOwnable = require('../../ownership/Ownable.behavior')

function shouldBehaveLikeContractDirectory(owner, anotherAddress, implementation_v0, implementation_v1) {
  describe('ownership', function () {
    beforeEach(function () {
      this.ownable = this.directory
    })

    shouldBehaveLikeOwnable(owner, anotherAddress)
  })

  describe('setImplementation', function () {
    const contract = 'ERC721'

    describe('when the sender is the directory owner', function () {
      const from = owner

      it('registers the given version', async function () {
        await this.directory.setImplementation(contract, implementation_v0, { from })

        const registeredImplementation = await this.directory.getImplementation(contract)
        assert.equal(registeredImplementation, implementation_v0)
      })

      it('allows to register a another implementation of the same contract', async function () {
        const anotherImplementation = implementation_v1

        await this.directory.setImplementation(contract, implementation_v0, { from })
        await this.directory.setImplementation(contract, implementation_v1, { from })

        const registeredImplementation = await this.directory.getImplementation(contract)
        assert.equal(registeredImplementation, anotherImplementation)
      })

      it('allows to unregister a contract', async function () {
        await this.directory.setImplementation(contract, implementation_v0, { from })
        await this.directory.setImplementation(contract, 0x0, { from })

        const registeredImplementation = await this.directory.getImplementation(contract)
        assert.equal(registeredImplementation, 0x0)
      })
    })

    describe('when the sender is not the directory owner', function () {
      const from = anotherAddress

      it('reverts', async function () {
        await assertRevert(this.directory.setImplementation(contract, implementation_v0, { from }))
      })
    })
  })
}

module.exports = shouldBehaveLikeContractDirectory
