var express = require('express');
var fs = require('fs');
var path = require('path');
var chokidar = require('chokidar');

module.exports = function(sitemapFile) {
  var router = new express.Router();

  var sitemap = JSON.parse(fs.readFileSync(sitemapFile));

  var watcher = chokidar.watch(sitemapFile, {});
  watcher.on('change', function(path, stats) {
    console.log('sitemap updated... time to reload')
    sitemap = JSON.parse(fs.readFileSync(sitemapFile));
    addPages(sitemap);
  });

  function addPages(sitemap) {
    // Clear previous routes.
    router.map = {};

    // Routes
    for (var path in sitemap) {
      if (sitemap.hasOwnProperty(path)) {
        (function(reqPath, options) {
          var page = options.ref || path;
          if (/^\//.test(page)) {
            page = page.substring(1, page.length);
          }
          var action = function(req, res) {
            res.render(page, options);
          };

          // TODO(philpott): How to handle this in a generic way.
          router.get(reqPath, action);
        })(path, sitemap[path] || {});
      }
    }
  }

  addPages(sitemap);

  return router;
}
