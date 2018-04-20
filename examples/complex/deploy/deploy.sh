#! /usr/bin/env bash

# TODO: pass network as parameter

# -----------------------------------------------------------------------
# Project setup and first implementation of an upgradeable Donations.sol
# -----------------------------------------------------------------------

echo "npx truffle compile"
npx truffle compile

# Initialize project
# NOTE: Creates a package.zos.json file that keeps track of the project's details
echo "zos init MyProject 0.0.1 --network local"
zos init MyProject 0.0.1 --network local

# Register Donations.sol in the project as an upgradeable contract.
echo "zos add-implementation DonationsV1 Donations --network local"
zos add-implementation DonationsV1 Donations --network local

# Deploy all implementations in the specified network.
# NOTE: Creates another package.zos.<network_name>.json file, specific to the network used, which keeps track of deployed addresses, etc.
echo "zos sync --network local"
zos sync --network local

# Request a proxy for the upgradeably Donations.sol
# NOTE: A dapp could now use the address of the proxy specified in package.zos.<network_name>.json
echo "zos create-proxy Donations --network local"
zos create-proxy Donations --network local

# -------------------------------------------------------------------------------
# New version of Donations.sol that uses an on-chain ERC721 token implementation
# -------------------------------------------------------------------------------

# Upgrade the project to a new version, so that new implementations can be registered
echo "zos new-version 0.0.2 --network local"
zos new-version 0.0.2 --network local
echo "zos add-implementation DonationsV2 Donations --network local"
zos add-implementation DonationsV2 Donations --network local

# Deploy all implementations in the specified network.
echo "zos sync --network local"
zos sync --network local

# Upgrade the existing contract proxy to use the new version
echo "zos upgrade-proxy Donations null --network local"
zos upgrade-proxy Donations null --network local
