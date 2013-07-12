var assert = require('assert');
var nodeTemp = require('temp');
var ncp = require('ncp');
var path = require('path');
var fs = require('fs');

describe('sitemap-router.js', function () {
  var cwd = process.cwd();

  var sitemap = {
    "/index": {},
    "/about": {}
  };

  var config;

  beforeEach(function (done) {
    tempDir = nodeTemp.mkdirSync();

    ncp(path.resolve(__dirname, 'res'), tempDir, function (err) {
      process.chdir(tempDir);
      config = require('../lib/config')();

      done();
    });
  });

  afterEach(function (done) {
    process.chdir(cwd);
    nodeTemp.cleanup();
    done();
  });

  it('verify object sitemap', function () {

    var sitemapRouter = require('../lib/sitemap-router')(config.sitemapFile);
    var paths = sitemapRouter.map.get.map(function(route) {
      return route.path;
    });
    assert.deepEqual(Object.keys(config.sitemap), paths);
  });

  // TODO(philpott): Write a test to verify sitemap update.
});