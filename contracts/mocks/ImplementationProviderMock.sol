pragma solidity ^0.4.21;

import '../application/versioning/ContractProvider.sol';

/**
 * @title ImplementationProviderMock
 * @dev This contract is a mock to test upgradeability functionality
 */
contract ImplementationProviderMock is ContractProvider {
  address public implementation;

  function ImplementationProviderMock(address _implementation) public {
    implementation = _implementation;
  }

  function getImplementation(string /*contractName*/) public view returns (address) {
    return implementation;
  }
}
