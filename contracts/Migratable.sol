pragma solidity ^0.4.21;

contract Migratable {
  // Alternatively, we could store contractName => currentVersionName
  mapping(string => mapping(string => bool)) internal migrated;

  // Should these events args be indexed?
  event Migrated(string contractName, string version);

  function isMigrated(string contractName, string version) public view returns(bool) {
    return migrated[contractName][version];
  }

  modifier isInitializer(string contractName, string version) {
    require(!migrated[contractName][version]);
    _;
    emit Migrated(contractName, version);
    migrated[contractName][version] = true;
  }

  modifier isMigration(string contractName, string from, string to) {
    require(migrated[contractName][from] && !migrated[contractName][to]);
    _;
    emit Migrated(contractName, to);
    migrated[contractName][to] = true;
  }
}
