var express = require('express');
var fs = require('fs')
var util = require('util');
var expressValidator = require('express-validator');
var Path = require('path');
var brackets = require('brackets');

var JADE_TEMPLATE = fs.readFileSync(Path.join(__dirname, './template.jade'));

module.exports = function(config) {
  var siteEditor = express();
  siteEditor.use(express.bodyParser());
  siteEditor.use(expressValidator);
  siteEditor.set('view engine', 'jade');
  siteEditor.set('views', Path.join(__dirname, 'views'));
  siteEditor.set('view options', { layout: false });
  siteEditor.use('/_sitemap/', express.static(Path.join(__dirname, 'public')));
  siteEditor.use('/_sitemap/', require('./exporter')(config).middleware);
  siteEditor.get('/_sitemap/', function(request, response) {
    response.render('sitemap');
  });

  siteEditor.get('/_sitemap/pages', function(request, response) {
    response.json(createPageList(config.sitemap));
  });

  siteEditor.post('/_sitemap/create', function(request, response) {
    var path = request.sanitize("path").trim();
    var view = Path.join(config.views, path + '.jade');
    var dir = Path.dirname(view);
    var sitemap = config.sitemap;

    if (!sitemap[path] && !fs.existsSync(view)) {
      sitemap[path] = {};
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      fs.writeFileSync(view, JADE_TEMPLATE);
      writeJson(config.sitemapFile, sitemap);
    }
    config.reload();
    response.json(createPageList(config.sitemap));
  });

  siteEditor.post('/_sitemap/delete', function(request, response) {
    var path = request.sanitize("path").trim();
    var view = Path.join(config.views, path + '.jade');
    var dir = Path.dirname(path);
    var sitemap = config.sitemap;

    if (sitemap[path] && fs.existsSync(view)) {
      delete sitemap[path];
      fs.unlinkSync(view);
      writeJson(config.sitemapFile, sitemap);
      config.reload();
    }
    response.json(createPageList(sitemap));
  });

  return siteEditor;
};

function writeJson(file, object) {
  fs.writeFileSync(file, JSON.stringify(object, null, 2) + "\n");
}

function createPageList(sitemap) {
  var pages = [];
  Object.keys(sitemap).forEach(function(key) {
    var page = { path: key, options: sitemap[key]};
    pages.push(page);
  });
  return pages;
}
