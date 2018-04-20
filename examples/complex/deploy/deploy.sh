#! /usr/bin/env bash

NETWORK=$1

# -----------------------------------------------------------------------
# Project setup and first implementation of an upgradeable Donations.sol
# -----------------------------------------------------------------------

echo "npx truffle compile"
npx truffle compile

# Initialize project
# NOTE: Creates a package.zos.json file that keeps track of the project's details
echo "zos init MyProject 0.0.1 --network $NETWORK"
zos init MyProject 0.0.1 --network $NETWORK

# Register Donations.sol in the project as an upgradeable contract.
echo "zos add-implementation DonationsV1 Donations --network $NETWORK"
zos add-implementation DonationsV1 Donations --network $NETWORK

# Deploy all implementations in the specified network.
# NOTE: Creates another package.zos.<network_name>.json file, specific to the network used, which keeps track of deployed addresses, etc.
echo "zos sync --network $NETWORK"
zos sync --network $NETWORK

# Request a proxy for the upgradeably Donations.sol
# NOTE: A dapp could now use the address of the proxy specified in package.zos.<network_name>.json
echo "zos create-proxy Donations --network $NETWORK"
zos create-proxy Donations --network $NETWORK

# -------------------------------------------------------------------------------
# New version of Donations.sol that uses an on-chain ERC721 token implementation
# -------------------------------------------------------------------------------

# Upgrade the project to a new version, so that new implementations can be registered
echo "zos new-version 0.0.2 --network $NETWORK"
zos new-version 0.0.2 --network $NETWORK
echo "zos add-implementation DonationsV2 Donations --network $NETWORK"
zos add-implementation DonationsV2 Donations --network $NETWORK

# Deploy all implementations in the specified network.
echo "zos sync --network $NETWORK"
zos sync --network $NETWORK

# Upgrade the existing contract proxy to use the new version
echo "zos upgrade-proxy Donations null --network $NETWORK"
zos upgrade-proxy Donations null --network $NETWORK
