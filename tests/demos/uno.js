var Avrgirl = require('../../avrgirl-arduino');
var avrgirl = new Avrgirl({
  board: 'uno',
  debug: true
});

var hex = __dirname + '/../../node_modules/stk500/arduino-1.0.6/uno/Blink.cpp.hex';

avrgirl.flash(hex, function (error) {
  if (error) {
    console.error(error);
  } else {
    console.info('done.');
  }
});
