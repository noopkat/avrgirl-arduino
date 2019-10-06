var STK2 = require('stk500-v2');
var async = require('async');
var colors = require('colors');
var tools = require('./tools');
var Protocol = require('./protocol');
var util = require('util');

var Stk500v2 = function(options) {
  options.protocol = function() { return STK2; };

  Protocol.call(this, options);
};

util.inherits(Stk500v2, Protocol);

/**
 * Uploads the provided hex file to the board, via the stk500v2 protocol
 *
 * @param {buffer} hex - buffer of hex file for uploading
 * @param {function} callback - function to run upon completion/error
 */
Stk500v2.prototype._upload = function(file, callback) {
  var _this = this;

  _this.serialPort = _this.connection.serialPort;

  // open/parse supplied hex file
  var hex = tools._parseHex(file);
  if (!Buffer.isBuffer(hex)) {
    return callback(hex);
  }

  // open connection
  _this.serialPort.open(function(error) {
    if (error) { return callback(error); }

    _this.debug('connected');

    // instantiate stk500v2 with newly open serialport
    var chip = _this.chip(_this.serialPort);

    async.series([
      _this._reset.bind(_this),
      chip.sync.bind(chip, 5),
      chip.verifySignature.bind(chip, _this.board.signature),
      chip.enterProgrammingMode.bind(chip, _this.board),
      function debugLog(callback) {
        _this.debug('flashing, please wait...');
        callback(null);
      },

      chip.upload.bind(chip, hex, _this.board.pageSize),
      chip.exitProgrammingMode.bind(chip)
    ],
    function(error) {
      var color = (error ? colors.red : colors.green);
      _this.debug(color('flash complete.'));

      // Always close the serialport
      _this.serialPort.close();

      return callback(error);
    });
  });
};

module.exports = Stk500v2;
