var temp = require('temp');
var path = require('path');
var fs = require('fs');
var util = require('util');
var miracle_max = require('../index');

var orig_cwd = fs.realpathSync('./');
module.exports = {
  setUp: function(callback) {
    var temp_dir = temp.mkdirSync().dir;
    this.temp_dir = temp_dir;
    process.cwd(temp_dir);
    callback();
  },

  tearDown: function(callback) {
    process.cwd(orig_cwd);
    temp.cleanup();
    callback();
  },

  testInit: function(test) {
    miracle_max.init();
    var config = JSON.parse(fs.readFileSync(path.join(this.tmp_dir, 'static-config.json')));
    test.ok(config);
    test.equal('./content', config.content);
    test.equal('./static', config.static);
    test.equal('./sitemap.json', config.sitemap);
    test.done();
  },

  testLoadConfiguration: function(test) {
    miracle_max.init();
    var config = miracle_max.loadConfiguration();
    test.equal(config.static_config.content, './content');
    test.equal(config.static_config.static, './static');
    test.equal(config.static_config.sitemap, './sitemap.json');
    test.equal(config.content_path, './content');
    test.equal(config.layout_path, './content/layouts');
    test.done();
  },

  testLoadCustomConfiguration: function(test) {
    var customConfig = {
      'content': './views',
      'static': './staticcontent',
      'sitemap': './sitemap.json'
    };
    fs.writeFileSync(path.join(this.tmp_dir, 'static-config.json'), JSON.stringify(customConfig, null, 2));
    fs.writeFileSync(path.join(this.tmp_dir, 'sitemap.json'), '{}');

    var config = miracle_max.loadConfiguration();

    test.equal(config.static_config.content, './views');
    test.equal(config.static_config.static, './staticcontent');
    test.equal(config.static_config.sitemap, './sitemap.json');
    test.equal(config.content_path, './views');
    test.equal(config.layout_path, './views/layouts');
    test.done();
  },
}