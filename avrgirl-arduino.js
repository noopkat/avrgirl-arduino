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
var AvrgirlArduino = function(opts) {
  opts = opts || {};

  this.options = {
    debug: opts.debug || false,
    board: opts.board || 'uno',
    port: opts.port || ''
  };

  this.debug = this.options.debug ? console.log.bind(console) : function() {};

  this.chip = undefined;

  // get board properties
  this.board = boards.byName[this.options.board];
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
AvrgirlArduino.prototype._setUpSerial = function() {
  this.serialPort = new Serialport.SerialPort(this.options.port, {
    baudRate: this.board.baud,
  }, false);
};

/**
 * Opens and parses a given hex file
 */
AvrgirlArduino.prototype._parseHex = function(file) {
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
AvrgirlArduino.prototype.flash = function(file, callback) {
  var _this = this;
  var hex = file;

  // if we don't have a valid board, we cannot continue.
  if (!_this.board) {
    return callback(new Error('"' + _this.options.board + '" is not a supported board type.'));
  }

  // if we haven't been supplied an explicit port to connect to, auto sniff one.
  if (_this.options.port === '') {
    // if this is a pro-mini, we cannot auto-sniff so return an error
    if (_this.options.board === 'pro-mini') {
      var error = new Error('you\'re using a pro-mini, please specify the port in your options.');
      return callback(error);
    }

    _this._sniffPort(function(port) {
      if (port !== null) {
        _this.debug('found ' + _this.options.board + ' on port ' + port);

        // found a port, save it
        _this.options.port = port;

        // upload hex
        _this._upload(hex, callback);
      } else {
        // we didn't find the board
        return callback(new Error('no Arduino found.'));
      }
    });
  } else {
    // we already know the port, so upload
    _this._upload(hex, callback);
  }
};

/**
 * Calls the correct upload method, depending on which protocol the Arduino uses
 *
 * @param {string} hex - path to hex file for uploading
 * @param {function} callback - function to run upon completion/error
 */
AvrgirlArduino.prototype._upload = function(hex, callback) {
  var _this = this;
  var eggs = hex;
  var cb = callback;

  if (_this.board.protocol === 'stk500v1') {
    _this._uploadSTK500v1(eggs, cb);
  } else if (_this.board.protocol === 'stk500v2') {
    _this._uploadSTK500v2(eggs, cb);
  } else if (_this.board.protocol === 'avr109') {
    _this._resetAVR109(function(error) {
      if (error) {
        return cb(error);
      }

      _this.debug('reset complete.');
      _this._uploadAVR109(eggs, cb);
    });
  } else {
    cb(new Error('not a supported programming protocol: ' + _this.board.protocol));
  }
};

/**
 * Sets the DTR/RTS lines to either true or false
 *
 * @param {boolean} bool - value to set DTR and RTS to
 * @param {number} timeout - number in milliseconds to delay after
 * @param {function} callback - function to run upon completion/error
 */
AvrgirlArduino.prototype._setDTR = function(bool, timeout, callback) {
  var _this = this;
  var props = {
    rts: bool,
    dtr: bool
  };

  _this.serialPort.set(props, function(error) {
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
AvrgirlArduino.prototype._pollForPort = function(callback) {
  var _this = this;
  var tries = 0;
  var delay = 300;

  function checkList() {
    Serialport.list(function(error, ports) {
      // iterate through ports looking for the one port to rule them all
      for (var i = 0; i < ports.length; i++) {
        if (ports[i].comName === _this.options.port) {
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
AvrgirlArduino.prototype._cycleDTR = function(callback) {
  var _this = this;

  async.series([
    _this._setDTR.bind(_this, true, 250),
    _this._setDTR.bind(_this, false, 50)
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
AvrgirlArduino.prototype._resetSTK500 = function(callback) {
  var _this = this;

  // cycle DTR/RTS from low to high
  _this._cycleDTR(function(error) {
    if (!error) {
      _this.debug('reset complete.');
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
AvrgirlArduino.prototype._uploadSTK500v1 = function(eggs, callback) {
  var _this = this;

  // do we have a connection instance yet?
  if (!_this.serialPort) {
    _this._setUpSerial();
  }

  // open connection
  _this.serialPort.open(function(error) {
    if (error) { return callback(error); }

    _this.debug('connected');

    // open/parse supplied hex file
    var hex = _this._parseHex(eggs);

    // reset
    _this._resetSTK500(function(error) {
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
 * Upload method for the STK500v2 protocol
 *
 * @param {string} eggs - path to hex file for uploading
 * @param {function} callback - function to run upon completion/error
 */
AvrgirlArduino.prototype._uploadSTK500v2 = function(eggs, callback) {
  var _this = this;

  // do we have a connection instance yet?
  if (!_this.serialPort) {
    _this._setUpSerial();
  }

  // open connection
  _this.serialPort.open(function(error) {
    if (error) {
      return callback(error);
    }

    // instantiate stk500v2 with newly open serialport
    _this.chip = _this.chip(_this.serialPort);

    _this.debug('connected');

    // open/parse supplied hex file
    var hex = _this._parseHex(eggs);

    async.series([
        function(callback) {
          _this._resetSTK500(callback);
        },

        function(callback) {
          _this.chip.sync(5, callback);
        },

        function(callback) {
          _this.chip.verifySignature(_this.board.signature, callback);
        },

        function(callback) {
          _this.chip.enterProgrammingMode(_this.board, callback);
        },

        function(callback) {
          _this.debug('flashing, please wait...');
          _this.chip.upload(hex, _this.board.pageSize, callback);
        },

        function(callback) {
          _this.chip.exitProgrammingMode(callback);
        }
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

/**
 * Software resets an Arduino AVR109 bootloaded chip into bootloader mode
 *
 * @param {function} callback - function to run upon completion/error
 */
AvrgirlArduino.prototype._resetAVR109 = function(callback) {
  var _this = this;

  _this.debug('resetting board...');

  _this.serialPort = new Serialport.SerialPort(_this.options.port, {
    baudRate: 1200,
  });

  // open a connection, then immediately close to perform the reset of the board.
  _this.serialPort.open(function() {
    _this._cycleDTR(function(error) {
      if (error) { return callback(error); }

      _this._pollForPort(function(connected) {
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
AvrgirlArduino.prototype._uploadAVR109 = function(eggs, callback) {
  var _this = this;

  // do we have a connection instance yet?
  if (!_this.serialPort) {
    _this._setUpSerial();
  }

  _this.serialPort.open(function(error) {
    if (error) {
      return callback(error);
    }

    _this.debug('connected');

    fs.readFile(eggs, function(error, data) {
      if (error) {
        return callback(error);
      }

      _this.chip.init(_this.serialPort, {
        signature: _this.board.signature.toString()
      }, function(error, flasher) {
        if (error) {
          return callback(error);
        }

        _this.debug('flashing, please wait...');

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
          function(error) {
            var color = (error ? colors.red : colors.green);

            _this.debug(color('flash complete.'));
            return callback(error);
          });
      });
    });
  });
};

/**
 * Return a list of devices on serial ports. In addition to the output provided
 * by SerialPort.list, it adds a platform independent PID in _pid
 *
 * @param {function} callback - function to run upon completion/error
 */
AvrgirlArduino.listPorts = function(callback) {
  var foundPorts = [];

  // list all available ports
  Serialport.list(function(err, ports) {
    if (err) { return callback(err); }

    // iterate through ports
    for (var i = 0; i < ports.length; i += 1) {
      var pid;

      // are we on windows or unix?
      if (ports[i].productId) {
        pid = ports[i].productId;
      } else if (ports[i].pnpId) {
        pid = '0x' + /PID_\d*/.exec(ports[i].pnpId)[0].substr(4);
      } else {
        pid = '';
      }

      ports[i]._standardPid = pid;
      foundPorts.push(ports[i]);
    }

    return callback(null, foundPorts);
  });
};

/**
 * Finds a list of available USB ports, and matches for the right pid
 * Auto finds the correct port for the chosen Arduino
 *
 * @param {function} callback - function to run upon completion/error
 */
AvrgirlArduino.prototype._sniffPort = function(callback) {
  var _this = this;
  AvrgirlArduino.listPorts(function(error, ports) {
    // iterate through ports
    for (var i = 0; i < ports.length; i += 1) {
      // iterate through all possible pid's
      for (var j = 0; j < _this.board.productId.length; j += 1) {
        if (ports[i]._standardPid === _this.board.productId[j]) {
          // match! Return the port/path
          return callback(ports[i].comName);
        }
      }
    }

    // didn't find a match :(
    return callback(null);
  });
};

module.exports = AvrgirlArduino;
