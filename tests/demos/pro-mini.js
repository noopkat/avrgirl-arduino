var Avrgirl = require('../../avrgirl-arduino');
var avrgirl = new Avrgirl({
  board: 'pro-mini',
  port: '/dev/cu.usbmodem1d1131',
  debug: true
});

var hex = __dirname + '/../../junk/hex/pro-mini/Blink-3v.cpp.hex';

avrgirl.flash(hex, function (error) {
  if (error) {
    console.error(error);
  } else {
    console.info('done.');
  }
});
