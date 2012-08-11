var config = require('nconf');
var fs = require('fs');
var jade = require('jade');
var jadeLoader = require('./lib/jade-static.js');
var path = require('path');
var program = require('commander');
var sitemap = require('nconf');
var staticLoader = require('node-static');

/********************************************************************
* Configuration
********************************************************************/

var content_path = path.join(__dirname, 'content');

// Load general config data
config.argv()
    .env()
    .file({file: path.join(__dirname, 'config.json')})
    .defaults({
      'content': path.join(__dirname, 'content'),
      'static': path.join(__dirname, 'static'),
      'sitemap': 'sitemap.json'
    });
config.load();
config.save();

// load sitemap
sitemap.file({type: 'file', file: config.get('sitemap')});
sitemap.load();

var layout_path = path.join(content_path, 'layouts');
var page_template = path.join(__dirname, 'templates/content.jade');
var layout_template = path.join(__dirname, 'templates/layout.jade');

/********************************************************************
* Console/Program
********************************************************************/

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
    .action(function(options) {
      if (!!!options.page) {
        console.log('-n not specified.');
        return;
      }

      var page_file = path.join(content_path, options.page + '.jade');
      var layout_file = path.join(layout_path, 'default' + '.jade');

      if (fs.existsSync(page_file)) {
        console.log("The specified page [%s] already exsists.", page_file);
        return;
      }

      console.log('content: %s', content_path);
      console.log('layout: %s', layout_file);
      console.log('name: %s', options.page);

      ensureDirectories();
      createFile(page_template, page_file);

      if (!fs.existsSync(layout_file)) {
        createFile(layout_template, layout_file);
      }

      sitemap.set(options.page, {});
      sitemap.save("sitemap", function (err) {});
    });

program.command('layout')
    .description('generate a layout')
    .option('-n, --layout <layout>', 'Name of the file?')
    .action(function(options) {
      var document_path = path.join(layout_path, options.layout + '.jade');

      if (fs.existsSync(document_path)) {
        console.log("The specified layout [%s] already exsists.", document_path);
        return;
      }

      ensureDirectories();
      createFile(layout_template, document_path);
    });

program
  .version('0.0.2')
  .parse(process.argv);

/********************************************************************
* Helper functions
********************************************************************/

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

function ensureDirectories() {
  if (!fs.existsSync(content_path)) {
    fs.mkdirSync(content_path);
  }

  if (!fs.existsSync(layout_path)) {
    fs.mkdirSync(layout_path);
  }
}

function createFile(source, destination) {
  fs.readFile(source, function(err, data) {
    if (err) throw err;
    fs.writeFile(destination, data, function(err) {
      if (err) throw err;
      console.log('Created %s', destination);
    });
  });
}