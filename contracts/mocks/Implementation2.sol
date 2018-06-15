pragma solidity ^0.4.21;

import "../migrations/Initializable.sol";

contract Implementation2 is Initializable {
  uint value;

  function initialize() isInitializer() public {
  }

  function setValue(uint _number) public {
    value = _number;
  }

  function getValue() public view returns (uint) {
    return value;
  }
}
