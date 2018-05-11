pragma solidity ^0.4.21;


/**
 * @title Initializable
 * @dev Simple helper contract to support initialization outside of constructor.
 * Use Migratable for more complex migration mechanisms.
 */
contract Initializable {

  // changed to true when contract has been initialized
  bool public initialized;

  /**
   * @dev used to decorate the initialization function of a contract
   */
  modifier isInitializer() {
    require(!initialized);
    _;
    initialized = true;
  }
}
