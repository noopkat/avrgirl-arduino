var boards = require('./boards');
var Connection = require('./lib/connection');
var protocols = require('./lib/protocols');

/**
 * Constructor
 *
 * @param {object} opts - options for consumer to pass in
 */
var AvrgirlArduino = function(opts) {
  opts = opts || {};

  this.options = {
    debug: opts.debug || false,
    board: opts.board || 'uno',
    port: opts.port || ''
  };

  this.debug = this.options.debug ? console.log.bind(console) : function() {};

  this.connection = new Connection(this.options);

  this.board = boards.byName[this.options.board];

  if (this.board) {
    var Protocol = protocols[this.board.protocol] || function() {};

    this.protocol = new Protocol({
      board: this.board,
      connection: this.connection,
      debug: this.options.debug
    });
  }
};

/**
 * Validates the board properties
 *
 * @param {function} callback - function to run upon completion/error
 */
AvrgirlArduino.prototype._validateBoard = function(callback) {
  if (!this.board) {
    // cannot find a matching board in supported list
    return callback(new Error('"' + this.options.board + '" is not a supported board type.'));

  } else if (!this.protocol.chip) {
    // something went wrong trying to set up the protocol
    return callback(new Error('not a supported programming protocol: ' + this.board.protocol));

  } else if (!this.options.port && this.options.board === 'pro-mini') {
    // when using a pro mini, a port is required in the options
    return callback(new Error('using a pro-mini, please specify the port in your options.'));

  } else {
    // all good
    return callback(null);
  }
};

/**
 * Public method for flashing a hex file to the main program allocation of the Arduino
 *
 * @param {string} file - path to hex file for uploading
 * @param {function} callback - function to run upon completion/error
 */
AvrgirlArduino.prototype.flash = function(file, callback) {
  var _this = this;

  // validate board properties first
  _this._validateBoard(function(error) {
    if (error) { return callback(error); }

    // set up serialport connection
    _this.connection._init(function(error) {
      if (error) { return callback(error); }

      // upload file to board
      _this.protocol._upload(file, callback);
    });
  });
};

/**
 * Return a list of devices on serial ports. In addition to the output provided
 * by SerialPort.list, it adds a platform independent PID in _pid
 *
 * @param {function} callback - function to run upon completion/error
 */
AvrgirlArduino.prototype.listPorts = AvrgirlArduino.listPorts = function(callback) {
  return Connection.prototype._listPorts(callback);
};

module.exports = AvrgirlArduino;
