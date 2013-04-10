var fs = require('fs');
var path = require('path');

function Config(params) {
  this.sitemapFile = params.sitemapFile;
  this.sitemap = params.sitemap;
  this.public = params.public;
  this.views = params.views;
  this.port = params.port || 8888;
}

Config.prototype.reload = function() {
  this.sitemap = JSON.parse(fs.readFileSync(this.sitemapFile));
}

module.exports = function(configPath) {
  configPath = configPath || '.miraclemax.config';
  var cwd = process.cwd();

  var fullConfigPath = path.join(cwd, configPath);

  var config = {
    public: 'public',
    views: 'views',
    sitemap: 'sitemap.json',
    port: 8888
  }

  if (fs.existsSync(fullConfigPath)) {
    config = JSON.parse(fs.readFileSync(fullConfigPath));
  }

  var sitemapFile = path.resolve(cwd, config.sitemap);
  return new Config({
    sitemapFile: sitemapFile,
    sitemap: JSON.parse(fs.readFileSync(sitemapFile)),
    public: path.resolve(cwd, config.public),
    views: path.resolve(cwd, config.views),
    port: config.port
  });
}
