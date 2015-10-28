var Serialport = require('serialport');
var intelhex = require('intel-hex');
var Stk500v1 = require('stk500');
var Stk500v2 = require('stk500-v2');
var avr109 = require('chip.avr.avr109');
var async = require('async');
var fs = require('graceful-fs');
var boards = require('./boards');
var colors = require('colors');

/**
 * Constructor
 *
 * @param {object} options - options for consumer to pass in
 */
var Avrgirl_arduino = function(opts) {
  var opts = opts || {};

  this.options = {
    debug: opts.debug || false,
    board: opts.board || 'uno',
    port: opts.port || ''
  };

  this.debug = this.options.debug ? console.log : function() {};

  this.chip = undefined;

  // get board properties
  this.board = boards[this.options.board];
  if (!this.board) {
    return;
  }

  // assign the correct module to the protocol of the chosen board
  if (this.board.protocol === 'stk500v1') {
    this.chip = new Stk500v1({
      quiet: true
    });
  } else if (this.board.protocol === 'stk500v2') {
    this.chip = Stk500v2;
  } else if (this.board.protocol === 'avr109') {
    this.chip = avr109;
  }
};

/**
 * Create new serialport instance for the Arduino board, but do not immediately connect.
 */
Avrgirl_arduino.prototype._setUpSerial = function() {
  this.serialPort = new Serialport.SerialPort(this.options.port, {
    baudRate: this.board.baud,
  }, false);
};


/**
 * Opens and parses a given hex file
 */
Avrgirl_arduino.prototype._parseHex = function(file) {
  var data = fs.readFileSync(file, {
    encoding: 'utf8'
  });
  return intelhex.parse(data).data;
};


/**
 * Public method for flashing a hex file to the main program allocation of the Arduino
 *
 * @param {string} file - path to hex file for uploading
 * @param {function} callback - function to run upon completion/error
 */
Avrgirl_arduino.prototype.flash = function(file, callback) {
  var self = this;
  var hex = file;

  // if we don't have a valid board, we cannot continue.
  if (!self.board) {
    return callback(new Error('"' + self.options.board + '" is not a supported board type.'));
  }

  // if we haven't been supplied an explicit port to connect to, auto sniff one.
  if (self.options.port === '') {
    // if this is a pro-mini, we cannot auto-sniff so return an error
    if (self.options.board === 'pro-mini') {
      var error = new Error('you\'re using a pro-mini, please specify the port in your options.');
      return callback(error);
    }

    self._sniffPort(function(port) {
      if (port !== null) {
        self.debug('found ' + self.options.board + ' on port ' + port);
        // found a port, save it
        self.options.port = port;
        // upload hex
        self._upload(hex, callback);
      } else {
        // we didn't find the board
        return callback(new Error('no Arduino found.'));
      }
    });
  } else {
    // we already know the port, so upload
    self._upload(hex, callback);
  }
};


/**
 * Calls the correct upload method, depending on which protocol the Arduino uses
 *
 * @param {string} hex - path to hex file for uploading
 * @param {function} callback - function to run upon completion/error
 */
Avrgirl_arduino.prototype._upload = function(hex, callback) {
  var self = this;
  var eggs = hex;
  var cb = callback;

  if (self.board.protocol === 'stk500v1') {
    self._uploadSTK500v1(eggs, cb);
  } else if (self.board.protocol === 'stk500v2') {
    self._uploadSTK500v2(eggs, cb);
  } else if (self.board.protocol === 'avr109') {
    self._resetAVR109(function(error) {
      if (error) {
        return cb(error);
      }
      self.debug('reset complete.');
      self._uploadAVR109(eggs, cb);
    });
  }
};

/**
 * Sets the DTR/RTS lines to either true or false
 *
 * @param {boolean} bool - value to set DTR and RTS to
 * @param {number} timeout - number in milliseconds to delay after
 * @param {function} callback - function to run upon completion/error
 */
Avrgirl_arduino.prototype._setDTR = function (bool, timeout, callback) {
  var self = this;
  var props = {
    rts: bool,
    dtr: bool
  };

  self.serialPort.set(props, function(error) {
    if (error) { return callback(error); }
    setTimeout(function() {
      callback(error);
    }, timeout);
  });
};

/**
 * Checks the list of ports 4 times for a device to show up
 *
 * @param {function} callback - function to run upon completion/error
 */
Avrgirl_arduino.prototype._pollForPort = function (callback) {
  var self = this;
  var tries = 0;
  var delay = 300;

  function checkList() {
    Serialport.list(function(error, ports) {
      // iterate through ports looking for the one port to rule them all
      for (var i = 0; i < ports.length; i++) {
        if (ports[i].comName === self.options.port) {
          return callback(true);
        }
      }
      tries += 1;
      if (tries < 4) {
        setTimeout(checkList, delay);
      } else {
        // timeout on too many tries
        return callback(false);
      }
    });
  }
  setTimeout(checkList, delay);
};

/**
 * Pulse the DTR/RTS lines low then high
 *
 * @param {function} callback - function to run upon completion/error
 */
