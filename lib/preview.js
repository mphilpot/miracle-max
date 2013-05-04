var express = require('express');
var expressValidator = require('express-validator');
var fs = require('fs')
var jade = require('jade');
var Path = require('path');
var util = require('util');
var less = require('less');
var url = require('url');

module.exports = function(config) {
  var previewApp = express();

  // Should this be a standard filter processor?
  previewApp.use(function(req, res, next) {
    var regex = {
      handle: /\.less$/,
      compress: /(\.|-)min\.less$/
    };

    if (!regex.handle.test(url.parse(req.url).pathname)) {
      next();
    } else {
      var sendCss = function (parseError, css) {
        res.header('Content-Type', 'text/css');
        res.send(parseError || css);
      };

      toCSS({}, Path.join(config.public, req.path), sendCss);
    }
  });

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

function toCSS(options, path, callback) {
  var tree, css;
  options = options || {};
  fs.readFile(path, 'utf8', function (e, str) {
      if (e) { return callback(e) }

      options.paths = [require('path').dirname(path)];
      options.filename = require('path').resolve(process.cwd(), path);
      options.optimization = options.optimization || 0;

      new(less.Parser)(options).parse(str, function (err, tree) {
          if (err) {
              callback(err);
          } else {
              try {
                  css = tree.toCSS(options);
                  callback(null, css);
              } catch (e) {
                  callback(e);
              }
          }
      });
  });
}
