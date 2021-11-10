var Avrgirl = require('../../');
/*
var board = {
  name: 'micro',
  baud: 57600,
  signature: Buffer.from([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
  productId: ['0x0037', '0x8037', '0x0036'],
  protocol: 'avr109'
};
*/
var avrgirl = new Avrgirl({
  board: 'micro',
  debug: true
});

var hex = __dirname + '/../../junk/hex/micro/StandardFirmata.cpp.hex';

(async function() {
  try {
    await avrgirl.flash(hex);
    console.info('done.');
  } catch (error) {
    console.error(error);
  }
})();
