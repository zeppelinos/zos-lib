pragma solidity ^0.4.24;

import "./BaseApp.sol";
import "./versioning/ImplementationProvider.sol";
import "../upgradeability/UpgradeabilityProxyFactory.sol";

/**
 * @title UnversionedApp
 * @dev Basic implementation of an upgradable app with no versioning.
 */
contract UnversionedApp is BaseApp {
  /*
   * @dev Providers for contract implementation addresses.
   */
  mapping(string => ImplementationProvider) internal providers;

  event ProviderChanged(string providerName, address implementation);

  /**
   * @dev Constructor function.
   * @param _factory Proxy factory.
   */
  constructor(UpgradeabilityProxyFactory _factory) BaseApp(_factory) public { }

  /**
   * @dev Returns the provider for a given package.
   * @param packageName Name of the package to be retrieved.
   * @return The provider.
   */
  function getProvider(string packageName) public view returns (ImplementationProvider) {
    return providers[packageName];
  }

  /**
   * @dev Sets a new implementation provider.
   * @param _provider New implementation provider
   */
  function setProvider(string packageName, ImplementationProvider _provider) public onlyOwner {
    require(address(_provider) != address(0), "Cannot set the implementation provider of an app to the zero address");
    providers[packageName] = _provider;
    emit ProviderChanged(packageName, _provider);
  }

  function unsetProvider(string packageName) public onlyOwner {
    require(providers[packageName] != address(0), "Provider to unset not found");
    delete providers[packageName];
    emit ProviderChanged(packageName, address(0));
  }
}
