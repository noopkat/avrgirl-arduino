var Avrgirl = require('../../');
var avrgirl = new Avrgirl({
  board: 'pro-mini',
  port: '/dev/cu.usbserial-A50285BI',
  debug: true
});

var hex = __dirname + '/../../junk/hex/pro-mini/StandardFirmata-3v.cpp.hex';

avrgirl.flash(hex, function(error) {
  if (error) {
    console.error(error);
  } else {
    console.info('done.');
  }
});
