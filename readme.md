# zeppelin_os library
[![NPM Package](https://img.shields.io/npm/v/zos-lib.svg?style=flat-square)](https://www.npmjs.org/package/zos-lib)
[![Build Status](https://travis-ci.org/zeppelinos/zos-lib.svg?branch=master)](https://travis-ci.org/zeppelinos/zos-lib)
[![Coverage Status](https://coveralls.io/repos/github/zeppelinos/zos-lib/badge.svg?branch=master)](https://coveralls.io/github/zeppelinos/zos-lib?branch=master)

:warning: **Under heavy development: do not use in production** :warning: 

`upgradeability-lib` is a library for writing upgradeable smart contracts on Ethereum. It can be used to create an upgradeable on-chain distributed application and is also used inside [the zOS Kernel](https://github.com/zeppelinos/kernel).

Use this library if you want to programmatically develop, deploy or operate an upgradeable smart contract system. 

If you want a CLI-aided development experience, see [the zOS CLI](https://github.com/zeppelinos/cli). 

# Getting Started

To install `upgradeability-lib` simply go to your project's root directory and run:
```sh
npm i zos-upgradeability
```

Next, learn how to:
- [Develop and deploy a single smart contract which can be upgraded](#single) (for bugfixing or adding new features).
- [Develop and operate a complex app with multiple upgradeable smart contracts which is connected to the zOS Kernel standard libraries.](#complex)
- [Develop a zOS Kernel standard library release.](#kernel)

## <a name="single"></a> Develop and deploy a single upgradeable smart contract

To work with a single upgradeable smart contract, you just need to deal with a simple upgradeability proxy. This is a special contract that will hold the storage of your upgradeable contract and redirect function calls to an `implementation` contract, which you can change (thus making it upgradeable). To learn more about how proxies work under the hood, [read this post on our blog](https://blog.zeppelinos.org/proxy-patterns/).



## <a name="complex"></a> Develop and operate a complex app with multiple upgradeable smart contracts and connect it to the zOS Kernel standard libraries
## <a name="kernel"></a> Develop a zOS Kernel standard library release.
