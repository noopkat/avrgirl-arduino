var fs = require('graceful-fs');
var intelhex = require('intel-hex');

var tools = {};

/**
 * Opens and parses a given hex file
 */
tools._parseHex = function(file) {
  try {
    var data;
    if (typeof file === 'string') {
      data = fs.readFileSync(file, {
        encoding: 'utf8'
      });
    } else {
      // ensure compatibility with browser array buffers
      data = Buffer.from(file);
    }

    return intelhex.parse(data).data;
  } catch (error) {
    return error;
  }
};

tools._hexStringToByte = function(str) {
  return Buffer.from([parseInt(str,16)]);
}

module.exports = tools;
