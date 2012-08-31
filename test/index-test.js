var temp = require('temp');
var path = require('path');
var fs = require('fs');
var miracle_max = require('../index');


module.exports = {
  setUp: function(callback) {
    this.tmp_dir = temp.mkdirSync();
    callback();
  },

  tearDown: function(callback) {
    temp.cleanup();
    callback();
  },

  testInit: function(test) {
    miracle_max.init(temp.dir);
    var config = JSON.parse(fs.readFileSync(path.join(temp.dir, 'static-config.json')));
    test.ok(config);
    test.equal('./content', config.content);
    test.equal('./static', config.static);
    test.equal('./sitemap.json', config.sitemap);
    test.done();
  },

  testLoadConfiguration: function(test) {
    miracle_max.init(temp);
    var config = miracle_max.loadConfiguration(temp.dir);
    test.equal(config.static_config.content, './content');
    test.equal(config.static_config.static, './static');
    test.equal(config.static_config.sitemap, './sitemap.json');
    test.equal(config.content_path, './content');
    test.equal(config.layout_path, './content/layouts');
    test.done();
  }
}