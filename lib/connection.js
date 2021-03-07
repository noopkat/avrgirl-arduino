var Serialport = require('serialport');
var awty = require('awty');

var Connection = function(options) {
  this.options = options;
  this.debug = this.options.debug;

  this.board = this.options.board;
};

Connection.prototype._init = async function(callback) {
  // check for port
  if (!this.options.port) {
    // no port, auto sniff for the correct one
    var port = await this._sniffPort(); 
    if (!port.length) {
      throw new Error('no Arduino ' + '\'' + this.options.board.name + '\'' + ' found.');
    }

    // found a port, save it
    this.options.port = port[0].path;

    this.debug('found ' + this.options.board.name + ' on port ' + this.options.port);
  }

  this._setUpSerial();
};

/**
 * Create new serialport instance for the Arduino board, but do not immediately connect.
 */
Connection.prototype._setUpSerial = function() {
  this.serialPort = new Serialport(this.options.port, {
    baudRate: this.board.baud,
    autoOpen: false
  });
};

/**
 * Finds a list of available USB ports, and matches for the right pid
 * Auto finds the correct port for the chosen Arduino
 *
 * @param {function} callback - function to run upon completion/error
 */
Connection.prototype._sniffPort = async function(callback) {
  var pidList = this.board.productId.map(function(id) {
    return parseInt(id, 16);
  });

  var ports = await this._listPorts();
  // filter for a match by product id
  var portMatch = ports.filter(function(p) {
    return pidList.indexOf(parseInt(p._standardPid, 16)) !== -1;
  });

  return portMatch;
};

/**
 * Sets the DTR/RTS lines to either true or false
 *
 * @param {boolean} bool - value to set DTR and RTS to
 * @param {number} timeout - number in milliseconds to delay after
 * @param {function} callback - function to run upon completion/error
 */
Connection.prototype._setDTR = async function(bool, timeout) {
  var props = {
    rts: bool,
    dtr: bool
  };

  await this.serialPort.set(props);
  return new Promise(resolve => setTimeout(resolve, timeout));
};

/**
 * Checks the list of ports 4 times for a device to show up
 *
 * @param {function} callback - function to run upon completion/error
 */
Connection.prototype._pollForPort = function(callback) {
  var _this = this;

  var poll = awty(async (next) => {
    var found = false;

    // try to sniff port instead (for port hopping devices)
    const port = await _this._sniffPort();
     // if (error) return callback(error);
    if (port.length) {
        // found a port, save it
      _this.options.port = port[0].path;
      found = true;
    }

    next(found);
  });

  poll.every(100).ask(15);

  poll(function(foundPort) {
    if (foundPort) {
      _this.debug('found port on', _this.options.port);
      // set up serialport for it
      _this._setUpSerial();
      return callback(null);
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
Connection.prototype._listPorts = async function() {
  var foundPorts = [];

  // list all available ports
  const ports = await Serialport.list();
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
  return foundPorts;
};

module.exports = Connection;
