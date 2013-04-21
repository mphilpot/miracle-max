var assert = require('assert');
var fs = require('fs');
var nodeTemp = require('temp');
var path = require('path');
var ncp = require('ncp');
var request = require('request');
var util = require('util');


describe('index-test.js', function () {
  var cwd = process.cwd();
  var port = 9999;
  var siteUrl = util.format("http://localhost:%s", port);
  var tempDir;
  var index;

  beforeEach(function (done) {
    tempDir = nodeTemp.mkdirSync();
    ncp(path.resolve(__dirname, 'res'), tempDir, function (err) {
      process.chdir(tempDir);
      index = require('../index')
      done();
    });
  });

  afterEach(function (done) {
    process.chdir(cwd);
    nodeTemp.cleanup();
  });

  it('Server is defined', function (done) {
    var server = new index.Server(index.Config());
    server.start(function() {
      server.stop();
    });
  });
});