var boards = require('./boards');
var Connection = require('./lib/connection-browser');
var protocols = require('./lib/protocols');
var AvrgirlArduino = require('./avrgirl-arduino');

module.exports = AvrgirlArduino(boards, Connection, protocols);

