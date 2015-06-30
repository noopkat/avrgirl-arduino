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
    path: opts.path || '/dev/cu.usbmodem1411'
  };
  this.board = boards[this.options.board];
  this.stk500 = new Stk500({quiet: true});
  this._setUpSerial();
};

Avrgirl_arduino.prototype._setUpSerial = function () {
  this.serialPort = new Serialport.SerialPort(this.options.path, {
    baudRate: this.board.baud,
  }, false);
};

Avrgirl_arduino.prototype._parseHex = function (file) {
  var data = fs.readFileSync(file, {encoding: 'utf8'});
  return intelhex.parse(data).data;
};

Avrgirl_arduino.prototype.flash = function (file, callback) {
  var self = this;
  var hex = this._parseHex(file);

  this.serialPort.open(function (error) {
    if (error) {
      return callback(error)
    }
    self.stk500.bootload(self.serialPort, hex, self.board, function (error) {
      if (error) {
        return callback(error);
      }
      self.serialPort.close(function (error) {
        return callback(error);
      });
    });
  });
};

Avrgirl_arduino.prototype.erase = function() {

};


Avrgirl_arduino.prototype.read = function() {

};

module.exports = Avrgirl_arduino;
