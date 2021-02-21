/**
 * Generic Protocol for other protocols to inherit from
 *
 */
var Protocol = function(options) {
  this.debug = options.debug;
  this.megaDebug = options.megaDebug;

  this.board = options.board;
  this.connection = options.connection;
  // eslint-disable-next-line new-cap
  this.chip = new options.protocol({ quiet: !this.megaDebug });
};

/**
 * Resets an Arduino STK500 bootloaded chip by pulsing DTR high.
 *
 * Avoids the dreaded timeout bug if the serialport was opened since the device
 * was powered.
 *
 * @param {function} callback - function to run upon completion/error
 */
Protocol.prototype._reset = async function() {
  // set DTR from high to low
  await this.connection._setDTR(false, 250);
  this.debug('reset complete.');
};

module.exports = Protocol;
