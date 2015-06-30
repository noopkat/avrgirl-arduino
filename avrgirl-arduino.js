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
    port: opts.port || ''
  };

  this.board = boards[this.options.board];
  this.stk500 = new Stk500({quiet: true});

};

Avrgirl_arduino.prototype._setUpSerial = function () {
  this.serialPort = new Serialport.SerialPort(this.options.port, {
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

  if (this.options.port === '') {
    this._sniffPort(function (port) {
      if (port !== null) {
        this.options.port = port;
        this._upload(hex, callback);
      } else {
        // delete me
        console.error('no Arduino found.');
        // return callback(new Error('Error: no Arduino found.'))
      }
    }.bind(this));
  } else {
    this._upload(hex, callback);
  }
};

Avrgirl_arduino.prototype._upload = function (hex, callback) {
  var self = this;
  if (!this.serialPort) {
    this._setUpSerial();
  }

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

Avrgirl_arduino.prototype._sniffPort = function (callback) {
  var self = this;

  Serialport.list(function (err, ports) {
    for (var i = 0; i < ports.length; i++) {
      if (ports[i].productId === self.board.productId) {
        return callback(ports[i].comName);
      }
    }
    return callback(null);
  });
};

Avrgirl_arduino.prototype.erase = function() {

};


Avrgirl_arduino.prototype.read = function() {

};

module.exports = Avrgirl_arduino;
