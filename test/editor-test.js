var assert = require('assert');
var fs = require('fs');
var nodeTemp = require('temp');
var path = require('path');
var ncp = require('ncp');
var request = require('request');
var util = require('util');

describe('editor-test.js', function () {
  var cwd = process.cwd();
  var port = 9999;
  var siteUrl = util.format("http://localhost:%s", port);
  var editor;
  var tempDir;
  var server;

  beforeEach(function (done) {
    tempDir = nodeTemp.mkdirSync();
    ncp(path.resolve(__dirname, 'res'), tempDir, function (err) {
      process.chdir(tempDir);
      editor = require('../lib/editor')(require('../lib/config')());
      server = require('http').createServer(editor);
      server.listen(port, done);
    });
  });

  afterEach(function (done) {
    process.chdir(cwd);
    server.close(done);
    nodeTemp.cleanup();
  });

  it('sitemap is rendered', function (done) {
    request.get(siteUrl + "/_sitemap/", function(e, r, body) {
      assert.ifError(e);
      assert.ok(body.indexOf("html") >= 0);
      done();
    });
  });

  it('page list is returned', function (done) {
    request.get(siteUrl + "/_sitemap/pages", function(e, r, body) {
      assert.ifError(e);
      var response = JSON.parse(body);
      assert.equal(2, response.length);
      assert.equal("/index", response[0].path);
      assert.equal("/about", response[1].path);
      done();
    });
  });

  it('creates a page', function (done) {
    var req = {
      url: siteUrl + "/_sitemap/create",
      json: {
        path: "/foo"
      }
    }
    request.post(req, function(e, r, body) {
      assert.ok(fs.existsSync('views/foo.jade'));
      assert.equal(3, body.length)
      assert.equal(body[2].path, "/foo");
      done();
    });
  });

  it('creates a page forgetting the first slash', function (done) {
    var req = {
      url: siteUrl + "/_sitemap/create",
      json: {
        path: "foo2"
      }
    }
    request.post(req, function(e, r, body) {
      assert.ok(fs.existsSync('views/foo2.jade'));
      assert.equal(3, body.length)
      console.log(body);
      assert.equal(body[2].path, "/foo2");
      done();
    });
  });

  it('deletes a page', function (done) {
    var req = {
      url: siteUrl + "/_sitemap/create",
      json: { path: "/foo" }
    }
    request.post(req, function(e, r, body) {
      var req = {
        url: siteUrl + "/_sitemap/delete",
        json: { path: "/foo" }
      }
      request.post(req, function(e, r, body) {
        assert.ok(!fs.existsSync('views/foo.jade'));
        done();
      });
    });
  });
});
