var Avrgirl = require('../../avrgirl-arduino');
var avrgirl = new Avrgirl({
  board: 'unooooooo',
  debug: true
});

var hex = __dirname + '/../../junk/hex/uno/Blink.cpp.hex';

avrgirl.flash(hex, function(error) {
  if (error) {
    if (error.code === 'unsupported_board_error') {
      console.log("I got to write a custom error message for the user, yay!");
    }
    console.error(error);
  } else {
    console.info('done.');
  }
});
