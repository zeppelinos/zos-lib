'use strict'
require('../../setup')

import deploy from '../../../src/utils/Deploy';
import Contracts from '../../../src/utils/Contracts';

const DEFAULT_GAS = 6721975;
const DUMMY_IMPLEMENTATION_GAS = 431688;
const WITH_CONSTRUCTOR_GAS = 236469;

contract('Deploy', function([account1, account2]) {

  beforeEach('load contract', function () {
    this.DummyImplementation = Contracts.getFromLocal('DummyImplementation');
  });

  const assertGas = (instance, expected) => {
    const { gas } = web3.eth.getTransaction(instance.transactionHash);
    gas.should.be.eq(expected);
  };

  const assertFrom = (instance, expected) => {
    const { from } = web3.eth.getTransaction(instance.transactionHash);
    from.should.be.eq(expected);
  }

  describe('via truffle', function () {
    it('used default gas', async function () {
      const instance = await this.DummyImplementation.new();
      assertGas(instance, DEFAULT_GAS);
    });
  });

  describe('via custom deploy', function () {
    describe('without a constructor', function () {
      it('correctly deploys an instance', async function () {
        const instance = await deploy(this.DummyImplementation);
        (await instance.version()).should.eq("V1");
      });
  
      it('estimates gas', async function () {
        const instance = await deploy(this.DummyImplementation);
        assertGas(instance, DUMMY_IMPLEMENTATION_GAS);
      });
  
      it('uses specified gas', async function () {
        const instance = await deploy(this.DummyImplementation, [], { gas: 800000 });
        assertGas(instance, 800000);
      });
  
      it('honours other tx params', async function () {
        const instance = await deploy(this.DummyImplementation, [], { from: account2 });
        assertGas(instance, DUMMY_IMPLEMENTATION_GAS);
        assertFrom(instance, account2);
      });
    });

    describe('with a constructor', function () {
      beforeEach('load contract', function () {
        this.WithConstructorImplementation = Contracts.getFromLocal('WithConstructorImplementation');
      });

      it('correctly deploys an instance', async function () {
        const instance = await deploy(this.WithConstructorImplementation, [42, "foo"]);
        (await instance.value()).toNumber().should.eq(42);
        (await instance.text()).should.eq("foo");
      });

      it('estimates gas', async function () {
        const instance = await deploy(this.WithConstructorImplementation, [42, "foo"]);
        assertGas(instance, WITH_CONSTRUCTOR_GAS);
      });

      it('uses specified gas', async function () {
        const instance = await deploy(this.WithConstructorImplementation, [42, "foo"], { gas: 800000 });
        assertGas(instance, 800000);
      });
  
      it('honours other tx params', async function () {
        const instance = await deploy(this.WithConstructorImplementation, [42, "foo"], { from: account2 });
        assertGas(instance, WITH_CONSTRUCTOR_GAS);
        assertFrom(instance, account2);
      });
    });
  });
})
