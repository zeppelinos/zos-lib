pragma solidity ^0.4.21;

import './UpgradeabilityProxy.sol';

/**
 * @title OwnedUpgradeabilityProxy
 * @dev This contract combines an upgradeability proxy with basic authorization control functionalities
 */
contract OwnedUpgradeabilityProxy is UpgradeabilityProxy {
  /**
   * @dev Event to show ownership has been transferred
   * @param previousOwner representing the address of the previous owner
   * @param newOwner representing the address of the new owner
   */
  event ProxyOwnershipTransferred(address previousOwner, address newOwner);

  // Storage slot of the owner of the contract
  bytes32 private constant proxyOwnerSlot = keccak256("org.zeppelinos.proxy.owner");

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyProxyOwner() {
    if (msg.sender == _proxyOwner()) {
      _;
    } else {
      // We call super to skip the check that the sender isn't the proxyOwer.
      // This should be optimized away by the compiler and not by us.
      super._fallback();
    }
  }

  /**
   * @dev the constructor sets the original owner of the contract to the sender account.
   * @param _implementation representing the address of the initial implementation to be set
   */
  function OwnedUpgradeabilityProxy(address _implementation) UpgradeabilityProxy(_implementation) public {
    _setUpgradeabilityOwner(msg.sender);
  }

  /**
   * @dev Tells the address of the owner
   * @return the address of the owner
   */
  function proxyOwner() public view onlyProxyOwner returns (address owner) {
    return _proxyOwner();
  }

  /**
   * @return the address of the implementation
   */
  function implementation() public view onlyProxyOwner returns (address) {
    return _implementation();
  }

  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param newOwner The address to transfer proxy ownership to.
   */
  function transferProxyOwnership(address newOwner) public onlyProxyOwner {
    require(newOwner != address(0));
    emit ProxyOwnershipTransferred(proxyOwner(), newOwner);
    _setUpgradeabilityOwner(newOwner);
  }

  /**
   * @dev Allows the proxy owner to upgrade the current version of the proxy.
   * @param implementation representing the address of the new implementation to be set.
   */
  function upgradeTo(address implementation) public onlyProxyOwner {
    _upgradeTo(implementation);
  }

  /**
   * @dev Allows the proxy owner to upgrade the current version of the proxy and call the new implementation
   * to initialize whatever is needed through a low level call.
   * @param implementation representing the address of the new implementation to be set.
   * @param data represents the msg.data to bet sent in the low level call. This parameter may include the function
   * signature of the implementation to be called with the needed payload
   */
  function upgradeToAndCall(address implementation, bytes data) payable public onlyProxyOwner {
    upgradeTo(implementation);
    require(this.call.value(msg.value)(data));
  }

  /**
   * @dev Tells the address of the owner
   * @return the address of the owner
   */
  function _proxyOwner() internal returns (address owner) {
    bytes32 slot = proxyOwnerSlot;
    assembly {
      owner := sload(slot)
    }
  }

  /**
   * @dev Sets the address of the owner
   */
  function _setUpgradeabilityOwner(address newProxyOwner) internal {
    bytes32 slot = proxyOwnerSlot;

    assembly {
      sstore(slot, newProxyOwner)
    }
  }

  /**
   * @dev Redefines Proxy's fallback to disallow delegation when caller is the proxy owner.
   */
  function _fallback() internal {
    require(msg.sender != proxyOwner());

    super._fallback();
  }
}
