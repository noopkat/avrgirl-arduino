var fs = require('graceful-fs');
var intelhex = require('intel-hex');

var tools = {};

/**
 * Opens and parses a given hex file
 */
tools._parseHex = function(file) {
  var data = fs.readFileSync(file, {
    encoding: 'utf8'
  });
  return intelhex.parse(data).data;
};

module.exports = tools;
