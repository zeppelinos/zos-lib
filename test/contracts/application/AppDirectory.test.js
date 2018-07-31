'use strict';
require('../../setup')

import Contracts from '../../../src/utils/Contracts'
import assertRevert from '../../../src/test/helpers/assertRevert'
import shouldBehaveLikeImplementationDirectory from '../../../src/test/behaviors/ImplementationDirectory'

const AppDirectory = Contracts.getFromLocal('AppDirectory')
const DummyImplementation = Contracts.getFromLocal('DummyImplementation')
const ImplementationDirectory = Contracts.getFromLocal('ImplementationDirectory')

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

contract('AppDirectory', ([_, appOwner, depsOwner, anotherAddress]) => {
  beforeEach(async function () {
    this.implementation_v0 = (await DummyImplementation.new()).address
    this.implementation_v1 = (await DummyImplementation.new()).address
    
    this.contractA = (await DummyImplementation.new()).address
    this.contractB = (await DummyImplementation.new()).address
    this.depA = await ImplementationDirectory.new({ from: depsOwner })
    this.depB = await ImplementationDirectory.new({ from: depsOwner })
    await this.depA.setImplementation('contractA', this.contractA, { from: depsOwner })
    await this.depB.setImplementation('contractB', this.contractB, { from: depsOwner })

    this.directory = await AppDirectory.new({ from: appOwner })
  })

  describe('without dependencies', function () {
    shouldBehaveLikeImplementationDirectory(appOwner, anotherAddress)
  });

  describe('with dependencies', function () {
    const contractName = 'ERC721'

    beforeEach('registering project implementations', async function () {
      await this.directory.setImplementation(contractName, this.implementation_v0, { from: appOwner })
    });

    beforeEach('registering dependencies', async function () {
      await this.directory.setDependency('depA', this.depA.address, { from: appOwner })
      await this.directory.setDependency('depB', this.depB.address, { from: appOwner })
    });

    describe('getImplementation', function () {
      it('returns a project implementation', async function () {
        (await this.directory.getImplementation(contractName)).should.eq(this.implementation_v0);
      });

      it('does not return a contract implemented in a dependency', async function () {
        (await this.directory.getImplementation('contractA')).should.be.zeroAddress;
      });

      it('does not return a non-existing contract', async function () {
        (await this.directory.getImplementation('notExists')).should.be.zeroAddress;
      });
    });

    describe('getPackageImplementation', function () {
      it('returns an implementation from a dependency', async function () {
        (await this.directory.getPackageImplementation("depA", "contractA")).should.eq(this.contractA);
        (await this.directory.getPackageImplementation("depB", "contractB")).should.eq(this.contractB);
      });

      it('does not return a project implementation', async function () {
        (await this.directory.getPackageImplementation("", contractName)).should.be.zeroAddress;
      });

      it('does not return an implementation from another package', async function () {
        (await this.directory.getPackageImplementation("depA", "contractB")).should.be.zeroAddress;
      });

      it('does not return a non-existing implementation', async function () {
        (await this.directory.getPackageImplementation("depA", "notExists")).should.be.zeroAddress;
      });

      it('does not return an implementation from a non registered dependency', async function () {
        (await this.directory.getPackageImplementation("noDep", "contractA")).should.be.zeroAddress;
      });
    });
  });

  describe('setDependency', function () {
    it('should add a dependency', async function () {
      const { logs } = await this.directory.setDependency("depA", this.depA.address, { from: appOwner });
      logs[0].event.should.eq('DependencyChanged');
      logs[0].args.should.deep.eq({ name: 'depA', dependency: this.depA.address });
      const found = await this.directory.getDependency('depA');
      found.should.eq(this.depA.address);
    });

    it('should overwrite a dependency', async function () {
      await this.directory.setDependency("depA", this.depB.address, { from: appOwner });

      const { logs } = await this.directory.setDependency("depA", this.depA.address, { from: appOwner });
      logs[0].event.should.eq('DependencyChanged');
      logs[0].args.should.deep.eq({ name: 'depA', dependency: this.depA.address });
      const found = await this.directory.getDependency('depA');
      found.should.eq(this.depA.address);
    });

    it('should fail to add a dependency from a non-owner', async function () {
      await assertRevert(this.directory.setDependency("depA", this.depA.address, { from: anotherAddress }))
    });

    it('should fail to add a null dependency', async function () {
      await assertRevert(this.directory.setDependency("depA", 0x0, { from: appOwner }))
    });
  });

  describe('unsetDependency', function () {
    beforeEach('setting dependency', async function () {
      await this.directory.setDependency("depA", this.depA.address, { from: appOwner });
    });

    it('should remove a dependency', async function () {
      const { logs } = await this.directory.unsetDependency("depA", { from: appOwner });
      logs[0].event.should.eq('DependencyChanged');
      logs[0].args.should.deep.eq({ name: 'depA', dependency: ZERO_ADDRESS });
      const found = await this.directory.getDependency('depA');
      found.should.be.zeroAddress;
    });

    it('should fail to remove a non-existent dependency', async function () {
      await assertRevert(this.directory.unsetDependency("depB", { from: appOwner }));
    });

    it('should fail to remove a dependency by a non-owner', async function () {
      await assertRevert(this.directory.unsetDependency("depA", { from: anotherAddress }));
    });
  });
});
