# Develop and operate a complex upgradeable app

Note: This shows a low-level manual method of developing a complex upgradeable smart contract application. You probably want to use [the higher-level CLI guide](https://github.com/zeppelinos/zos-cli/blob/master/README.md) instead, but feel free to continue reading if you want to understand the core contracts of `zos-lib`.

Most real-world applications require more than a single smart contract. Here's how to build a complex upgradeable app with multiple smart contracts and connect it to the zOS standard libraries:

1. Let's imagine we want to build a simple donation application where we give donors some sort of recognition. An initial version of the contract can look like so:

```sol
pragma solidity ^0.4.21;

import "openzeppelin-zos/contracts/ownership/Ownable.sol";
import "openzeppelin-zos/contracts/math/SafeMath.sol";

contract DonationsV1 is Ownable {
  using SafeMath for uint256;

  // Keeps a mapping of total donor balances.
  mapping(address => uint256) public donorBalances;

  function donate() payable public {
    require(msg.value > 0);

    // Update user donation balance.
    donorBalances[msg.sender] = donorBalances[msg.sender].add(msg.value);
  }

  function getDonationBalance(address _donor) public view returns (uint256) {
    return donorBalances[_donor];
  }

  function withdraw(address _wallet) onlyOwner {
    // Withdraw all donated funds.
    _wallet.transfer(this.balance);
  }
}
```

2. We want to use `zos-lib` to deploy this contract with upgradeability capabilities. Given this will probably be a complex application and we'll want to use the zOS standard libraries, we'll use the `App` contract. This contract will live in the blockchain and manage the different versions of our smart contract code and upgradeability proxies. It's the single entry point to manage our application's contract's upgradeability and instances. Let's create and configure it:

```js
  // On-chain, single entry point of the entire application.
  log.info("<< Setting up App >>")
  const initialVersion = '0.0.1'
  return await AppDeployer.call(initialVersion)
```

3. Next, we need to deploy the first version of the app contracts. To do so, we register the implementation of our `DonationsV1` in the `App` and request it to create a new upgradeable proxy for it. Let's do it:

```js
  const contractName = "Donations";
  const DonationsV1 = Contracts.getFromLib('DonationsV1')
  await app.setImplementation(DonationsV1, contractName);
  return await app.createProxy(DonationsV1, contractName, 'initialize', [owner])
```

4. Now let's suppose we want to give some sort of retribution to people donating money to our donation campaign. We want to mint new ERC721 cryptocollectibles for every received donation. To do so, we'll link our application to a zOS standard library release that contains an implementation of a mintable ERC721 token. Here's the new contract code:

```sol
pragma solidity ^0.4.21;

import "./DonationsV1.sol";
import "openzeppelin-zos/contracts/token/ERC721/MintableERC721Token.sol";

contract DonationsV2 is DonationsV1 {
  using SafeMath for uint256;

  // ERC721 non-fungible tokens to be emitted on donations.
  MintableERC721Token public token;
  uint256 public numEmittedTokens;

  function setToken(MintableERC721Token _token) external {
    require(_token != address(0));
    require(token == address(0));
    token = _token;
  }

  function donate() payable public {
    super.donate();

    // Emit a token.
    token.mint(msg.sender, numEmittedTokens);
    numEmittedTokens = numEmittedTokens.add(1);
  }
}
```

5. What we need to do next is link our application to the zOS standard library release containing that mintable ERC721 implementation, and set it to our upgradeable contract. To do so, we create a new version of our application in the `App`, register a new `AppDirectory` containing the new version of our contract implementation, and then set the standard library version of ERC721 to our upgradeable contract. Let's see how:

```js
  // Address of the zOS standard library.
  const stdlib = "0xA739d10Cc20211B973dEE09DB8F0D75736E2D817";
  const secondVersion = '0.0.2'
  await app.newVersion(secondVersion, await getStdLib(txParams))
  const DonationsV2 = Contracts.getFromLib('DonationsV2')
  await app.setImplementation(DonationsV2, contractName);
  await app.upgradeProxy(donations.address, null, contractName)
  donations = DonationsV2.at(donations.address)

  // Add an ERC721 token implementation to the project, request a proxy for it,
  // and set the token on "Donations".
  log.info(`Creating ERC721 token proxy to use in ${contractName}...`)
  const token = await app.createProxy(
    MintableERC721Token,
    tokenClass,
    'initialize',
    [donations.address, tokenName, tokenSymbol]
  )
  log.info(`Token proxy created at ${token.address}`)
  log.info("Setting application's token...")
  await donations.setToken(token.address, txParams)
  log.info("Token set succesfully")
  return token;
```

That's it! We now have the same contract, retaining the original balance, and storage, but with an upgraded code. The upgradeable contract is also linked to an on-chain upgradeable standard library containing an implementation of a mintable ERC721 token. State of the art!
