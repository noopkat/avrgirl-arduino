var Serialport = require('./browser-serialport');
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

Connection.prototype._init = function() {
  this._setUpSerial();
};

/**
 * Create new serialport instance for the Arduino board, but do not immediately connect.
 */
Connection.prototype._setUpSerial = function() {
  this.serialPort = new Serialport('', {
    baudRate: this.board.baud,
    autoOpen: false
  });
  //this.serialPort.on('open', function() {
  //    _this.emit('connection:open');
  // });
};

/**
 * Finds a list of available USB ports, and matches for the right pid
 * Auto finds the correct port for the chosen Arduino
 *
 * @param {function} callback - function to run upon completion/error
 */
Connection.prototype._sniffPort = async function() {
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
    rts: false,
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
Connection.prototype._pollForPort = async function() {
  return new Promise((resolve, reject) => {
    var poll = awty(async (next) => {
      var found = false;

      // try to sniff port instead (for port hopping devices)
      const port = await this._sniffPort();
      // if (error) return callback(error);
      if (port.length) {
        // found a port, save it
        this.options.port = port[0].path;
        found = true;
      }

      next(found);
    });

    poll.every(100).ask(15);

    poll((foundPort) => {
      if (foundPort) {
        this.debug('found port on', this.options.port);
        // set up serialport for it
        this._setUpSerial();
        resolve();
      } else {
        // we also could not find the device on auto sniff
        reject(new Error('could not reconnect after resetting board.'));
      }
    });
  });
};

Connection.prototype._pollForOpen = function() {
  return new Promise((resolve, reject) => {
    let done;
    var poll = awty(async (next) => {
      try {
        await this.serialPort.open();
        done = true;
      } catch (e) {
        done = false; 
      } finally {
        next(done);
      }
    });

    poll.every(200).ask(10);

    poll((isOpen) => {
      if (!isOpen) {
        reject(new Error('could not open board on ' + this.serialPort.path));
      } else {
        resolve();
      }
    });
  });
};

/**
 * Pulse the DTR/RTS lines low then high
 *
 * @param {function} callback - function to run upon completion/error
 */
Connection.prototype._cycleDTR = async function() {
  await this._setDTR_async(true, 250);
  await this._setDTR_async(false, 50);
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

    ports[i]._standardPid = pid;
    foundPorts.push(ports[i]);
  }
  return foundPorts;
};

module.exports = Connection;
