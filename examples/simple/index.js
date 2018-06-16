'use strict';

const { Contracts } = require('zos-lib')
const MyContractV0 = Contracts.getFromLocal('MyContractV0');
const MyContractV1 = Contracts.getFromLocal('MyContractV1');
const AdminUpgradeabilityProxy = Contracts.getFromNodeModules('zos-lib', 'AdminUpgradeabilityProxy');

module.exports = async function() {
  console.log('Deploying MyContract v0...');
  const myContractV0 = await MyContractV0.new();

  console.log('Deploying a proxy pointing to v0...');
  const proxy = await AdminUpgradeabilityProxy.new(myContractV0.address);

  console.log('Calling initialize(42) on proxy...');
  let myContract = await MyContractV0.at(proxy.address);
  const value = 42;
  await myContract.initialize(value);
  console.log('Proxy\'s storage value: ' + (await myContract.value()).toString());

  console.log('Deploying MyContract v1...');
  const myContractV1 = await MyContractV1.new();

  console.log('Upgrading proxy to v1...');
  await proxy.upgradeTo(myContractV1.address);
  myContract = await MyContractV1.at(proxy.address);

  await myContract.add(1);
  console.log('Proxy\'s storage new value: ' + (await myContract.value()).toString());
  console.log('Wohoo! We\'ve upgraded our contract\'s behavior while preserving its storage, thus obtaining 43.');
};
