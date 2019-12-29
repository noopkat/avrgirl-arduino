var AVR109 = require('chip.avr.avr109');
var colors = require('colors');
var fs = require('graceful-fs');
var Serialport = require('serialport');
var async = require('async');
var Protocol = require('./protocol');
var util = require('util');

var Avr109 = function(options) {
  options.protocol = function() { return AVR109; };

  Protocol.call(this, options);
};

util.inherits(Avr109, Protocol);

/**
 * Uploads the provided hex file to the board, via the AVR109 protocol
 *
 * @param {string, Buffer} hex - path of hex file for uploading, or Buffer of the hex data
 * @param {function} callback - function to run upon completion/error
 */
Avr109.prototype._upload = function(file, callback) {
  var _this = this;
  var data;

  try {
    if (typeof file === 'string') {
      data = fs.readFileSync(file, {
        encoding: 'utf8'
      });
    } else {
      data = file;
    }
  } catch (error) {
    return callback(error);
  }

  _this._reset(function(error) {
    if (error) { return callback(error); }

    _this.debug('reset complete.');

    _this.connection._pollForOpen(function(error) {
      if (error) { return callback(error); }

      _this.debug('connected');

      _this._write(data, function(error) {
        var color = (error ? colors.red : colors.green);
        _this.debug(color('flash complete.'));

        _this.connection.serialPort.close();

        return callback(error);
      });
    });
  });
};

/**
 * Performs the writing part of uploading to an AVR109 bootloaded chip
 *
 * @param {buffer} data - hex buffer to write to the chip
 * @param {function} callback - function to run upon completion/error
 */
Avr109.prototype._write = function(data, callback) {
  var _this = this;

  var options = {
    signature: _this.board.signature.toString(),
    debug: false
  };

  _this.chip.init(_this.connection.serialPort, options, function(error, flasher) {
    if (error) { return callback(error); }

    _this.debug('flashing, please wait...');

    async.series([
      flasher.erase.bind(flasher),
      flasher.program.bind(flasher, data.toString()),
      function verify(done) {
        flasher.verify(done);
      },

      flasher.fuseCheck.bind(flasher)
    ],
    function(error) {
      return callback(error);
    });
  });
};

/**
 * Software resets an Arduino AVR109 bootloaded chip into bootloader mode
 *
 * @param {function} callback - function to run upon completion/error
 */
Avr109.prototype._reset = function(callback) {
  var _this = this;
  var conn;

  if (_this.board.manualReset) {
    return callback(null);
  }

  // creating a temporary connection for resetting only
  var tempSerialPort = new Serialport(_this.connection.options.port, {
    baudRate: 1200,
    autoOpen: false
  });

  _this.connection.serialPort = tempSerialPort;
  conn = _this.connection;

  _this.debug('resetting board...');

  async.series([
    tempSerialPort.open.bind(tempSerialPort),
    conn._setDTR.bind(conn, false, 250)
  ],
  function(error) {
    if (error) {
      return callback(error);
    }
    async.series([
      conn._pollForPort.bind(conn)
    ],
    function(error) {
      return callback(error);
    });
  });
};

module.exports = Avr109;
