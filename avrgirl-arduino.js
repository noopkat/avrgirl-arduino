var Serialport = require('serialport');
var intelhex = require('intel-hex');
var Stk500 = require('stk500');
var avr109 = require('chip.avr.avr109');
var fs = require('fs');
var boards = require('./boards');
var childProcess = require('child_process');

/**
 * Constructor
 *
 * @param {object} options - options for consumer to pass in
 */
var Avrgirl_arduino = function (opts) {
  var opts = opts || {};

  this.options = {
    debug: opts.debug || false,
    board: opts.board || 'uno',
    port: opts.port || ''
  };

  this.chip;

  // get board properties
  this.board = boards[this.options.board];

  // assign the correct module to the protocol of the chosen board
  if (this.board.protocol === 'stk500v1') {
    this.chip = new Stk500({quiet: true});
  } else if (this.board.protocol === 'avr109') {
    this.chip = avr109;
  }
};


/**
 * Create new serialport instance for the Arduino board, but do not immediately connect.
 */
Avrgirl_arduino.prototype._setUpSerial = function () {
  this.serialPort = new Serialport.SerialPort(this.options.port, {
    baudRate: this.board.baud,
  }, false);
};


/**
 * Opens and parses a given hex file
 */
Avrgirl_arduino.prototype._parseHex = function (file) {
  var data = fs.readFileSync(file, {encoding: 'utf8'});
  return intelhex.parse(data).data;
};


/**
 * Public method for flashing a hex file to the main program allocation of the Arduino
 *
 * @param {string} file - path to hex file for uploading
 * @param {function} callback - function to run upon completion/error
 */
Avrgirl_arduino.prototype.flash = function (file, callback) {
  var self = this;
  var hex = file;

  // if we haven't been supplied an explicit port to connect to, auto sniff one.
  if (this.options.port === '') {
    this._sniffPort(function (port) {
      if (port !== null) {
        // found a port, save it
        self.options.port = port;
        // upload hex
        self._upload(hex, callback);
      } else {
        // we didn't find the board
        return callback(new Error('no Arduino found.'))
      }
    });
  } else {
    // we already know the port, so upload
    this._upload(hex, callback);
  }
};


/**
 * Calls the correct upload method, depending on which protocol the Arduino uses
 *
 * @param {string} hex - path to hex file for uploading
 * @param {function} callback - function to run upon completion/error
 */
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


/**
 * Upload method for the STK500v1 protocol
 *
 * @param {string} eggs - path to hex file for uploading
 * @param {function} callback - function to run upon completion/error
 */
Avrgirl_arduino.prototype._uploadSTK500v2 = function (eggs, callback) {
  var self = this;

  // do we have a connection instance yet?
  if (!this.serialPort) {
    this._setUpSerial();
  }

  // open connection
  this.serialPort.open(function (error) {
    if (error) { return callback(error) }

    // open/parse supplied hex file 
    var hex = self._parseHex(eggs);

    // flash
    self.chip.bootload(self.serialPort, hex, self.board, function (error) {
      if (error) { return callback(error) }
      // flashing success, close connection and call 'em back
      self.serialPort.close(function (error) {
        return callback(error);
      });
    });
  });
};


/**
 * Software resets an Arduino AVR109 bootloaded chip into bootloader mode
 *
 * Note: this method runs a child process, as it is currently difficult to guarantee
 * that a serialport connection has truly closed via node-serialport.
 * Exiting the child process when done ensures we have a true closure, 
 * and therefore a completed board reset.
 *
 * @param {function} callback - function to run upon completion/error
 */
Avrgirl_arduino.prototype._resetAVR109 = function (callback) {
  var self = this;
  var resetFile = __dirname + '/lib/leo-reset.js';
  var tries = 0;

  childProcess.execFile('node', [resetFile, self.options.port], function() {
    tryConnect(function(connected) {
      var status = connected ? null : new Error('could not complete reset.');
      callback(status);
    });
  });

  // here we have to retry the serialport polling,
  // until the chip boots back up to recreate the virtual com port
  function tryConnect (callback) {
    function checkList() {
      Serialport.list(function (error, ports) {
        // iterate through ports looking for the one port to rule them all
        for (var i = 0; i < ports.length; i++) {
          if (ports[i].comName === self.options.port) {
            return callback(true);
          }
        }
        tries += 1;
        if (tries < 4) {
          setTimeout(checkList, 300);
        } else {
          // timeout on too many tries
          return callback(false);
        }
      });
    }
    setTimeout(checkList, 300);
  }
};


/**
 * Upload method for the AVR109 protocol
 *
 * @param {string} eggs - path to hex file for uploading
 * @param {function} callback - function to run upon completion/error
 */
Avrgirl_arduino.prototype._uploadAVR109 = function(eggs, callback) {
  var self = this;

  // do we have a connection instance yet?
  if (!this.serialPort) {
    this._setUpSerial();
  }

  // TODO: async.serial
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
                // finally, if the fuses are cool, close the connetion and call 'em back.
                self.serialPort.close(function (error) {
                  return callback(error);
                });
              });
            });
          });
        });
      });
    });
  });
};


/**
 * Finds a list of available USB ports, and matches for the right pid
 * Auto finds the correct port for the chosen Arduino
 *
 * @param {function} callback - function to run upon completion/error
 */
Avrgirl_arduino.prototype._sniffPort = function (callback) {
  var self = this;

  // list all available ports
  Serialport.list(function (err, ports) {
    // iterate through ports
    for (var i = 0; i < ports.length; i++) {
      // iterate through all possible pid's
      for (var j = 0; j < self.board.productId.length; j ++) {
        if (ports[i].productId === self.board.productId[j]) {
          // match! Return the port/path
          return callback(ports[i].comName);
        }
      } 
    }
    // didn't find a match :(
    return callback(null);
  });
};

module.exports = Avrgirl_arduino;
