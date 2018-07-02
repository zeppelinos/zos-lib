pragma solidity ^0.4.21;

contract GassyImplementation {
  uint256 i;

  function gassy() public {
    while(true) {
      i = i + 1;
    }
  }
}