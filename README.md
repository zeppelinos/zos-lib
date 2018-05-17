# ZeppelinOS library _(zos-lib)_

[![NPM Package](https://img.shields.io/npm/v/zos-lib.svg?style=flat-square)](https://www.npmjs.org/package/zos-lib)

[![Build Status](https://travis-ci.org/zeppelinos/zos-lib.svg?branch=master)](https://travis-ci.org/zeppelinos/zos-lib)

[![Coverage Status](https://coveralls.io/repos/github/zeppelinos/zos-lib/badge.svg?branch=master)](https://coveralls.io/github/zeppelinos/zos-lib?branch=master)

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

:warning: **Under heavy development: do not use in production** :warning:

> Library for writing upgradeable smart contracts on Ethereum.

Use `zos-lib` if you want to programmatically develop, deploy or operate an upgradeable smart contract system.

We recommend the CLI-aided development experience instead of this lower level library. See [the zOS CLI](https://github.com/zeppelinos/zos-cli).

## Install

To install `zos-lib` simply go to your project's root directory and run:
```sh
npm install zos-lib
```

## Usage

To work with a single upgradeable smart contract, we just need to deal with a simple upgradeability proxy. This is a special contract that will hold the storage of our upgradeable contract and redirect function calls to an `implementation` contract, which we can change (thus making it upgradeable). Let's do the following example to see how it works:

1. Write the first version of the contract in `MyContract.sol`. Most contracts require some sort of initialization, but upgradeable contracts can't use constructors because the proxy won't know about those values. So we need to use the `Initializable` pattern provided by `zos-lib`:

```sol
import "zos-lib/contracts/migrations/Initializable.sol";

contract MyContract is Initializable {
  uint256 public x;

  function initialize(uint256 _x) isInitializer public {
    x = _x;
  }
}
```

2. Deploy this version:

```js
const myContract_v0 = await MyContract.new();
```

3. Now we need to deploy the proxy that will let us upgrade our contract. Pass the address of the first version to the constructor:

```js
const proxy = await AdminUpgradeabilityProxy.new(myContract_v0.address);
```

4. Next, call initialize on the proxy, to initialize the storage variables. Note that you have to wrap the proxy in a `MyContract` interface, because all calls will be delegated from the proxy to the contract with the implementation.

```js
let myContract = await MyContract.at(proxy.address);
const x0 = 42;
await myContract.initialize(x0);
console.log(await myContract.x()); // 42
```

5. Let's edit `MyContract.sol` to add a function called `y`:

```sol
import "zos-lib/contracts/migrations/Initializable.sol";

contract MyContract is Initializable {
  uint256 public x;

  function initialize(uint256 _x) isInitializer public {
    x = _x;
  }

  function y() public pure returns (uint256) {
    return 1337;
  }

}
```

Note that when we update our contract's code, we can't change its pre-existing storage structure. This means we can't remove any previously existing contract variable. We can, however, remove functions we don't want to use anymore (in the code shown, all functions were preserved).

6. Next, we deploy our new version, and upgrade our proxy to use this implementation:

```js
const myContract_v1 = await MyContract.new();
await proxy.upgradeTo(myContract_v1.address);
myContract = await MyContract.at(proxy.address);

console.log(await myContract.x()); // 42
console.log(await myContract.y()); // 1337

```

Wohoo! We've upgraded our contract's behavior while preserving it's storage.

[For a fully working project with this example, see the `examples/single` folder](examples/single).

[For a more complex example of an application with multiple contracts and a standard librar, see the `examples/complex` foder](examples/complex).

[To learn more about how proxies work under the hood, read this post on our blog](https://blog.zeppelinos.org/proxy-patterns/).

## License

[MIT](LICENSE) © 2018 [Zeppelin](https://zeppelin.solutions/)