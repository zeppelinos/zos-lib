pragma solidity ^0.4.21;

import './Proxy.sol';
import 'zeppelin-solidity/contracts/AddressUtils.sol';

/**
 * @title UpgradeabilityProxy
 *
 * @dev This contract implements a proxy where the implementation address to
 * @dev which it will delegate can be changed. Such a change is called an
 * @dev implementation upgrade.
 */
contract UpgradeabilityProxy is Proxy {
  /**
   * @dev This event will be emitted every time the implementation is upgraded.
   * @param implementation address of the new implementation
   */
  event Upgraded(address implementation);

  // Storage slot of the address of the current implementation
  bytes32 private constant implementationSlot = keccak256("org.zeppelinos.proxy.implementation");

  /**
   * @dev Constructor function
   * @param _implementation address of the initial implementation
   */
  function UpgradeabilityProxy(address _implementation) public {
    _setImplementation(_implementation);
  }

  /**
   * @return address of the current implementation
   */
  function _implementation() internal view returns (address impl) {
    bytes32 slot = implementationSlot;

    assembly {
      impl := sload(slot)
    }
  }

  /**
   * @dev Sets the implementation address of the proxy
   * @param newImplementation address representing the new implementation to be set
   */
  function _setImplementation(address newImplementation) internal {
    require(AddressUtils.isContract(newImplementation));

    bytes32 slot = implementationSlot;

    assembly {
      sstore(slot, newImplementation)
    }

    emit Upgraded(newImplementation);
  }

  /**
   * @dev Upgrades the implementation address
   * @param newImplementation representing the address of the new implementation to be set
   */
  function _upgradeTo(address newImplementation) internal {
    _setImplementation(newImplementation);
  }
}
