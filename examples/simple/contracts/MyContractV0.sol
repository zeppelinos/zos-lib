pragma solidity ^0.4.21;


import "zos-lib/contracts/migrations/Initializable.sol";


contract MyContractV0 is Initializable {

  uint256 public value;

  function initialize(uint256 _value) isInitializer public {
    value = _value;
  }
}
