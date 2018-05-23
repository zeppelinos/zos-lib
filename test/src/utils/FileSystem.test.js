'use strict'
require('../../setup')

import FileSystem from '../../../src/utils/FileSystem'

var tmp = require('tmp');

contract.only('FileSystem', () => {
  it('can remove an empty directory', async function () {
    var testDir = tmp.dirSync()
    FileSystem.exists(testDir.name).should.be.true
    FileSystem.rmtree(testDir.name)
    FileSystem.exists(testDir.name).should.be.false
  })

  it('can remove a non-empty directory', async function () {
    var testDir = tmp.dirSync()
    var testFilePath = `${testDir.name}/testfile`
    FileSystem.write(testFilePath, 'dummy')
    FileSystem.exists(testFilePath).should.be.true
    FileSystem.rmtree(testDir.name)
    FileSystem.exists(testDir.name).should.be.false
  })

})
