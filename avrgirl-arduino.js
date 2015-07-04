var Serialport = require('serialport');
var intelhex = require('intel-hex');
var Stk500 = require('stk500');
var avr109 = require('chip.avr.avr109');
var fs = require('fs');
var boards = require('./boards');
var childProcess = require('child_process');

var Avrgirl_arduino = function (opts) {
  var opts = opts || {};

  this.options = {
    quiet: opts.quiet || false,
    board: opts.board || 'uno',
    port: opts.port || ''
  };

  this.board = boards[this.options.board];
  this.chip;

  if (this.board.protocol === 'stk500v1') {
    this.chip = new Stk500({quiet: true});
  } else if (this.board.protocol === 'avr109') {
    this.chip = avr109;
  }
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
  var hex = file;

  if (this.options.port === '') {
    this._sniffPort(function (port) {
      if (port !== null) {
        self.options.port = port;
        self._upload(hex, callback);
      } else {
        return callback(new Error('no Arduino found.'))
      }
    });
  } else {
    this._upload(hex, callback);
  }
};

Avrgirl_arduino.prototype._upload = function (hex, callback) {
  var self = this;
  var eggs = hex;
  var cb = callback;

  if (self.board.protocol === 'stk500v1') {
    self._uploadSTK500v2(eggs, cb);
  } 

  else if (self.board.protocol === 'avr109') {
    self._resetAVR109(function (error) {
      if (error) { return cb(error) }
        self._uploadAVR109(eggs, cb);
    });
  }
};

Avrgirl_arduino.prototype._uploadSTK500v2 = function (eggs, callback) {
  var self = this;

  if (!this.serialPort) {
    this._setUpSerial();
  }

  this.serialPort.open(function (error) {
    if (error) { return callback(error) }

    var hex = self._parseHex(eggs);
    self.chip.bootload(self.serialPort, hex, self.board, function (error) {
      if (error) { return callback(error) }
      self.serialPort.close(function (error) {
        return callback(error);
      });
    });
  });
};

Avrgirl_arduino.prototype._resetAVR109 = function (callback) {
  var self = this;
  var resetFile = __dirname + '/lib/leo-reset.js';

  childProcess.execFile('node', [resetFile, self.options.port], function() {
    setTimeout(callback, 600);
  });
};

Avrgirl_arduino.prototype._uploadAVR109 = function(eggs, callback) {
  var self = this;

  if (!this.serialPort) {
    this._setUpSerial();
  }

  this.serialPort.open(function (error) {
    if (error) { return callback(error) }

    fs.readFile(eggs, function (error, data) {
      if (error) { return callback(error) }

      self.chip.init(self.serialPort, {signature: self.board.signature.toString()}, function (error, flasher) {
        if (error) { return callback(error) }

        flasher.erase(function() {
          flasher.program(data.toString(), function (error) {
            if (error) { return callback(error) }

            flasher.verify(function (error) {
              if (error) { return callback(error) }

              flasher.fuseCheck(function (error) {
                return callback(error);
              });
            });
          });
        });
      });
    });
  });
};


Avrgirl_arduino.prototype._sniffPort = function (callback) {
  var self = this;

  Serialport.list(function (err, ports) {
    for (var i = 0; i < ports.length; i++) {
      for (var j = 0; j < self.board.productId.length; j ++) {
        if (ports[i].productId === self.board.productId[j]) {
          return callback(ports[i].comName);
        }
      } 
    }
    return callback(null);
  });
};

module.exports = Avrgirl_arduino;
