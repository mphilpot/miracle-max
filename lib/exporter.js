var request = require('request');
var ncp = require('ncp');
var temp = require('temp');
var async = require('async');
var util = require('util');
var fs = require('fs');
var Path = require('path')
var express = require('express');
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var less = require('less');

// TODO LIST
// - export to zip file
// - needs to skip dynamic pages (only for sbo?)
// - Only supports html exports

module.exports = function(config) {
  var router = new express.Router();

  var exportRequest = function(req, res) {
    if (!fs.existsSync(config.out)) {
      fs.mkdirSync(config.out);
    }

    var responseCallback = function(err) {
      res.send({'status': err ? 'error' : 'success'});
    }

    async.series([
      copyPublicFiles,
      copyLessFiles,
      copySitePages
    ], responseCallback);
  };

  function copyPublicFiles(callback) {
    ncp(config.public, config.out, callback);
  };

  function copyLessFiles(callback) {
    var lessFiles = glob.sync(Path.join(config.public, '**/*.less'));
    var renderFile = function(lessFile) {
      return function(done) {
        var writeFile = function(err, css) {
          if (err) {
            done(err);
          }
          var outputFile = lessFile.replace(config.public, config.out);
          fs.writeFile(outputFile, css, done);
        }
        toCSS({}, lessFile, writeFile);
      }
    };

    var conversionQueue = [];
    lessFiles.forEach(function(file) {
      conversionQueue.push(renderFile(file));
    });

    async.series(conversionQueue, callback);
  }

  function copySitePages(callback) {
    var server = util.format('http://localhost:%s%s', config.port);
    var sitemap = config.sitemap;

    var pages = Object.keys(sitemap);
    var pageRequests = [];

    var requestPage = function(page) {
      return function(done) {
        request.get(util.format(server, page), function(e, r, b) {
          var dir = Path.join(config.out, Path.dirname(page));
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
          }
          fs.writeFile(Path.join(config.out, page) + '.html', b, done);
        });
      };
    };

    pages.forEach(function(page) {
      pageRequests.push(requestPage(page));
    });

    async.series(pageRequests, callback);
  }


  router.get('/export', exportRequest);

  return router;
}

// This needs to be moved to a common location
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
