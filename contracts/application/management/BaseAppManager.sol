pragma solidity ^0.4.21;

import "../versioning/ContractProvider.sol";
import "../../upgradeability/OwnedUpgradeabilityProxy.sol";
import "../../upgradeability/UpgradeabilityProxyFactory.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract BaseAppManager is Ownable {
  UpgradeabilityProxyFactory public factory;

  function BaseAppManager(UpgradeabilityProxyFactory _factory) public {
    require(_factory != address(0));
    factory = _factory;
  }

  function provider() internal view returns (ContractProvider);

  function getImplementation(string contractName) public view returns (address) {
    return provider().getImplementation(contractName);
  }

  function create(string contractName) public returns (OwnedUpgradeabilityProxy) {
    address _implementation = getImplementationOrRevert(contractName);
    return _factory.createProxy(this, _implementation);
  }

  function createAndCall(string contractName, bytes data) payable public returns (OwnedUpgradeabilityProxy) {
    address _implementation = getImplementationOrRevert(contractName);
    return _factory.createProxyAndCall.value(msg.value)(this, _implementation, data);
  }

  function upgradeTo(OwnedUpgradeabilityProxy proxy, string contractName) public onlyOwner {
    address _implementation = getImplementationOrRevert(contractName);
    proxy.upgradeTo(_implementation);
  }

  function upgradeToAndCall(OwnedUpgradeabilityProxy proxy, string contractName, bytes data) payable public onlyOwner {
    address _implementation = getImplementationOrRevert(contractName);
    proxy.upgradeToAndCall.value(msg.value)(_implementation, data);
  }

  function getImplementationOrRevert(string contractName) internal view returns (address) {
    address _implementation = getImplementation(contractName);
    require(_implementation != address(0));
    return _implementation;
  }
}
