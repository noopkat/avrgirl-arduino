var Serialport = require('serialport');
var awty = require('awty');

var Connection = function(options) {
  this.options = options;
  this.debug = this.options.debug ? console.log.bind(console) : function() {};

  this.board = this.options.board;
};

Connection.prototype._init = function(callback) {
  var _this = this;

  // check for port
  if (!_this.options.port) {
    // no port, auto sniff for the correct one
    _this._sniffPort(function(error, port) {
      if (port.length) {
        // found a port, save it
        _this.options.port = port[0].path;

        _this.debug('found ' + _this.options.board.name + ' on port ' + _this.options.port);

        // set up serialport for it
        _this._setUpSerial(function(error) {
          return callback(error);
        });
      } else {
        // we didn't find the board
        return callback(new Error('no Arduino ' + '\'' + _this.options.board.name + '\'' + ' found.'));
      }
    });
  } else {
    // when a port is manually specified
    _this._setUpSerial(function(error) {
      return callback(error);
    });
  }
};

/**
 * Create new serialport instance for the Arduino board, but do not immediately connect.
 */
Connection.prototype._setUpSerial = function(callback) {
  this.serialPort = new Serialport(this.options.port, {
    baudRate: this.board.baud,
    autoOpen: false
  });
  return callback(null);
};

/**
 * Finds a list of available USB ports, and matches for the right pid
 * Auto finds the correct port for the chosen Arduino
 *
 * @param {function} callback - function to run upon completion/error
 */
Connection.prototype._sniffPort = function(callback) {
  var _this = this;
  var pidList = _this.board.productId.map(function(id) {
    return parseInt(id, 16);
  });

  _this._listPorts(function(error, ports) {
    // filter for a match by product id
    var portMatch = ports.filter(function(p) {
      return pidList.indexOf(parseInt(p._standardPid, 16)) !== -1;
    });

    return callback(null, portMatch);
  });
};

/**
 * Sets the DTR/RTS lines to either true or false
 *
 * @param {boolean} bool - value to set DTR and RTS to
 * @param {number} timeout - number in milliseconds to delay after
 * @param {function} callback - function to run upon completion/error
 */
Connection.prototype._setDTR = function(bool, timeout, callback) {
  var _this = this;
  var props = {
    rts: bool,
    dtr: bool
  };

  _this.serialPort.set(props, function(error) {
    if (error) {
      return callback(error);
    }

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
Connection.prototype._pollForPort = function(callback) {
  var _this = this;

  var poll = awty(function(next) {
    var found = false;

    // try to sniff port instead (for port hopping devices)
    _this._sniffPort(function(error, port) {
      if (port.length) {
        // found a port, save it
        _this.options.port = port[0].path;
        found = true;
      }

      next(found);
    });
  });

  poll.every(100).ask(15);

  poll(function(foundPort) {
    if (foundPort) {
      _this.debug('found port on', _this.options.port);
      // set up serialport for it
      _this._setUpSerial(function(error) {
        return callback(error);
      });
    } else {
      // we also could not find the device on auto sniff
      return callback(new Error('could not reconnect after resetting board.'));
    }
  });
};

Connection.prototype._pollForOpen = function(callback) {
  var _this = this;

  var poll = awty(function(next) {
    _this.serialPort.open(function(error) {
      next(!error);
    });
  });

  poll.every(200).ask(10);

  poll(function(isOpen) {
    var error;
    if (!isOpen) {
      error = new Error('could not open board on ' + _this.serialPort.path);
    }

    callback(error);
  });
};

/**
 * Return a list of devices on serial ports. In addition to the output provided
 * by SerialPort.list, it adds a platform independent PID in _pid
 *
 * @param {function} callback - function to run upon completion/error
 */
Connection.prototype._listPorts = function(callback) {
  var foundPorts = [];

  // list all available ports
  Serialport.list().then(function(ports) {
    // iterate through ports
    for (var i = 0; i < ports.length; i += 1) {
      var pid;

      // are we on windows or unix?
      if (ports[i].productId) {
        pid = ports[i].productId;
      } else if (ports[i].pnpId) {
        try {
          pid = '0x' + /PID_\d*/.exec(ports[i].pnpId)[0].substr(4);
        } catch (err) {
          pid = '';
        }
      } else {
        pid = '';
      }

      ports[i]._standardPid = pid;
      foundPorts.push(ports[i]);
    }

    if (callback) return callback(null, foundPorts);
  }).catch(function(error) { if (callback) return callback(error); });
};

module.exports = Connection;
