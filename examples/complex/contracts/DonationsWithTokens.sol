pragma solidity ^0.4.21;

import "./Donations.sol";
import "zeppelin-zos/contracts/token/ERC721/ERC721Token.sol";

contract DonationsWithTokens is Donations {

  // Keeps track of the highest donation.
  uint256 public highestDonation;

  // ERC721 non-fungible tokens to be emitted on donations.
  ERC721Token public token;
  uint256 public numEmittedTokens;

  function donate() payable public {
    super.donate();

    // Is this the highest donation?
    if(msg.value > highestDonation) {

      // Emit a token.
      token.mint(msg.sender, numEmittedTokens);
      numEmittedTokens++;

      highestDonation = msg.value;
    }
  }
}
