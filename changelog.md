# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### [1.3.0] - [date]

#### Added
- Support custom Truffle build directories
- Reason messages to require statements
- Proxy wrapper object to allow querying proxie's admin and implementation
- Changelog file

#### Changed
- Set testing environment in tests setup file
- Improve complex example tests
- Update Truffle to version 4.1.13
- Update OpenZeppelin to version 1.10.0
- Update pragma solidity to version ^0.4.24
- Use new solc constructor syntax

#### Fixed
- Fix migratable initializers ensuring they can never be run more than once
- Fix freezable directory unset implementation method
- Fix AdminUpgradeabilityProxy shadowing issues

### [2.0.0] - [date]

#### Added
- New freezable implementation directory wrapper
- New base implementation directory wrapper
- Address getter function for custom contract wrappers

#### Changed
- Refactor directory wrapper to represent the real implementation directories hierarchy
- Refactor package wrapper allowing to work with any directory type
- Refactor App and Package wrappers to work with new directory wrapper models
- Index event arguments to improve quering

#### Removed
- Remove Release contract

#### Deprecated

## [Released]

### [1.2.1] - 2018-06-29

#### Fix
- Fix App wrapper hasStdlib function

### [1.2.0] - 2018-06-29

#### Added
- Allow customising sync timeout in truffle-wrapped contracts

### [1.1.0] - 2018-06-28

#### Added
- New functions to work with directories with FileSystem
- Upgradeability regression tests 
- Warn level to Logger
- Unset implementation method to App, Package and Release wrappers
- Has stdlib set functionality to App wrapper
- Expose different build paths being handled by Contracts object

#### Changed
- Update dependencies for solidity-coverage dependency
- Polish NPM test script
- Improve test coverage
- Improve arguments logging for proxies initialization
- Replace colors dependency by chalk 

#### Fixed
- Make FileSystem copy function synchronous
- Move solidity-coverage defaults params to Contracts object
- Mark ethereumjs-abi as production dependency
- Marl web3 as production dependency
- Marl web3 as production dependency
- UpgradeabilityProxyFactory contract in-line documentation

#### Removed
- Remove Truffle Migrations contract
