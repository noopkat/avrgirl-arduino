var protocol = require('chip.avr.avr109');
var colors = require('colors');
var fs = require('fs');
var Serialport = require('serialport');
var async = require('async');

var Avr109 = function(board, connection, debug) {
  this.board = board;
  this.connection = connection;

  var Protocol = function() { return protocol; };

  // do I want to use 'chip' here? maybe just protocol
  this.chip = new Protocol();
  this.debug = debug ? console.log.bind(console) : function() {};
};

/**
 * Upload method for the AVR109 protocol
 *
 * @param {string} hex - path of hex file for uploading
 * @param {function} callback - function to run upon completion/error
 */
Avr109.prototype._upload = function(file, callback) {
  var _this = this;

  // do try catch here
  var data = fs.readFileSync(file, {
    encoding: 'utf8'
  });

  _this._reset(function(error) {
    if (error) { return callback(error); }

    _this.debug('reset complete.');

    _this.serialPort = _this.connection.serialPort;

    _this.serialPort.open(function(error) {
      if (error) { return callback(error); }

      _this.debug('connected');

      _this._write(data, function(error) {
        return callback(error);
      });
    });
  });
};

Avr109.prototype._write = function(data, callback) {
  var _this = this;

  var options = {
    signature: _this.board.signature.toString(),
    debug: false
  };

  _this.chip.init(_this.serialPort, options, function(error, flasher) {
    if (error) { return callback(error); }

    _this.debug('flashing, please wait...');

    async.series([
      flasher.erase.bind(flasher),
      flasher.program.bind(flasher, data.toString()),
      flasher.verify.bind(flasher),
      flasher.fuseCheck.bind(flasher)
    ],
    function(error) {
      var color = (error ? colors.red : colors.green);
      _this.debug(color('flash complete.'));

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

  // creating a temporary connection for resetting only
  var tempSerialPort = new Serialport.SerialPort(_this.connection.options.port, {
    baudRate: 1200,
  }, false);

  _this.connection.serialPort = tempSerialPort;
  conn = _this.connection;

  _this.debug('resetting board...');

  async.series([
    tempSerialPort.open.bind(tempSerialPort),
    conn._cycleDTR.bind(conn),
    conn._setup.bind(conn),
    conn._pollForPort.bind(conn)
  ],
  function(error) {
    return callback(error);
  });
};

module.exports = Avr109;
