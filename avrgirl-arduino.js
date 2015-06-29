var Serialport = require('serialport');
var intelhex = require('intel-hex');
var Stk500 = require('stk500');
var fs = require('fs');

var Avrgirl_arduino = function (opts) {
  var opts = opts || {};

  this.options = {
    quiet: opts.quiet || false,
    board: opts.board || 'uno'
  }; 
};

Avrgirl_arduino.prototype._connect = function() {

};

Avrgirl_arduino.prototype._disconnect = function() {

};

Avrgirl_arduino.prototype.flash = function() {

};

Avrgirl_arduino.prototype.erase = function() {

};


Avrgirl_arduino.prototype.read = function() {

};

module.exports = Avrgirl_arduino;
