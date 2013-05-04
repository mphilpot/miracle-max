var express = require('express');
var expressValidator = require('express-validator');
var fs = require('fs')
var jade = require('jade');
var lessMiddleware = require('less-middleware');
var Path = require('path');
var util = require('util');

module.exports = function(config) {
  var previewApp = express();

  previewApp.use(lessMiddleware({
      src: config.public,
      compress: true
  }));

  previewApp.use(express.static(config.public));

  // TODO(philpott): Need to figure how to do a filter :)
  previewApp.use(function(req, res, next) {
    var params = res.params || {};
    var isCompiled = !!params.compiled;
    var isClean = !!params.compiled;

    res.locals.link = function(href, opt_class) {
      var link = opt_class ? 'a.' + opt_class : 'a';
      href = isCompiled && !isClean ? href + '.html' : href;
    };
    next();
  });

  previewApp.set('view engine', 'jade');
  previewApp.set('views', config.views);

  previewApp.use('', require('./sitemap-router')(config.sitemap).middleware);
  return previewApp;
};
