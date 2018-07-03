pragma solidity ^0.4.21;

contract GassyImplementation {
  uint256 i;

  function gassy() public {
    while(true) {
      i = i + 1;
    }
  }

  function throws() public {
    i = 10;
    assert(false);
  }

  function reverts() public {
    i = 20;
    require(false);
  }
}