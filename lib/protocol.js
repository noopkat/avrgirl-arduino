/**
 * Generic Protocol for other protocols to inherit from
 *
 */
var Protocol = function(options) {
  this.debug = options.debug;

  this.board = options.board;
  this.connection = options.connection;

  // eslint-disable-next-line new-cap
  this.chip = new options.protocol({ quiet: true });
};

/**
 * Resets an Arduino STK500 bootloaded chip by pulsing DTR high.
 *
 * Avoids the dreaded timeout bug if the serialport was opened since the device
 * was powered.
 *
 * @param {function} callback - function to run upon completion/error
 */
Protocol.prototype._reset = function(callback) {
  var _this = this;

  // set DTR from high to low
  _this.connection._setDTR(false, 250, function(error) {
    if (!error) {
      _this.debug('reset complete.');
    }

    return callback(error);
  });
};

module.exports = Protocol;
