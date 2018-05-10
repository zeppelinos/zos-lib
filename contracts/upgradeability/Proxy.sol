pragma solidity ^0.4.21;

/**
 * @title Proxy
 * @dev Gives the possibility to delegate any call to a foreign implementation.
 */
contract Proxy {
  /**
   * @return address of the implementation to which all calls will be delegated.
   */
  function _implementation() internal view returns (address);

  /**
   * @dev Performs a delegatecall to the address returned by _implementation().
   * @dev This is a low level function that doesn't return to its internal caller.
   * @dev It will return to the external caller whatever the implementation returns.
   * @param _target address 
   */
  function _delegate(address _target) internal {
    assembly {
      // 0x40 contains the value for the next available free memory pointer.
      let ptr := mload(0x40)
      // Copy msg.data.
      calldatacopy(ptr, 0, calldatasize)
      // Call the target.
      // out and outsize are 0 because we don't know the size yet.
      let result := delegatecall(gas, _target, ptr, calldatasize, 0, 0)
      // Copy the returned data.
      returndatacopy(ptr, 0, returndatasize)

      switch result
      // delegatecall returns 0 on error.
      case 0 { revert(ptr, returndatasize) }
      default { return(ptr, returndatasize) }
    }
  }

  /**
   * @dev Function that is run as the first thing in the fallback function.
   */
  function _willFallback() internal {
  }

  /**
   * @dev Extracted fallback function to enable manual triggering.
   */
  function _fallback() internal {
    _willFallback();
    _delegate(_implementation());
  }

  /**
   * @dev Implemented in _fallback.
   */
  function () payable external {
    _fallback();
  }
}
