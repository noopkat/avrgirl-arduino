/**
 * Provides a somewhat complete mock implementation of node-serialport
 * built on top of virtual-serialport for later stubbing.
 */

var util = require('util');
var VirtualSerialPort = require('virtual-serialport');

var MockSerial = function() {
  VirtualSerialPort.call(this);
};

util.inherits(MockSerial, VirtualSerialPort);

MockSerial.prototype.open = function(callback) {
  if (callback) {
    return callback(null);
  }

  return;
};

MockSerial.prototype.close = function(callback) {
  if (callback) {
    return callback(null);
  }

  return;
};

MockSerial.prototype.drain = function(callback) {
  if (callback) {
    return callback(null);
  }

  return;
};

MockSerial.prototype.set = function(props, callback) {
  if (callback) {
    return callback(null);
  }

  return;
};

MockSerial.list = MockSerial.prototype.list = function() { return Promise.resolve([])};

module.exports = {
  list: function() { return Promise.resolve([])},


  parsers: {
    raw: function() {},

    readline: function() {},

    byteLength: function() {},

    byteDelimeter: function() {}
  },
  SerialPort: MockSerial
};
