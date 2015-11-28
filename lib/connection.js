var Serialport = require('serialport');
var async = require('async');
var boards = require('../boards.js');

var Connection = function(options) {
  this.options = options;
  this.debug = this.options.debug ? console.log.bind(console) : function() {};

  // get board properties
  this.board = boards.byName[this.options.board];
};

Connection.prototype._setup = function(callback) {
  var _this = this;

  // check for port
  if (!_this.options.port) {
    // no port, auto sniff for the correct one
    _this._sniffPort(function(error, port) {
      if (port.length) {
        // found a port, save it
        _this.options.port = port[0].comName;

        _this.debug('found ' + _this.options.board + ' on port ' + _this.options.port);

        // set up serialport for it
        _this._setUpSerial(function(error) {
          return callback(error);
        });
      } else {
        // we didn't find the board
        return callback(new Error('no Arduino ' + '\'' + _this.options.board + '\'' + ' found.'));
      }
    });
  } else {
    _this._setUpSerial(function(error) {
      return callback(error);
    });

  }
};

/**
 * Create new serialport instance for the Arduino board, but do not immediately connect.
 */
Connection.prototype._setUpSerial = function(callback) {
  this.serialPort = new Serialport.SerialPort(this.options.port, {
    baudRate: this.board.baud,
  }, false);
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
  var pidList = _this.board.productId;

  _this._listPorts(function(error, ports) {

    var portMatch = ports.filter(function(p) {
      return pidList.indexOf(p._standardPid) !== -1;
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
  var tries = 0;
  var delay = 300;

  function checkList() {
    Serialport.list(function(error, ports) {
      // iterate through ports looking for the one port to rule them all
      for (var i = 0; i < ports.length; i++) {
        if (ports[i].comName === _this.options.port) {
          return callback(null);
        }
      }

      tries += 1;
      if (tries < 4) {
        setTimeout(checkList, delay);
      } else {
        // timeout on too many tries
        return callback(new Error('could not reconnect after resetting board.'));
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

module.exports = Connection;
