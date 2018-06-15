import assertRevert from '../../../src/test/helpers/assertRevert';
import encodeCall from '../../../src/helpers/encodeCall'

const Implementation1 = artifacts.require('Implementation1');
const Implementation2 = artifacts.require('Implementation2');
const Implementation3 = artifacts.require('Implementation3');
const Implementation4 = artifacts.require('Implementation4');
const AdminUpgradeabilityProxy = artifacts.require('AdminUpgradeabilityProxy');

const sendTransaction = (target, method, args, values, opts) => {
  const data = encodeCall(method, args, values);
  return target.sendTransaction(Object.assign({ data }, opts));
};

contract('AdminUpgradeabilityProxy', ([_, admin, anotherAddress]) => {
  it('should add new function', async () => {
    const instance1 = await Implementation1.new();

    const proxy = await AdminUpgradeabilityProxy.new(instance1.address, {
      from: admin
    });

    const proxyInstance1 = await Implementation1.at(proxy.address);
    await proxyInstance1.setValue(42);

    const instance2 = await Implementation2.new();
    await proxy.upgradeTo(instance2.address, {
      from: admin
    });

    const proxyInstance2 = Implementation2.at(proxy.address);
    const res = await proxyInstance2.getValue.call();
    assert.equal(res.toString(), "42");
  });

  it('should remove function', async () => {
    const instance2 = await Implementation2.new();

    const proxy = await AdminUpgradeabilityProxy.new(instance2.address, {
      from: admin
    });

    const proxyInstance2 = await Implementation2.at(proxy.address);
    await proxyInstance2.setValue(42);
    const res = await proxyInstance2.getValue.call();
    assert.equal(res.toString(), "42");

    const instance1 = await Implementation1.new();

    await proxy.upgradeTo(instance1.address, {
      from: admin
    });

    const proxyInstance1 = await Implementation2.at(proxy.address);
    assertRevert(proxyInstance1.getValue.call());
  });

  it('should change function signature', async () => {
    const instance1 = await Implementation1.new();

    const proxy = await AdminUpgradeabilityProxy.new(instance1.address, {
      from: admin
    });

    const proxyInstance1 = await Implementation1.at(proxy.address);
    await proxyInstance1.setValue(42);

    const instance3 = await Implementation3.new();
    await proxy.upgradeTo(instance3.address, {
      from: admin
    });

    const proxyInstance3 = Implementation3.at(proxy.address);
    const res = await proxyInstance3.getValue.call(8);
    assert.equal(res.toString(), "50");
  });

  it('should add fallback function', async () => {
    const instance1 = await Implementation1.new();

    const proxy = await AdminUpgradeabilityProxy.new(instance1.address, {
      from: admin
    });
    const proxyInstance1 = await Implementation1.at(proxy.address);

    const instance4 = await Implementation4.new();
    await proxy.upgradeTo(instance4.address, {
      from: admin
    });

    const proxyInstance4 = await Implementation4.at(proxy.address);

    await sendTransaction(proxy, '', [], [], {
      from: anotherAddress
    });

    const res = await proxyInstance4.getValue.call();
    assert.equal(res.toString(), "1");
  });

  it('should remove fallback function', async () => {
    const instance4 = await Implementation4.new();
    const proxy = await AdminUpgradeabilityProxy.new(instance4.address, {
      from: admin
    });
    const proxyInstance4 = await Implementation4.at(proxy.address);

    const instance2 = await Implementation2.new();
    await proxy.upgradeTo(instance2.address, {
      from: admin
    });

    await assertRevert(sendTransaction(proxy, '', [], [], {
      from: anotherAddress
    }));

    const proxyInstance2 = Implementation2.at(proxy.address);

    const res = await proxyInstance2.getValue.call();
    assert.equal(res.toString(), "0");
  });
});
