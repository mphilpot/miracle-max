var path = require('path');
var fs = require('fs');
var jade = require('jade');

module.exports = function(dir) {
  if (!(dir != null)) {
    throw new Error("A path must be specified.");
  }

  return function(req, res) {
    var next = function() {
      res.end("Error")
    };

    var d;
    d = path.join(dir, req.url);
    var jadeOptions = {filename: d};
    return fs.lstat(d, function(err, stats) {
      if (!(err != null) && stats.isDirectory()) {
        return fs.lstat("" + d + "/index.jade", function(err, stats) {
          if (!(err != null) && stats.isFile()) {
            return fs.readFile("" + d + "/index.jade", 'utf8', function(err, data) {
              if (err != null) {
                next();
                return;
              }
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(jade.compile(data, jadeOptions)({}));
            });
          } else {
            next();
          }
        });
      } else if (!(err != null) && stats.isFile() && path.extname(d) === '.jade') {
        return fs.readFile(d, 'utf8', function(err, data) {
          if (err != null) {
            next();
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(jade.compile(data, jadeOptions)({}));
        });
      } else {
        next();
      }
    });
  };
};