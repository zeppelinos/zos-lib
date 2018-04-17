pragma solidity ^0.4.21;

import "./ContractProvider.sol";
import "./ContractDirectory.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract AppContractDirectory is ContractDirectory {
  ContractProvider public fallbackProvider;

  function AppContractDirectory(ContractProvider _fallbackProvider) public {
    fallbackProvider = _fallbackProvider;
  }

  function getImplementation(string contractName) public view returns (address) {
    address implementation = super.getImplementation(contractName);
    if(implementation != address(0)) return implementation;
    if(fallbackProvider != address(0)) return fallbackProvider.getImplementation(contractName);
    return address(0);
  }

  function setFallbackProvider(ContractProvider _fallbackProvider) public onlyOwner {
    fallbackProvider = _fallbackProvider;
  }
}
