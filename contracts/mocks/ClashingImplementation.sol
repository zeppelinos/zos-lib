pragma solidity ^0.4.21;


contract ClashingImplementation {

  function proxyOwner() external returns (address) {
    return 0x0000000000000000000000000000000011111142;
  }

  function delegatedFunction() external pure returns (bool) {
    return true;
  }
}
