var Avrgirl = require('../../avrgirl-arduino');
var avrgirl = new Avrgirl({
  board: 'micro',
  debug: true
});

var hex = __dirname + '/../../junk/hex/micro/Blink.cpp.hex';

avrgirl.flash(hex, function(error) {
  if (error) {
    console.error(error);
  } else {
    console.info('done.');
  }
});
