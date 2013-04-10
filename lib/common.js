var Path = require('path');

module.exports.PREVIEW_PUBLIC = Path.resolve('./', '../public');
module.exports.PREVIEW_VIEWS = Path.resolve('./', '../views');
module.exports.SITEMAP = Path.resolve('./', '../sitemap.json');

module.exports.public = module.exports.PREVIEW_PUBLIC;
module.exports.views = module.exports.PREVIEW_VIEWS;
module.exports.sitemap = module.exports.SITEMAP;
