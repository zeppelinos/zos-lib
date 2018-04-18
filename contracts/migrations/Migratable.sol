pragma solidity ^0.4.21;


contract Migratable {
  event Migrated(string contractName, string version);

  // Mapping from Alternatively, we could store contractName => currentVersionName
  mapping(string => mapping(string => bool)) internal migrated;

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

  function isMigrated(string contractName, string version) public view returns(bool) {
    return migrated[contractName][version];
  }
}
