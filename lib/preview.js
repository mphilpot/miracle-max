var express = require('express');
var fs = require('fs')
var util = require('util');
var expressValidator = require('express-validator');
var Path = require('path');

module.exports = function(config) {
  var previewApp = express();
  previewApp.use(express.static(config.public));
  previewApp.set('view engine', 'jade');
  previewApp.set('views', config.views);
  previewApp.set('view options', { layout: false });

  // TODO(philpott): Need to figure how to do a filter :)
  previewApp.use(function(req, res, next) {
    res.locals.isLoggedIn = false;
    next();
  });

  previewApp.use('', require('./sitemap-router')(config.sitemap).middleware);
  return previewApp;
};
