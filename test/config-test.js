var assert = require('assert');
var fs = require('fs');
var nodeTemp = require('temp');
var path = require('path');

describe('config-test.js', function () {
  var cwd = process.cwd();
  var tempDir;

  var configJson = JSON.stringify({
    public: 'static',
    views: 'template',
    sitemap: 'sitemap.json',
    port: 8888
  });

  var sitemapJson = JSON.stringify({
    "/index": {},
    "/about": {}
  });

  before(function () {
    var tempDir = nodeTemp.mkdirSync();
    process.chdir(tempDir);
  });

  after(function () {
    nodeTemp.cleanup();
    process.chdir(cwd);
  });

  it('use default if no configuration file exists', function () {
    fs.writeFileSync(path.resolve(tempDir, 'sitemap.json'), sitemapJson);
    var config = require('../lib/config')();
    assert.deepEqual(JSON.parse(sitemapJson), config.sitemap)
    assert.equal(path.resolve(tempDir, 'public'), config.public);
    assert.equal(path.resolve(tempDir, 'views'), config.views);
    assert.equal(8888, config.port);
  });

  it('loads default configuration file location', function () {
    fs.writeFileSync(path.resolve(tempDir, '.miraclemax.config'), configJson);
    fs.writeFileSync(path.resolve(tempDir, 'sitemap.json'), sitemapJson);
    var config = require('../lib/config')();
    assert.deepEqual(JSON.parse(sitemapJson), config.sitemap)
    assert.equal(path.resolve(tempDir, 'static'), config.public);
    assert.equal(path.resolve(tempDir, 'template'), config.views);
  });

  it('loads custom configuration path', function () {
    fs.writeFileSync(path.resolve(tempDir, 'miraclemax.config'), configJson);
    fs.writeFileSync(path.resolve(tempDir, 'sitemap.json'), sitemapJson);
    var config = require('../lib/config')('miraclemax.config');
    assert.deepEqual(JSON.parse(sitemapJson), config.sitemap)
    assert.equal(path.resolve(tempDir, 'static'), config.public);
    assert.equal(path.resolve(tempDir, 'template'), config.views);
  });
});

function copyFile(target, destDir, destName) {
  var fileName = path.basename(target);
  console.log("writing %s", path.resolve(destDir, destName || fileName))
  fs.writeFileSync(path.resolve(destDir, destName || fileName),
      fs.readFileSync(target));
}
