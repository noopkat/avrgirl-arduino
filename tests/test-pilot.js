var testpilot = require('avrga-tester');
var Avrgirl = require('../avrgirl-arduino');
var fs = require('fs');
var path = require('path');

fs.readFile(path.join(__dirname, '..', 'package.json'), function (err, data) {
  var pjson = JSON.parse(data);
  var avrgav = pjson.version;
  var hexpath = path.join(__dirname, '..', 'junk', 'hex');
  testpilot(Avrgirl, avrgav, hexpath);
});
