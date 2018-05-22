# ZeppelinOS library
[![NPM Package](https://img.shields.io/npm/v/zos-lib.svg?style=flat-square)](https://www.npmjs.org/package/zos-lib)
[![Build Status](https://travis-ci.org/zeppelinos/zos-lib.svg?branch=master)](https://travis-ci.org/zeppelinos/zos-lib)
[![Coverage Status](https://coveralls.io/repos/github/zeppelinos/zos-lib/badge.svg?branch=master)](https://coveralls.io/github/zeppelinos/zos-lib?branch=master)

:warning: **Under heavy development: do not use in production** :warning:

This package provides a library to develop, deploy and operate upgradeable smart contracts on Ethereum and every other EVM and eWASM-powered blockchain.

This library is considered low level. For regular development, we recommend the CLI-aided development experience with the [ZeppelinOS CLI](https://github.com/zeppelinos/zos-cli).

## Table of Contents

- [Getting Started](#getting-started)
  - [Install](#install)
  - [Examples](#examples)
- [Links](#links)
- [License](#license)

## Getting Started

### Install

To install `zos-lib` simply go to your project's root directory and execute:
```sh
npm install zos-lib --save
```

### Examples

- [Develop and deploy a single upgradeable smart contract](https://docs.zeppelinos.org/docs/low_level_contract.html) (for bugfixing or adding new features)
- [Develop and operate a complex upgradeable app](https://docs.zeppelinos.org/docs/low_level_app.html) with multiple smart contracts which are connected to the ZeppelinOS upgradeable standard library

## Links

### Documentation
- [ZeppelinOS](http://zeppelinos.org)
- [ZeppelinOS Blog](https://blog.zeppelinos.org)
- [Proxy Patterns](https://blog.zeppelinos.org/proxy-patterns)

### Code
- [ZeppelinOS Command Line Interface (`zos-cli`)](https://github.com/zeppelinos/zos-cli)

## License

Code released under the [MIT License](LICENSE)