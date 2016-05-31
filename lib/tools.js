var fs = require('graceful-fs');
var intelhex = require('intel-hex');

var tools = {};

/**
 * Opens and parses a given hex file
 */
tools._parseHex = function (file) {
  try {
    var data;
    if (typeof file === 'string') {
      data = fs.readFileSync(file, {
        encoding: 'utf8'
      });
    } else {
      data = file;
    }

    return intelhex.parse(data).data;
  } catch (error) {
    return error;
  }
};

module.exports = tools;
