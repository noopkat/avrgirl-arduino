var Avrgirl = require('./avrgirl-arduino');

var avrgirl = new Avrgirl('uno');

avrgirl.flash('./node_modules/stk500/arduino-1.0.6/uno/Blink.cpp.hex', function (error) {
  if (error) {
    console.error('error:', error);
  } else {
    console.info('done.');
  }
});
