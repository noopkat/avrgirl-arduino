var Serialport = require('./browser-serialport');
var async = require('async');
var awty = require('awty');

var Connection = function(options) {
  this.options = options;
  this.debug = this.options.debug ? console.log.bind(console) : function() {};

  this.board = this.options.board;
  // TODO: support avr109 boards
  if (this.board.protocol === 'avr109') {
    throw new Error(
      `Sorry, we currently don't support ${this.board.name} or other avr109 boards in webserial. Please see https://github.com/noopkat/avrgirl-arduino/issues/204#issuecomment-703284131 for further details`
    );
  }
};

Connection.prototype._init = function(callback) {
  this._setUpSerial(function(error) {
    return callback(error);
  });
};

/**
 * Create new serialport instance for the Arduino board, but do not immediately connect.
 */
Connection.prototype._setUpSerial = function(callback) {
  this.serialPort = new Serialport('', {
    baudRate: this.board.baud,
    autoOpen: false
  });
  this.serialPort.on('open', function() {
    //    _this.emit('connection:open');
  })
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
    rts: false,
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
Connection.prototype._pollForPort = function(callback) {
  var _this = this;

  var poll = awty(function(next) {
    var found = false;

    // try to sniff port instead (for port hopping devices)
    _this._sniffPort(function(error, port) {
      if (port.length) {
        // found a port, save it
        _this.options.port = port[0].comName;
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
 * Pulse the DTR/RTS lines low then high
 *
 * @param {function} callback - function to run upon completion/error
 */
Connection.prototype._cycleDTR = function(callback) {
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
 * Return a list of devices on serial ports. In addition to the output provided
 * by SerialPort.list, it adds a platform independent PID in _pid
 *
 * @param {function} callback - function to run upon completion/error
 */
Connection.prototype._listPorts = function(callback) {
  var foundPorts = [];

  // list all available ports
  Serialport.list(function(err, ports) {
    if (err) { return callback(err); }

    // iterate through ports
    for (var i = 0; i < ports.length; i += 1) {
      var pid;

      // are we on windows or unix?
      // TODO: this can be simplified as Chrome will likely give us a consistent set of props across each OS
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

      // TODO: find out if returned ports are immutable
      ports[i]._standardPid = pid;
      foundPorts.push(ports[i]);
    }

    return callback(null, foundPorts);
  });
};

module.exports = Connection;
