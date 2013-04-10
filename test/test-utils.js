var fs = require('fs')
var path = require('path')

module.exports.copyFile = function (target, destDir, destName) {
  var fileName = path.basename(target);
  fs.writeFileSync(path.resolve(destDir, destName || filename),
      fs.readFileSync(target));
}
