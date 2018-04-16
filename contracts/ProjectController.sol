pragma solidity ^0.4.21;

import './Registry.sol';
import './ImplementationProvider.sol';
import './upgradeability/OwnedUpgradeabilityProxy.sol';
import './upgradeability/UpgradeabilityProxyFactory.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

/**
 * @title ProjectController
 * @dev This contract manages proxies creation and upgrades through a registry of versions
 */
contract ProjectController is ImplementationProvider, Ownable {
  // Versions registry
  Registry private _registry;

  // Managed proxy
  UpgradeabilityProxyFactory private _factory;

  // Fallback implementation provider
  ImplementationProvider private _implementationsProvider;

  /**
   * @dev Constructor function
   * @param registry representing the versions registry
   * @param factory representing the proxy factory to be used by the controller
   * @param implementationsProvider representing an optional fallback implementations provider
   */
  function ProjectController(
    Registry registry,
    UpgradeabilityProxyFactory factory,
    ImplementationProvider implementationsProvider
  ) public {
    require(factory != address(0));
    require(registry != address(0));

    _factory = factory;
    _registry = registry;
    _implementationsProvider = implementationsProvider;
  }

  /**
   * @dev Tells the versions registry
   * @return address of the registry
   */
  function registry() public view returns (Registry) {
    return _registry;
  }

  /**
   * @dev Tells the proxy factory
   * @return address of the factory
   */
  function factory() public view returns (UpgradeabilityProxyFactory) {
    return _factory;
  }

  /**
   * @dev Tells the implementations provider
   * @return address of the implementations provider
   */
  function implementationsProvider() public view returns (ImplementationProvider) {
    return _implementationsProvider;
  }

  /**
   * @dev Allows the upgrader owner to upgrade a proxy to a new version.
   * @param version representing the version of the new implementation to be set.
   * @param contractName representing the contract name of the new implementation to be set.
   */
  function upgradeTo(OwnedUpgradeabilityProxy proxy, string version, string contractName) public onlyOwner {
    address _implementation = getImplementationOrRevert(version, contractName);
    proxy.upgradeTo(_implementation);
  }

  /**
   * @dev Allows the upgrader owner to upgrade a proxy to a new version and call the new implementation
   * to initialize whatever is needed through a low level call.
   * @param version representing the version of the new implementation to be set.
   * @param contractName representing the contract name of the new implementation to be set.
   * @param data represents the msg.data to bet sent in the low level call. This parameter may include the function
   * signature of the implementation to be called with the needed payload.
   */
  function upgradeToAndCall(OwnedUpgradeabilityProxy proxy, string version, string contractName, bytes data) payable public onlyOwner {
    address _implementation = getImplementationOrRevert(version, contractName);
    proxy.upgradeToAndCall.value(msg.value)(_implementation, data);
  }

  /**
   * @dev Creates an upgradeability proxy upgraded to an initial version
   * @param version representing the version of the new implementation to be set.
   * @param contractName representing the contract name of the new implementation to be set.
   * @return address of the new proxy.
   */
  function create(string version, string contractName) public returns (OwnedUpgradeabilityProxy) {
    address _implementation = getImplementationOrRevert(version, contractName);
    return _factory.createProxy(this, _implementation);
  }

  /**
   * @dev Creates an upgradeability proxy upgraded to an initial version and call the new implementation
   * @param version representing the version of the new implementation to be set.
   * @param contractName representing the contract name of the new implementation to be set.
   * @param data represents the msg.data to bet sent in the low level call. This parameter may include the function
   * signature of the implementation to be called with the needed payload
   * @return address of the new proxy.
   */
  function createAndCall(string version, string contractName, bytes data) payable public returns (OwnedUpgradeabilityProxy) {
    address _implementation = getImplementationOrRevert(version, contractName);
    return _factory.createProxyAndCall.value(msg.value)(this, _implementation, data);
  }

  /**
   * @dev Fetches an implementation address from the registry or the fallback implementations provider
   * @param version representing the version of the implementation to be queried.
   * @param contractName representing the contract name of the implementation to be queried.
   * @return address of the requested implementation.
   */
  function getImplementation(string version, string contractName) public view returns (address) {
    address implementation = _registry.getImplementation(version, contractName);
    if(implementation != address(0)) return implementation;
    if(_implementationsProvider != address(0)) return _implementationsProvider.getImplementation(version, contractName);
    return address(0);
  }

  /**
   * @dev Internal function to fetch an implementation address from the registry and validate it
   * @param version representing the version of the implementation to be queried.
   * @param contractName representing the contract name of the implementation to be queried.
   * @return address of the requested implementation.
   */
  function getImplementationOrRevert(string version, string contractName) internal view returns (address) {
    address _implementation = getImplementation(version, contractName);
    require(_implementation != address(0));
    return _implementation;
  }
}
