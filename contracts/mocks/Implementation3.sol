pragma solidity ^0.4.21;

import "../migrations/Initializable.sol";

contract Implementation3 is Initializable {
  uint value;

  function initialize() isInitializer() public {
  }

  function setValue(uint _number) public {
    value = _number;
  }

  function getValue(uint _number) public view returns (uint) {
    return value + _number;
  }
}
