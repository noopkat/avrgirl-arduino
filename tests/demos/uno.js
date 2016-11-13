var Avrgirl = require('../../avrgirl-arduino');
var board = {
    name: 'uno',
    baud: 115200,
    signature: new Buffer([0x1e, 0x95, 0x0f]),
    pageSize: 128,
    numPages: 256,
    timeout: 400,
    productId: ['0x0043', '0x7523', '0x0001', '0xea60'],
    protocol: 'stk500v1'
  };

var avrgirl = new Avrgirl({
  board: 'uno',
  debug: true
});

avrgirl = new Avrgirl({
  board: board,
  debug: true
});

var hex = __dirname + '/../../junk/hex/uno/StandardFirmata.cpp.hex';

avrgirl.flash(hex, function(error) {
  if (error) {
    console.error(error);
  } else {
    console.info('done.');
  }
});
