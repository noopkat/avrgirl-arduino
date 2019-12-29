var STK = require('stk500');
var colors = require('colors');
var tools = require('./tools');
var Protocol = require('./protocol');
var util = require('util');

var Stk500v1 = function(options) {
  options.protocol = STK;
  Protocol.call(this, options);
};

util.inherits(Stk500v1, Protocol);

/**
 * Uploads the provided hex file to the board, via the stk500v1 protocol
 *
 * @param {string} file - path to hex file for uploading
 * @param {function} callback - function to run upon completion/error
 */
Stk500v1.prototype._upload = function(file, callback) {
  var _this = this;

  this.serialPort = this.connection.serialPort;

  // open/parse supplied hex file
  var hex = tools._parseHex(file);
  if (!Buffer.isBuffer(hex)) {
    return callback(hex);
  }

  // open connection
  _this.serialPort.open(function(error) {
    if (error) { return callback(error); }

    _this.debug('connected');

    // reset
    _this._reset(function(error) {
      if (error) { return callback(error); }

      _this.debug('flashing, please wait...');

      // flash
      _this.chip.bootload(_this.serialPort, hex, _this.board, function(error) {
        var color = (error ? colors.red : colors.green);

        _this.debug(color('flash complete.'));

        // Always close the serialport
        _this.serialPort.close();

        return callback(error);
      });
    });
  });
};

Stk500v1.prototype._reset = function(callback) {
  var _this = this;

  _this.connection._setDTR(false, 250, function(error) {
    if (error) { return callback(error); }

    _this.connection._setDTR(true, 50, function(error) {
      _this.debug('reset complete.');
      return callback(error);
    });
  });
};

module.exports = Stk500v1;
