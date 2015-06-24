var Serialport = require('serialport');
var intelhex = require('intel-hex');
var Stk500 = require('stk500');
var fs = require('fs');

var Avrgirl_arduino = function (opts) {
  this.options = {};
};

module.exports = Avrgirl_arduino;
