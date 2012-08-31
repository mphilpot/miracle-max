var temp = require('temp');
var path = require('path');
var fs = require('fs');
var util = require('util');
var miracle_max = require('../index');


module.exports = {
  setUp: function(callback) {
    this.tmp_dir = temp.mkdirSync().dir;
    callback();
  },

  tearDown: function(callback) {
    temp.cleanup();
    callback();
  },

  testInit: function(test) {
    miracle_max.init(this.tmp_dir);
    var config = JSON.parse(fs.readFileSync(path.join(this.tmp_dir, 'static-config.json')));
    test.ok(config);
    test.equal('./content', config.content);
    test.equal('./static', config.static);
    test.equal('./sitemap.json', config.sitemap);
    test.done();
  },

  testLoadConfiguration: function(test) {
    miracle_max.init(this.tmp_dir);
    var config = miracle_max.loadConfiguration(this.tmp_dir);
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

    var config = miracle_max.loadConfiguration(this.tmp_dir);

    test.equal(config.static_config.content, './views');
    test.equal(config.static_config.static, './staticcontent');
    test.equal(config.static_config.sitemap, './sitemap.json');
    test.equal(config.content_path, './views');
    test.equal(config.layout_path, './views/layouts');
    test.done();
  },
}