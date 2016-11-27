var child = require('child_process');
var path = require('path');

module.exports.checkForInstall = function(callback) {
  child.exec('npm ls --json', function(error, stdout) {
    return callback(error, !!JSON.parse(stdout).dependencies['avrga-tester']);
  });
};

module.exports.install = function(callback) {
  child.exec('npm install avrga-tester', function(error) {
    return callback(error);
  });
};

module.exports.run = function() {
  var tp = child.exec('node ' + path.join(__dirname, '..', 'tests', 'test-pilot.js'), function(error) {
    console.log(error);
  });
  tp.stdout.pipe(process.stdout);
};