Avrgirl_arduino.prototype._cycleDTR = function(callback) {
  var self = this;

  async.series([
    self._setDTR.bind(self, true, 250),
    self._setDTR.bind(self, false, 50)
  ],
  function(error) {
    return callback(error);
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
Avrgirl_arduino.prototype._resetSTK500 = function(callback) {
  var self = this;

  // cycle DTR/RTS from low to high
  self._cycleDTR(function(error) {
    if (!error) {
      self.debug('reset complete.');
    }
    return callback(error);
  });
};


/**
 * Upload method for the STK500v1 protocol
 *
 * @param {string} eggs - path to hex file for uploading
 * @param {function} callback - function to run upon completion/error
 */
Avrgirl_arduino.prototype._uploadSTK500v1 = function(eggs, callback) {
  var self = this;

  // do we have a connection instance yet?
  if (!self.serialPort) {
    self._setUpSerial();
  }

  // open connection
  self.serialPort.open(function(error) {
    if (error) {
      return callback(error);
    }

    self.debug('connected');

    // open/parse supplied hex file
    var hex = self._parseHex(eggs);

    // reset
    self._resetSTK500(function(error) {
      self.debug('flashing, please wait...');
      // flash
      self.chip.bootload(self.serialPort, hex, self.board, function(error) {
        var color = (error ? colors.red : colors.green);

        self.debug(color('flash complete.'));

        // Always close the serialport
        self.serialPort.close();

        return callback(error);
      });
    });
  });
};


/**
 * Upload method for the STK500v2 protocol
 *
 * @param {string} eggs - path to hex file for uploading
 * @param {function} callback - function to run upon completion/error
 */
Avrgirl_arduino.prototype._uploadSTK500v2 = function(eggs, callback) {
  var self = this;

  // do we have a connection instance yet?
  if (!self.serialPort) {
    self._setUpSerial();
  }

  // open connection
  self.serialPort.open(function(error) {
    if (error) {
      return callback(error);
    }

    // instantiate stk500v2 with newly open serialport
    self.chip = self.chip(self.serialPort);

    self.debug('connected');

    // open/parse supplied hex file
    var hex = self._parseHex(eggs);

    async.series([
        function(callback) {
          self._resetSTK500(callback);
        },
        function(callback) {
          self.chip.sync(5, callback);
        },
        function(callback) {
          self.chip.verifySignature(self.board.signature, callback);
        },
        function(callback) {
          self.chip.enterProgrammingMode(self.board, callback);
        },
        function(callback) {
          self.debug('flashing, please wait...');
          self.chip.upload(hex, self.board.pageSize, callback);
        },
        function(callback) {
          self.chip.exitProgrammingMode(callback);
        }
      ],
      function(err, results) {
        var color = (err ? colors.red : colors.green);

        self.debug(color('flash complete.'));

        // Always close the serialport
        self.serialPort.close();

        return callback(err);
      });
  });
};

/**
 * Software resets an Arduino AVR109 bootloaded chip into bootloader mode
 *
 * @param {function} callback - function to run upon completion/error
 */
Avrgirl_arduino.prototype._resetAVR109 = function(callback) {
  var self = this;

  self.debug('resetting board...');

  self.serialPort = new Serialport.SerialPort(self.options.port, {
    baudRate: 1200,
  });

  // open a connection, then immediately close to perform the reset of the board.
  self.serialPort.open(function() {
    self._cycleDTR(function(error) {
      if (error) { return callback(error); }
      self._pollForPort(function(connected) {
        var status = connected ? null : new Error('could not complete reset.');
        return callback(status);
      });
    });
  });
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
  if (!self.serialPort) {
    self._setUpSerial();
  }


  self.serialPort.open(function(error) {
    if (error) {
      return callback(error);
    }
    self.debug('connected');

    fs.readFile(eggs, function(error, data) {
      if (error) {
        return callback(error);
      }

      self.chip.init(self.serialPort, {
        signature: self.board.signature.toString()
      }, function(error, flasher) {
        if (error) {
          return callback(error);
        }
        self.debug('flashing, please wait...');

        async.series([
            function(callback) {
              flasher.erase(callback);
            },
            function(callback) {
              flasher.program(data.toString(), callback);
            },
            function(callback) {
              flasher.verify(callback);
            },
            function(callback) {
              flasher.fuseCheck(callback);
            }
          ],
          function(err, results) {
            var color = (err ? colors.red : colors.green);

            self.debug(color('flash complete.'));
            return callback(err);
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
Avrgirl_arduino.prototype._sniffPort = function(callback) {
  var self = this;

  // list all available ports
  Serialport.list(function (err, ports) {
    // Handle errors
    if (!err) {
      // iterate through ports
      for (var i = 0; i < ports.length; i++) {
        // iterate through all possible pid's
        for (var j = 0; j < self.board.productId.length; j++) {
          var pid;
          // are we on windows or unix?
          if (ports[i].productId) {
            pid = ports[i].productId;
          } else if (ports[i].pnpId) {
            pid = '0x' + /PID_\d*/.exec(ports[i].pnpId)[0].substr(4);
          } else {
            pid = '';
          }
          if (pid === self.board.productId[j]) {
            // match! Return the port/path
            return callback(ports[i].comName);
          }
        }
      }
    }
    // didn't find a match :(
    return callback(null);
  });
};

module.exports = Avrgirl_arduino;
