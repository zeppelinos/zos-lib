pragma solidity ^0.4.21;

import "./ContractProvider.sol";
import "./ContractDirectory.sol";

contract FreezableContractDirectory is ContractDirectory {
  bool public frozen;

  modifier whenNotFrozen() {
    require(!frozen);
    _;
  }

  function FreezableContractDirectory(ContractProvider _fallbackProvider) ContractDirectory(_fallbackProvider) public {}

  function freeze() onlyOwner whenNotFrozen public {
    frozen = true;
  }

  function setImplementation(string contractName, address implementation) public onlyOwner whenNotFrozen {
    super.setImplementation(contractName, implementation);
  }

  function setFallbackProvider(ContractProvider _fallbackProvider) public onlyOwner whenNotFrozen {
    super.setFallbackProvider(_fallbackProvider);
  }
}
