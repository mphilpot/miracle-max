var fs = require('fs');
var jade = require('jade');
var jadeLoader = require('./lib/jade-static.js');
var path = require('path');
var program = require('commander');
var sitemap = require('nconf');
var staticLoader = require('node-static');
var util = require('util');

var PAGE_TEMPLATE = exports.PAGE_TEMPLATE = path.join(__dirname, 'templates/content.jade');
var LAYOUT_TEMPLATE = exports.LAYOUT_TEMPLATE = path.join(__dirname, 'templates/layout.jade');

/********************************************************************
* Configuration
********************************************************************/

var loadConfiguration = exports.loadConfiguration = function() {
  var config = {}
  var CONFIG_PATH = 'static-config.json';

  // Load general config data
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      config.static_config = JSON.parse(fs.readFileSync(CONFIG_PATH));
    } catch(err) {
      console.log('failed loading config file: %s', err);
      throw err;
    }
  }

  if (!config.static_config) {
    throw new Error('no configuration found or configuration was empty');
  }

  // load sitemap
  if (fs.existsSync(config.static_config.sitemap)) {
    config.sitemap = JSON.parse(fs.readFileSync(config.static_config.sitemap));
  }

  config.content_path = config.static_config.content;
  config.layout_path = './' + path.join(config.content_path, 'layouts');
  return config;
}

exports.getStaticConfig = function () {
  return {
    'config': config,
    'sitemap': sitemap,
    'content_path': content_path,
    'layout_path': layout_path
  }
}

/********************************************************************
* Console/Program
********************************************************************/

program
    .command('init')
    .description('creates configs used by the static content generator')
    .action(init);

program
    .command('generate')
    .description('generate static content from templates')
    .action(function() {
      console.log('setup');
    });

program
    .command('dev')
    .description('run a server that allows you to test template changes')
    .option('-p, --port <port>', 'port to run the dev server on', 8080)
    .action(runDevServer)
    .on('--help', function() {
      console.log('static -s static -v views -p 8080')
    });

program
    .command('page')
    .description('generate a page')
    .option('-n, --page <page>', 'Name of the file?')
    .action(createPage);

program.command('layout')
    .description('generate a layout')
    .option('-n, --layout <layout>', 'Name of the file?')
    .action(createLayout);

program
  .version('0.0.2')
  .parse(process.argv);

/********************************************************************
* Helper functions
********************************************************************/

var init = exports.init = function(dir_path) {
  var base_path = fs.realpathSync(dir_path || './');
  var config = {
    'content': './content',
    'static': './static',
    'sitemap': './sitemap.json'
  };
  fs.writeFileSync(path.join(base_path, 'static-config.json'), JSON.stringify(config, null, 2));
  fs.writeFileSync(path.join(base_path, 'sitemap.json'), '{}');
}

var createPage = exports.createPage = function(options) {
  var config = loadConfiguration();

  if (!!!options.page) {
    console.log('-n not specified.');
    return;
  }

  var page_file = path.join(config.content_path, options.page + '.jade');
  var layout_file = path.join(config.layout_path, 'default' + '.jade');

  if (fs.existsSync(page_file)) {
    console.log("The specified page [%s] already exsists.", page_file);
    return;
  }

  ensureDirectories(config);
  createFile(PAGE_TEMPLATE, page_file);

  if (!fs.existsSync(layout_file)) {
    createFile(LAYOUT_TEMPLATE, layout_file);
  }

  sitemap.set(options.page, {});
  sitemap.save("sitemap", function (err) {});
}

var createLayout = exports.createLayout = function(options) {
  var config = loadConfiguration();

  if (!!!options.layout) {
    console.log('-n not specified.');
    return;
  }

  var document_path = path.join(config.layout_path, options.layout + '.jade');

  if (fs.existsSync(document_path)) {
    console.log("The specified layout [%s] already exsists.", document_path);
    return;
  }

  ensureDirectories(config);
  createFile(LAYOUT_TEMPLATE, document_path);
}

function runDevServer(options) {
  var templatePath = config.get('content');
  var staticPath = config.get('static');

  console.log('serving static content from %s', staticPath);
  console.log('serving template content from %s', templatePath);

  var file = new(staticLoader.Server)(staticPath);
  var jade = jadeLoader(templatePath);

  require('http').createServer(function(request, response) {
    request.addListener('end', function() {
      // TODO: handle /
      if (/jade$/.test(request.url)) {
        jade(request, response);
      } else {
        file.serve(request, response);
      }
    });
  }).listen(options.port);
  console.log('listening on port %s', options.port);
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