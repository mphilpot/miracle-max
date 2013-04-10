var assert = require('assert');

describe('sitemap-router.js', function () {
  var cwd = process.cwd();

  var sitemap = {
    "/index": {},
    "/about": {}
  };

  it('verify object sitemap', function () {

    var sitemapRouter = require('../lib/sitemap-router')(sitemap);
    var paths = sitemapRouter.map.get.map(function(route) {
      return route.path;
    });
    assert.deepEqual(Object.keys(sitemap), paths);
  });
});
