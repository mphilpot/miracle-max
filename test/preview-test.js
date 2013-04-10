var assert = require('assert');
var fs = require('fs');
var nodeTemp = require('temp');
var path = require('path');
var ncp = require('ncp');
var request = require('request');
var util = require('util');

describe('preview-test.js', function () {
  var cwd = process.cwd();
  var port = 9999;
  var siteUrl = util.format("http://localhost:%s", port);
  var preview;
  var tempDir;
  var server;

  beforeEach(function (done) {
    tempDir = nodeTemp.mkdirSync();
    ncp(path.resolve(__dirname, 'res'), tempDir, function (err) {
      process.chdir(tempDir);
      preview = require('../lib/preview')(require('../lib/config')());
      server = require('http').createServer(preview);
      server.listen(port, done);
    });
  });

  afterEach(function (done) {
    process.chdir(cwd);
    server.close(done);
  });

  after(function () {
    nodeTemp.cleanup();
  });

  it('test index exists', function (done) {
    request(siteUrl + '/index', function(e, r, body) {
      assert.ifError(e);
      assert.equal('index', body.trim());
      // console.log(body)
      done();
    });
  });
});
