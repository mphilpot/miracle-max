var fs = require('fs');
var jade = require('jade');
var path = require('path');
var program = require('commander');
var sitemap = require('nconf');
var staticLoader = require('node-static');
var util = require('util');

var CONFIG_PATH = exports.CONFIG_PATH = './static-config.json';
var SITEMAP_PATH = exports.SITEMAP_PATH = './sitemap.json';
var PAGE_TEMPLATE = exports.PAGE_TEMPLATE = path.join(__dirname, 'templates/content.jade');
var LAYOUT_TEMPLATE = exports.LAYOUT_TEMPLATE = path.join(__dirname, 'templates/layout.jade');

/********************************************************************
 * Command functions
 ********************************************************************/

var init = exports.init = function() {
  var config = {
    'content': './content',
    'static': './static',
    'dynamicHelpers': {}
  };
  writeJson(CONFIG_PATH, config);
  writeJson(SITEMAP_PATH, {});
}

var createPage = exports.createPage = function(options) {
  var config = loadConfiguration();

  if ( !! !options.path) {
    console.log('-n not specified.');
    return;
  }

  if (!(/^\//.test(options.path))) {
    options.path = '/' + options.path;
  }

  var page_file = path.join(config.content_path, options.path + '.jade');
  var layout_file = path.join(config.layout_path, 'default' + '.jade');

  if (fs.existsSync(page_file)) {
    if (!config.sitemap.hasOwnProperty(options.path)) {
      config.sitemap[options.path] = {};
      writeJson(SITEMAP_PATH, config.sitemap);
    } else if (require.main === module) {
      console.log("The specified page [%s] already exists.", page_file);
    }
    return;
  }

  if ( !! options.duplicate) {
    options.duplicate = toAbsoluteUrl(options.duplicate)
    if (!config.sitemap.hasOwnProperty(options.duplicate)) {
      console.log("The page your attempting to duplicate dosen't exist.", page_file);
    }

    config.sitemap[options.path] = {
      ref: options.duplicate
    };
    writeJson(SITEMAP_PATH, config.sitemap);
    return;
  }

  ensureDirectories(config);
  createFile(PAGE_TEMPLATE, page_file);

  if (!fs.existsSync(layout_file)) {
    createFile(LAYOUT_TEMPLATE, layout_file);
  }

  addToSitemap(config, options.path);
}

var createLayout = exports.createLayout = function(options) {
  var config = loadConfiguration();

  if ( !! !options.layout) {
    console.log('-n not specified.');
    return;
  }

  var document_path = path.join(config.layout_path, options.layout + '.jade');

  if (fs.existsSync(document_path)) {
    if (require.main === module) {
      console.log("The specified layout [%s] already exists.", document_path);
    }
    return;
  }

  ensureDirectories(config);
  createFile(LAYOUT_TEMPLATE, document_path);
}

var devServer = null;
var runDevServer = exports.runDevServer = function(options) {
  var config = loadConfiguration();
  var templatePath = config.content_path;
  var staticPath = config.static_config.static;

  var file = new(staticLoader.Server)(staticPath);

  devServer = require('http').createServer(function(request, response) {
    request.addListener('end', function() {

      if (/^\/healthz$/.test(request.url)) {
        response.end("ok");
      } else if (config.sitemap.hasOwnProperty(request.url) || /jade$/.test(request.url)) {
        serveJadeFile(request, response, config);
      } else {
        file.serve(request, response);
      }
    });
  });
  devServer.listen(options.port);
  if (require.main === module) {
    console.log('listening on port %s', options.port);
  }
}

exports.stopDevServer = function() {
  devServer.close();
}

var generate = exports.generate = function(options) {
  var config = loadConfiguration();

  if (!fs.existsSync(config.static_config.static)) {
    fs.mkdirSync(config.static_config.static);
  }

  for (var key in config.sitemap) {
    var sitemap_node = config.sitemap[key];
    var template = renderJadeFileForUrl(config, sitemap_node.ref || key);
    fs.writeFileSync(path.join(config.static_config.static, key + '.html'), template);
  }
}

/********************************************************************
 * Helper functions
 ********************************************************************/

function writeJson(file, object) {
  fs.writeFileSync(file, JSON.stringify(object, null, 2) + "\n");
}

function toAbsoluteUrl(url) {
  return ((/^\//.test(url))) ? url : '/' + url;
}

function ensureDirectories(config) {
  ensureDirectory(config.content_path);
  ensureDirectory(config.layout_path);
}

function ensureDirectory(dir_path) {
  if (!fs.existsSync(dir_path)) {
    fs.mkdirSync(dir_path);
  }
}

function createFile(source, destination) {
  var template = fs.readFileSync(source);
  fs.writeFileSync(destination, template);
}

function writeFile(destination, contents) {
  fs.writeFile(destination, contents, function(err) {
    if (err) throw err;
    console.log('Wrote %s', destination);
  });
}

function addToSitemap(config, url) {
  config.sitemap[url] = {};
  fs.writeFileSync(SITEMAP_PATH, JSON.stringify(config.sitemap, null, 2));
}

function serveJadeFile(request, response, config) {
  try {
    response.writeHead(200, {
      'Content-Type': 'text/html'
    });
    response.end(renderJadeFileForUrl(config, request.url));
  } catch (err) {
    console.log('error rendering file:\n ' + err);
  }
}

function renderJadeFileForUrl(config, url) {
  var file_path = path.join(config.content_path, url);
  if (!/jade$/.test(url)) {
    var file_path =  file_path + '.jade';
  }

  if (!fs.existsSync(file_path)) {
    throw new Error('invalid sitemap path: ' + file_path);
  }

  return renderFile(file_path, config.static_config.dynamicHelpers);
}

function renderFile(file, options) {
  options = options || {};
  return jade.compile(fs.readFileSync(file), {filename: file})(options);
}

/********************************************************************
 * Configuration
 ********************************************************************/

var loadConfiguration = exports.loadConfiguration = function() {
  var config = {}

  // Load general config data
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      config.static_config = JSON.parse(fs.readFileSync(CONFIG_PATH));
    } catch (err) {
      console.log('failed loading config file: %s', err);
      throw err;
    }
  }

  if (!config.static_config) {
    throw new Error('no configuration found or configuration was empty. Did you forget to run init?');
  }

  // load sitemap
  if (fs.existsSync(SITEMAP_PATH)) {
    try {
      config.sitemap = JSON.parse(fs.readFileSync(SITEMAP_PATH, 'utf8'));
    } catch (err) {
      console.log("%s", fs.readFileSync(SITEMAP_PATH, 'utf8'));
    }
  }

  config.content_path = config.static_config.content;
  config.layout_path = './' + path.join(config.content_path, 'layouts');
  return config;
}

/********************************************************************
 * Console/Program
 ********************************************************************/

program.command('init').description('creates configs used by the static content generator').action(init);

program.command('generate').description('generate static content from templates').action(generate);

program.command('dev').description('run a server that allows you to test template changes').option('-p, --port <port>', 'port to run the dev server on', 8080).action(runDevServer).on('--help', function() {
  console.log('static -s static -v views -p 8080')
});

program.command('page').description('generate a page').option('-p, --path <path>', 'path of the page').option('-d, --duplicate <path>', 'path of the page to duplicate').action(createPage);

program.command('layout').description('generate a layout').option('-n, --layout <layout>', 'Name of the file?').action(createLayout);

program.version('0.0.2').parse(process.argv);