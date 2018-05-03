'use strict';

const zos = module.exports;

// module information
zos.version = 'v' + require('../package.json').version;

// helpers
zos.decodeLogs = require('./src/herlpers/decodeLogs')
zos.encodeCall = require('./src/herlpers/encodeCall')
zos.assertRevert = require('./src/herlpers/assertRevert')

// utils
zos.Logger = require('./src/utils/Logger')
zos.ContractsProvider = require('./src/utils/ContractsProvider')

// app management
zos.AppManagerWrapper = require('./src/app_manager/AppManagerWrapper')
zos.AppManagerDeployer = require('./src/app_manager/AppManagerDeployer')
zos.AppManagerProvider = require('./src/app_manager/AppManagerProvider')

// distribution
zos.DistributionWrapper = require('./src/distribution/DistributionWrapper')
zos.DistributionDeployer = require('./src/distribution/DistributionDeployer')
zos.DistributionProvider = require('./src/distribution/DistributionProvider')
