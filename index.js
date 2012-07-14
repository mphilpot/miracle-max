var staticLoader = require('node-static');
var jadeLoader = require('./lib/jade-static.js');
var program = require('commander');
var path = require('path');

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
  .version('0.0.1')
  .option('-s, --static <path>', 'directory of static files', 'static')
  .option('-t, --templates <path>', 'directory of template files', 'templates')
  .parse(process.argv);

function runDevServer(options) {
  var templatePath = path.join(__dirname, options.parent.templates);
  var staticPath = path.join(__dirname, options.parent.static);

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