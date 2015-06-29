var Serialport = require('serialport');
var intelhex = require('intel-hex');
var Stk500 = require('stk500');
var fs = require('fs');
var boards = require('./boards');

var Avrgirl_arduino = function (opts) {
  var opts = opts || {};

  this.options = {
    quiet: opts.quiet || false,
    board: opts.board || 'uno',
    path: opt.path || '/dev/placeholder'
  };
  this.board = boards[this.options.board];
  this.stk500 = new Stk500({quiet: true});
  this._setUpSerial();
};

Avrgirl_arduino.prototype._setUpSerial = function() {
  this.serialPort = new SerialPort.SerialPort(path, {
    baudrate: this.options.board.baud,
  }, false);
};

Avrgirl_arduino.prototype._parseHex = function(file) {
  var data = fs.readFileSync(file, {encoding: 'utf8'});
  return intel_hex.parse(data).data;
};

Avrgirl_arduino.prototype.flash = function(file, callback) {
  var self = this;
  var hex = Avrgirl_arduino.prototype._parseHex(file);

  serialPort.open(function (error) {
    stk500.bootload(self.serialPort, hex, self.board, function (error) {
      serialPort.close(function (error) {
        console.log(error);
      });

      callback(error);
    });
  });
};

Avrgirl_arduino.prototype.erase = function() {

};


Avrgirl_arduino.prototype.read = function() {

};

module.exports = Avrgirl_arduino;
