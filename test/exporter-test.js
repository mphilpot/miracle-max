var assert = require('assert');
var fs = require('fs');
var nodeTemp = require('temp');
var path = require('path');
var ncp = require('ncp');
var request = require('request');
var util = require('util');

describe('exporter-test.js', function () {
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

  it('exports pages', function (done) {
    request.get(siteUrl + "/_sitemap/export", function(e, r, body) {
      assert.ifError(e);
      var response = JSON.parse(body);
      assert.equal(response.status, 'success');
      assert.ok(fs.existsSync(path.join(tempDir, 'out', '/index.html')));
      assert.ok(fs.existsSync(path.join(tempDir, 'out', '/about.html')));
      assert.ok(fs.existsSync(path.join(tempDir, 'out', 'css/s.css')));
      done();
    });
  });

  it('exports less', function (done) {
    request.get(siteUrl + "/_sitemap/export", function(e, r, body) {
      assert.ifError(e);
      var response = JSON.parse(body);
      assert.equal(response.status, 'success');
      var lessFile = path.join(tempDir, 'out', 'css/l.less');
      assert.ok(fs.existsSync(lessFile));
      var lessContents = fs.readFileSync(lessFile).toString();
      assert.equal('body {\n  color: #ff0000;\n}', lessContents.trim());
      done();
    });
  });
});
