var injectDependencies = function(boards, Connection, protocols) {
  var EventEmitter = require('events');
  var util = require('util');
  var tools = require('./lib/tools');
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
      port: opts.port || '',
      manualReset: opts.manualReset || false
    };

    // this here checks for 3 conditions:
    // if debug option is simply true, we want to fall back to default debug function
    // if a custom debug function is passed in, we want to assign debug to be that
    // if debug option is false, then run debug as a no-op
    if (this.options.debug === true) {
      this.debug = console.log.bind(console);
    } else if (typeof this.options.debug === 'function') {
      this.debug = this.options.debug;
    } else {
      this.debug = function() {};
    }

    // handle 'sparse' boards, ie. boards with only the 'name' property defined
    if (typeof this.options.board === 'object') {
      const properties = Object.getOwnPropertyNames(this.options.board);
      if ((properties.length === 1) && (properties[0] === 'name')) {
        this.options.board = this.options.board.name;
      }
    }

    if (typeof this.options.board === 'string') {
      this.options.board = boards[this.options.board];
    }

    if (this.options.board && !this.options.board.manualReset) {
      this.options.board.manualReset = this.options.manualReset;
    }

    this.connection = new Connection(this.options);

    if (this.options.board) {
      var Protocol = protocols[this.options.board.protocol] || function() {};

      this.protocol = new Protocol({
        board: this.options.board,
        connection: this.connection,
        debug: this.debug
      });
    }

    EventEmitter.call(this);
  };

  util.inherits(AvrgirlArduino, EventEmitter);

  /**
   * Validates the board properties
   *
   * @param {function} callback - function to run upon completion/error
   */
  AvrgirlArduino.prototype._validateBoard = function(callback) {
    if (typeof this.options.board !== 'object') {
      // cannot find a matching board in supported list
      return callback(new Error('"' + this.options.board + '" is not a supported board type.'));

    } else if (!this.protocol.chip) {
      // something went wrong trying to set up the protocol
      var errorMsg = 'not a supported programming protocol: ' + this.options.board.protocol;
      return callback(new Error(errorMsg));

    } else if (!this.options.port && this.options.board.name === 'pro-mini') {
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
  AvrgirlArduino.prototype.listPorts = AvrgirlArduino.listPorts =
  AvrgirlArduino.prototype.list = AvrgirlArduino.list = function(callback) {
    return Connection.prototype._listPorts(callback);
  };

  /**
   * Static method to return the names of all known boards.
   */
  AvrgirlArduino.listKnownBoards = function() {
    // filter the boards to find all non-aliases
    return Object.keys(boards).filter(function(name) {
      // fetch the current board aliases
      var aliases = boards[name].aliases;
      // only allow the name if it's not an alias
      return !aliases || !~aliases.indexOf(name);
    });
  };

  // shift public static exposure for demo purposes
  AvrgirlArduino.prototype.tools = tools;

  return AvrgirlArduino;
};

module.exports = injectDependencies;

