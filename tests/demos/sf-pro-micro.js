var Avrgirl = require('../../');
var avrgirl = new Avrgirl({
  board: 'sf-pro-micro',
  debug: true
});

var hex = __dirname + '/../../junk/hex/sf-pro-micro/Blink-5v.cpp.hex';

avrgirl.flash(hex, function(error) {
  if (error) {
    console.error(error);
  } else {
    console.info('done.');
  }
});
