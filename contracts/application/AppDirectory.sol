pragma solidity ^0.4.24;

import "./versioning/ImplementationProvider.sol";
import "./versioning/ImplementationDirectory.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title AppDirectory
 * @dev Implementation directory with dependent packages.
 */
contract AppDirectory is PackageImplementationProvider, ImplementationDirectory {
  /**
   * @dev Emitted when a dependency is registered or unregistered.
   * @param name Identifier of the dependency.
   * @param dependency Address of the new dependency.
   */
  event DependencyChanged(string name, address indexed dependency);

  /**
   * @dev Providers for registered dependencies.
   */
  mapping(string => ImplementationProvider) internal dependencies;

  /**
   * @dev Constructor function.
   */
  constructor() public { }

  /**
   * @dev Returns the implementation address for a given contract name and a given package name.
   * @param packageName Name of the package that contains the contract.
   * @param contractName Name of the contract.
   * @return Address where the contract is implemented, or 0 if it is not found.
   */
  function getPackageImplementation(string packageName, string contractName) public view returns (address) {
    ImplementationProvider provider = dependencies[packageName];
    if (provider == ImplementationProvider(0)) return address(0);
    return provider.getImplementation(contractName);
  }

  /**
   * @dev Sets a dependency for contracts lookups.
   * @param _name Identifier of the dependency.
   * @param _dependency Address of the implementation provider of the dependency.
   */
  function setDependency(string _name, ImplementationProvider _dependency) public onlyOwner {
    require(_dependency != ImplementationProvider(0));
    dependencies[_name] = _dependency;
    emit DependencyChanged(_name, _dependency);
  }

  /**
   * @dev Removes dependency for contracts lookups.
   * @param _name Identifier of the dependency to remove.
   */
  function unsetDependency(string _name) public onlyOwner {
    require(dependencies[_name] != ImplementationProvider(0));
    delete dependencies[_name];
    emit DependencyChanged(_name, address(0));
  }

  /**
   * @dev Returns a dependency given its name
   * @param _name Identifier of the dependency to get
   */
  function getDependency(string _name) public view returns (ImplementationProvider) {
    return dependencies[_name];
  }
}
