var Avrgirl = require('../../');
var avrgirl = new Avrgirl({
  board: 'feather',
  debug: true
});

var hex = __dirname + '/../../junk/hex/feather/Blink.cpp.hex';

avrgirl.flash(hex, function(error) {
  if (error) {
    console.error(error);
  } else {
    console.info('done.');
  }
});
