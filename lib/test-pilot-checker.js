var child = require('child_process');
var path = require('path');

module.exports.checkForInstall = function(callback) {
  child.exec('npm ls --json', {cwd: __dirname}, function(error, stdout) {
    if (error) return callback(error);
    return callback(null, !!JSON.parse(stdout).dependencies['avrga-tester']);
  });
};

module.exports.install = function(callback) {
  child.exec('npm install avrga-tester', {cwd: __dirname}, function(error) {
    return callback(error);
  });
};

module.exports.run = function() {
  var tp = child.exec('node ' + path.join(__dirname, '..', 'tests', 'test-pilot.js'), function(error) {
    console.log(error);
  });
  tp.stdout.pipe(process.stdout);
};
