// module information
const version = 'v' + require('../package.json').version

// helpers
import decodeLogs from './helpers/decodeLogs'
import encodeCall from './helpers/encodeCall'
import assertRevert from './helpers/assertRevert'

// utils
import Logger from './utils/Logger'
import FileSystem from './utils/FileSystem'
import Contracts from './utils/Contracts'

// test behaviors
import behaviors from './test'

// app management
import App from './app/App'

// package
import PackageWrapper from './package/PackageWrapper'
import PackageDeployer from './package/PackageDeployer'
import PackageProvider from './package/PackageProvider'

export {
  version,
  decodeLogs,
  encodeCall,
  assertRevert,
  behaviors,
  Logger,
  FileSystem,
  Contracts,
  App,
  PackageWrapper,
  PackageDeployer,
  PackageProvider,
}
