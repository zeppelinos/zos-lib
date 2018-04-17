pragma solidity ^0.4.21;

import "./ContractProvider.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract ContractDirectory is ContractProvider, Ownable {
  ContractProvider public fallbackProvider;
  mapping (string => address) internal implementations;

  function ContractDirectory(ContractProvider _fallbackProvider) public {
    fallbackProvider = _fallbackProvider;
  }

  function getImplementation(string contractName) public view returns (address) {
    address implementation = implementations[contractName];
    if(implementation != address(0)) return implementation;
    if(fallbackProvider != address(0)) return fallbackProvider.getImplementation(contractName);
    return address(0);
  }

  function setImplementation(string contractName, address implementation) public onlyOwner {
    implementations[contractName] = implementation;
  }

  function setFallbackProvider(ContractProvider _fallbackProvider) public onlyOwner {
    fallbackProvider = _fallbackProvider;
  }
}
