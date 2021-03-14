var STK = require('stk500');
var colors = require('colors');
var tools = require('./tools');
var Protocol = require('./protocol');
var util = require('util');

var Stk500v1 = function(options) {
  options.protocol = STK;
  Protocol.call(this, options);
};

util.inherits(Stk500v1, Protocol);

/**
 * Uploads the provided hex file to the board, via the stk500v1 protocol
 *
 * @param {string} file - path to hex file for uploading
 * @param {function} callback - function to run upon completion/error
 */
Stk500v1.prototype._upload = async function(file) {
  var chipBootload = util.promisify(this.chip.bootload).bind(this.chip);

  this.serialPort = this.connection.serialPort;

  // open/parse supplied hex file
  var hex = tools._parseHex(file);
  if (!Buffer.isBuffer(hex)) {
    throw new Error('an invalid hex file was supplied'); 
  }

  // open connection
  this.serialPort.open(async () => {
    this.debug('connected');

    // reset
    await this._reset();
    this.debug('flashing, please wait...');

    var color = colors.red;

    // flash
    try {
      await chipBootload(this.serialPort, hex, this.board);
      color = colors.green;
    } catch (e) {
      throw e; 
    } finally {
      this.debug(color('flash complete.'));
      this.serialPort.close();
    }
  });
};

Stk500v1.prototype._reset = async function() {
  await this.connection._setDTR(false, 250);
  await this.connection._setDTR(true, 50);
  this.debug('reset complete.');
};

module.exports = Stk500v1;
