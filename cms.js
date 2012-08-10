var program = require('commander');
var path = require('path');
var fs = require('fs');
var config = require('nconf');
var sitemap = require('nconf');

/*

TODO List
- This should only be used for static output
- generate a sitemap.json (should this generate a google sitemap?)
*/

var content_path = path.join(__dirname, 'content');

// Load general config data
config.argv()
    .env()
    .file({file: path.join(__dirname, 'config.json')})
    .defaults({
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

if (!fs.existsSync(content_path)) {
  fs.mkdirSync(content_path);
}

if (!fs.existsSync(layout_path)) {
  fs.mkdirSync(layout_path);
}


program
    .command('page')
    .description('generate a page')
    .option('-n, --page <page>', 'Name of the file?')
    .option('-l, --layout_name [layout]', 'Optional layout name?', 'default')
    .action(function(options) {
      if (!!!options.page) {
        console.log('-n not specified.');
        return;
      }

      console.log('content: %s', content_path);
      console.log('layout: %s', layout_path);
      console.log('name: %s', options.page);
      
      var page_path = path.join(content_path, options.page + '.jade');
      var layout_path = path.join(content_path, options.layout + '.jade');

      if (fs.existsSync(page_path)) {
        console.log("The specified page [%s] already exsists.", page_path);
        return;
      }

      sitemap.set(options.page, {});

      createFile(page_template, page_path);

      sitemap.save("sitemap", function (err) {});
    });

program.command('layout')
    .description('generate a layout')
    .option('-n, --layout <layout>', 'Name of the file?')
    .action(function(options) {
      var document_path = path.join(layout_path, options.layout + '.jade');

      if (fs.existsSync(document_path)) {
        console.log("The specified page [%s] already exsists.", document_path);
        return;
      }

      createFile(layout_template, document_path);
    });

program
  .version('0.0.2')
  .option('-s, --static <path>', 'directory of static files', 'static')
  .option('-t, --templates <path>', 'directory of template files', 'templates')
  .parse(process.argv);

function createFile(source, destination) {
  fs.readFile(source, function(err, data) {
    if (err) throw err;

    fs.writeFile(destination, data, function(err) {
      if (err) throw err;
      console.log('Created %s', destination);
    });
  }); 
}

