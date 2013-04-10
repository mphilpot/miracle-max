var express = require('express');
var fs = require('fs')
var util = require('util');
var expressValidator = require('express-validator');
var Path = require('path');
var brackets = require('brackets');

function Server(config) {
  this.config = config;
  this.app = express();
  this.app.use("/_sitemap/brackets/", brackets([config.views, config.public]));
  this.app.use(require('./preview')(config));
  this.app.use(require('./editor')(config));
  this.app.use('/__static__/', express.static(Path.join(__dirname, 'lib/public')));
  this.server = require('http').createServer(this.app);
}

Server.prototype.start = function(callback) {
  var port = this.config.port;
  this.server.listen(port, callback);
  // console.log(util.format('http://localhost:%s/_sitemap/', port));
};

Server.prototype.stop = function(callback) {
  this.server.close(callback);
}

module.exports = Server;
