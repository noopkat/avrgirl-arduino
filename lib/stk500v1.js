var Protocol = require('stk500');
var colors = require('colors');
var tools = require('./tools');

var Stk500v1 = function(board, connection, debug) {
  this.debug = debug ? console.log.bind(console) : function() {};

  this.board = board;
  this.connection = connection;

  this.chip = new Protocol({
    quiet: true
  });
};

/**
 * Calls the correct upload method, depending on which protocol the Arduino uses
 *
 * @param {buffer} hex - path to hex file for uploading
 * @param {function} callback - function to run upon completion/error
 */
Stk500v1.prototype._upload = function(file, callback) {
  var _this = this;

  this.serialPort = this.connection.serialPort;

  // open/parse supplied hex file
  var hex = tools._parseHex(file);

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

/**
 * Resets an Arduino STK500 bootloaded chip by pulsing DTR high.
 *
 * Avoids the dreaded timeout bug if the serialport was opened since the device
 * was powered.
 *
 * @param {function} callback - function to run upon completion/error
 */
Stk500v1.prototype._reset = function(callback) {
  var _this = this;

  // cycle DTR/RTS from low to high
  _this.connection._cycleDTR(function(error) {
    if (!error) {
      _this.debug('reset complete.');
    }

    return callback(error);
  });
};

module.exports = Stk500v1;
