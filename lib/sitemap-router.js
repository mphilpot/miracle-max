var express = require('express');
var fs = require('fs');
var path = require('path');

module.exports = function(sitemap) {
  var router = new express.Router();

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

  return router;
}
