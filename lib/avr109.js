var AVR109 = require('chip.avr.avr109');
var colors = require('colors');
var fs = require('fs').promises;
var Serialport = require('serialport');
var Protocol = require('./protocol');
var util = require('util');

var Avr109 = function(options) {
  options.protocol = function() { return AVR109; };

  Protocol.call(this, options);
};

util.inherits(Avr109, Protocol);

/**
 * Uploads the provided hex file to the board, via the AVR109 protocol
 *
 * @param {string, Buffer} hex - path of hex file for uploading, or Buffer of the hex data
 * @param {function} callback - function to run upon completion/error
 */
Avr109.prototype._upload = async function(file) {
  var data;

  if (typeof file === 'string') {
    data = await fs.readFile(file, 'utf8');
  } else {
    data = file;
  }

  await this._reset();
  this.debug('reset complete.');

  await this.connection._pollForOpen();
  this.debug('connected');
  
  var color = colors.red;

  try {
    await this._write(data);
    color = colors.green;
  } catch (e) {
    color = colors.red;
    throw e;
  } finally {
    this.debug(color('flash complete.'));
    // this is a workaround, please see https://github.com/noopkat/avrgirl-arduino/issues/193 
    // this.connection.serialPort.close();
  }
};

/**
 * Performs the writing part of uploading to an AVR109 bootloaded chip
 *
 * @param {buffer} data - hex buffer to write to the chip
 * @param {function} callback - function to run upon completion/error
 */
Avr109.prototype._write = async function(data) {
  var options = {
    signature: this.board.signature.toString(),
    debug: this.megaDebug
  };
  
  const chipInit = util.promisify(this.chip.init).bind(this.chip);

  const flasher = await chipInit(this.connection.serialPort, options); 

  const erase = util.promisify(flasher.erase).bind(flasher);
  const program = util.promisify(flasher.program).bind(flasher);
  const verify = util.promisify(flasher.verify).bind(flasher);
  const fuseCheck = util.promisify(flasher.fuseCheck).bind(flasher);

  this.debug('flashing, please wait...');

  await erase();
  await program(data.toString());
  if (!this.board.disableVerify) await verify(); 
  await fuseCheck(); 
};

/**
 * Software resets an Arduino AVR109 bootloaded chip into bootloader mode
 *
 * @param {function} callback - function to run upon completion/error
 */
Avr109.prototype._reset = async function() {
  return new Promise((resolve, reject) => {
    var conn;

    if (this.board.manualReset) return resolve();

    // creating a temporary connection for resetting only
    var tempSerialPort = new Serialport(this.connection.options.port, {
      baudRate: 1200,
      autoOpen: false
    });

    this.connection.serialPort = tempSerialPort;
    conn = this.connection;

    this.debug('resetting board...');

    tempSerialPort.open(async (error) => {
      if (error) return reject(error);

      await conn._setDTR(false, 250);

      await conn._pollForPort();
      resolve();
    });
  });
};

module.exports = Avr109;
