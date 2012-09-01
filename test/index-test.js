var fs = require('fs');
var jade = require('jade');
var path = require('path');
var request = require('request');
var temp = require('temp');
var util = require('util');
var miracle_max = require('../index');

var orig_cwd = fs.realpathSync('./');
var TEST_PORT = 10001;
module.exports = {
  setUp: function(callback) {
    this.tmp_dir = temp.mkdirSync();
    process.chdir(this.tmp_dir);
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

  testLoadConfiguration: {
    defaultConfig: function(test) {
      miracle_max.init();
      var config = miracle_max.loadConfiguration();
      test.equal(config.static_config.content, './content');
      test.equal(config.static_config.static, './static');
      test.equal(config.static_config.sitemap, './sitemap.json');
      test.equal(config.content_path, './content');
      test.equal(config.layout_path, './content/layouts');
      test.done();
    },

    customConfiguration: function(test) {
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

    configFileDoesntExsist: function(test) {
      try {
        miracle_max.loadConfiguration();
        test.ok(false); // failure state
      } catch (err) {
        // expected exception
      }

      test.done();
    }
  },

  testCreatePage: {
    defaultSettings : function(test) {
      miracle_max.init();
      var config = miracle_max.loadConfiguration();

      var options = {
        path: 'test1'
      };
      miracle_max.createPage(options);
      var page_path = path.join(config.content_path, 'test1.jade');
      test.ok(fs.existsSync(page_path));
      test.equals(fs.readFileSync(page_path, 'utf8'),
        fs.readFileSync(miracle_max.PAGE_TEMPLATE, 'utf8'));
      var layout_path = path.join(config.layout_path, 'default.jade');
      test.equals(fs.readFileSync(layout_path, 'utf8'),
        fs.readFileSync(miracle_max.LAYOUT_TEMPLATE, 'utf8'));
      test.ok(fs.existsSync(layout_path));
      var sitemap = JSON.parse(fs.readFileSync(config.static_config.sitemap, 'utf8'));
      test.ok(sitemap.hasOwnProperty('/test1'));
      test.done();
    },

    customContentLocation: function(test) {
      var customConfig = {
        'content': './views',
        'static': './staticcontent',
        'sitemap': './sitemap.json'
      };
      fs.writeFileSync(path.join(this.tmp_dir, 'static-config.json'), JSON.stringify(customConfig, null, 2));
      fs.writeFileSync(path.join(this.tmp_dir, 'sitemap.json'), '{}');

      var config = miracle_max.loadConfiguration();

      var options = {
        path: 'test1'
      };
      miracle_max.createPage(options);
      test.ok(fs.existsSync(path.join(config.content_path, 'test1.jade')));
      test.ok(fs.existsSync(path.join(config.layout_path, 'default.jade')));
      test.done();
    },

    pageAlreadyExists: function(test) {
      miracle_max.init();
      var config = miracle_max.loadConfiguration();

      var page_path = path.join(config.content_path, 'test1.jade')
      fs.mkdirSync(config.content_path);
      fs.writeFileSync(page_path, "");

      var options = {
        path: 'test1'
      };

      miracle_max.createPage(options);
      test.equals("", fs.readFileSync(page_path));

      test.done();
    },

    layoutAlreadyExists: function(test) {
      miracle_max.init();
      var config = miracle_max.loadConfiguration();

      var layout_path = path.join(config.layout_path, 'default.jade')
      fs.mkdirSync(config.content_path);
      fs.mkdirSync(config.layout_path);
      fs.writeFileSync(layout_path, "");

      var options = {
        path: 'test1'
      };

      miracle_max.createPage(options);
      test.equals("", fs.readFileSync(layout_path));

      test.done();
    },
  },

  testCreateLayout: function(test) {
    miracle_max.init();
    var config = miracle_max.loadConfiguration();

    var options = {
      layout: 'test1'
    };
    miracle_max.createLayout(options);
    var layout_path = path.join(config.layout_path, 'test1.jade');
    test.ok(fs.existsSync(layout_path));
    test.equals(fs.readFileSync(layout_path, 'utf8'),
      fs.readFileSync(miracle_max.LAYOUT_TEMPLATE, 'utf8'));
    test.done();
  },

  testRunDevServer: {
    serverStarted: function(test) {
      miracle_max.init();
      miracle_max.runDevServer({port: TEST_PORT});
      request.get('http://localhost:' + TEST_PORT + '/healthz', function(e, r, body) {
        test.ifError(e);
        test.equals(body, 'ok');
        miracle_max.stopDevServer();
        test.done();
      });
    },

    servesFromSitemap: function(test) {
      miracle_max.init();
      var config = miracle_max.loadConfiguration();
      miracle_max.createPage({path: 'test1'})
      miracle_max.runDevServer({port: TEST_PORT});
      request.get('http://localhost:' + TEST_PORT + '/test1', function(e, r, body) {
        test.ifError(e);
        var requested_file = path.join(config.content_path, 'test1.jade');
        var rendered_template = jade.compile(fs.readFileSync(requested_file), {filename: requested_file})({});
        test.equals(body + '', rendered_template + '');
        miracle_max.stopDevServer();
        test.done();
      });
    },

    servesJade: function(test) {
      miracle_max.init();
      var config = miracle_max.loadConfiguration();
      miracle_max.createPage({path: 'test1'})
      miracle_max.runDevServer({port: TEST_PORT});
      request.get('http://localhost:' + TEST_PORT + '/test1.jade', function(e, r, body) {
        test.ifError(e);
        var requested_file = path.join(config.content_path, 'test1.jade');
        var rendered_template = jade.compile(fs.readFileSync(requested_file), {filename: requested_file})({});
        test.equals(body + '', rendered_template + '');
        miracle_max.stopDevServer();
        test.done();
      });
    },

    servesStatic: function(test) {
      // initialize the server
      miracle_max.init();
      var config = miracle_max.loadConfiguration();

      // Create the static file
      fs.mkdirSync(config.static_config.static);
      fs.writeFileSync(path.join(config.static_config.static, 'test.txt'), 'test');
      test.ok(fs.existsSync(path.join(config.static_config.static, 'test.txt')));

      miracle_max.runDevServer({port: TEST_PORT});
      request.get('http://localhost:' + TEST_PORT + '/test.txt', function(e, r, body) {
        test.ifError(e);
        test.equals(body, 'test');
        miracle_max.stopDevServer();
        test.done();
      });
    }
  }
}