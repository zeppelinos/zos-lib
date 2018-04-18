pragma solidity ^0.4.21;

import '../migrations/Migratable.sol';

/**
 * @title MigratableMockV1
 * @dev This contract is a mock to test initializable functionality through migrations
 */
contract MigratableMockV1 is Migratable {
  uint256 public x;

  function initialize(uint256 value) isInitializer("MigratableMock", "V1") public payable {
    x = value;
  }
}

/**
 * @title MigratableMockV2
 * @dev This contract is a mock to test migratable functionality with params
 */
contract MigratableMockV2 is MigratableMockV1 {
  uint256 public y;

  function migrate(uint256 value, uint256 anotherValue) isMigration("MigratableMock", "V1", "V2") public payable {
    x = value;
    y = anotherValue;
  }
}

/**
 * @title MigratableMockV3
 * @dev This contract is a mock to test migratable functionality without params
 */
contract MigratableMockV3 is MigratableMockV2 {
  function migrate() isMigration("MigratableMock", "V2", "V3") public payable {
    uint256 oldX = x;
    x = y;
    y = oldX;
  }
}
