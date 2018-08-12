pragma solidity ^0.4.24;

import "./BaseApp.sol";
import "./versioning/Package.sol";
import "../upgradeability/UpgradeabilityProxyFactory.sol";

/**
 * @title VersionedApp
 * @dev App for an upgradeable project that can use different versions from packages.
 * This is the standard entry point for an upgradeable app.
 */
contract VersionedApp is BaseApp {
  
  struct ProviderInfo {
    Package package;
    string version;
  }
  
  mapping(string => ProviderInfo) internal providers;

  event PackageChanged(string providerName, address package, string version);

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
    ProviderInfo storage info = providers[packageName];
    if (address(info.package) == address(0)) return ImplementationProvider(0);
    return info.package.getVersion(info.version);
  }

  function getPackage(string packageName) public view returns (Package, string) {
    ProviderInfo storage info = providers[packageName];
    return (info.package, info.version);
  } 

  function setPackage(string packageName, Package package, string version) public onlyOwner {
    require(package.hasVersion(version), "The requested version must be registered in the given package");
    providers[packageName] = ProviderInfo(package, version);
    emit PackageChanged(packageName, package, version);
  }

  function unsetPackage(string packageName) public onlyOwner {
    require(address(providers[packageName].package) != address(0), "Package to unset not found");
    delete providers[packageName];
  }
}
