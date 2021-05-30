var STK2 = require('stk500-v2');
var colors = require('colors');
var tools = require('./tools');
var Protocol = require('./protocol');
var util = require('util');

var Stk500v2 = function(options) {
  options.protocol = function() { return STK2; };

  Protocol.call(this, options);
};

util.inherits(Stk500v2, Protocol);

/**
 * Uploads the provided hex file to the board, via the stk500v2 protocol
 *
 * @param {buffer} hex - buffer of hex file for uploading
 * @param {function} callback - function to run upon completion/error
 */
Stk500v2.prototype._upload = async function(file) {
  this.serialPort = this.connection.serialPort;
  var serialPortOpen = util.promisify(this.serialPort.open).bind(this.serialPort);

  // open/parse supplied hex file
  var hex = tools._parseHex(file);
  if (!Buffer.isBuffer(hex)) {
    throw new Error('an invalid hex file was supplied'); 
  }

  // open connection
  await serialPortOpen();
  this.debug('connected');

  // instantiate stk500v2 with newly open serialport
  var chip = this.chip(this.serialPort);

  // temporary promisify dependency's callback interfaces
  var chipSync = util.promisify(chip.sync).bind(chip);
  var chipVerifySignature = util.promisify(chip.verifySignature).bind(chip);
  var chipEnterProgrammingMode = util.promisify(chip.enterProgrammingMode).bind(chip);
  var chipUpload = util.promisify(chip.upload).bind(chip);
  var chipExitProgrammingMode = util.promisify(chip.exitProgrammingMode).bind(chip);

  await this._reset();
  
  var color = colors.red;

  try {
    await chipSync(5);
    await chipVerifySignature(this.board.signature);
    await chipEnterProgrammingMode(this.board);

    this.debug('flashing, please wait...');

    await chipUpload(hex, this.board.pageSize);
    await chipExitProgrammingMode();

    color = colors.green;
  } catch (e) {
    color = colors.red;
    throw e;
  } finally {
    this.debug(color('flash complete.'));
    this.serialPort.close();
  }
};

module.exports = Stk500v2;
