var request = require('request');
var ncp = require('ncp');
var temp = require('temp');
// var zip = require('node-zip');
var async = require('async');
var util = require('util');
var fs = require('fs');
var Path = require('path')

var express = require('express');
var fs = require('fs');
var path = require('path');

// TODO LIST
// - export to zip file
// - needs to skip dynamic pages (only for sbo?)
// - Only supports html exports

module.exports = function(config) {
  var router = new express.Router();

  var exportRequest = function(req, res) {
    fs.mkdirSync(config.out);
    var responseCallback = function(err) {
      res.send({'status': err ? 'error' : 'success'});
    }

    async.series([
      copyPublicFiles,
      copySitePages
    ], responseCallback);
  };

  function copyPublicFiles(callback) {
    ncp(config.public, config.out, callback);
  };

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
