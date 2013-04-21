var assert = require('assert');
var fs = require('fs');
var nodeTemp = require('temp');
var path = require('path');
var ncp = require('ncp');
var request = require('request');
var util = require('util');

describe('server-test.js', function () {
  var cwd = process.cwd();
  var siteUrl = "http://localhost:9999"
  var editor;
  var tempDir;
  var server;

  beforeEach(function (done) {
    tempDir = nodeTemp.mkdirSync();
    ncp(path.resolve(__dirname, 'res'), tempDir, function (err) {
      process.chdir(tempDir);
      var Server = require('../lib/server');
      server = new Server(require('../lib/config')());
      server.start(done);
    });
  });

  afterEach(function (done) {
    process.chdir(cwd);
    server.stop(done);
    nodeTemp.cleanup();
  });

  it('serves sitemaps', function (done) {
    request.get(siteUrl + "/_sitemap/pages", function(e, r, body) {
      assert.ifError(e);
      var response = JSON.parse(body);
      assert.equal(2, response.length);
      assert.equal("/index", response[0].path);
      assert.equal("/about", response[1].path);
      done();
    });
  });

  it('serves preview', function (done) {
    request(siteUrl + '/index', function(e, r, body) {
      assert.ifError(e);
      assert.equal('index', body.trim());
      done();
    });
  });

  it('serves brackets', function (done) {
    request(siteUrl + '/_sitemap/brackets/', function(e, r, body) {
      assert.ifError(e);
      assert.ok(body.indexOf('CodeMirror') >= 0);
      done();
    });
  });
});
