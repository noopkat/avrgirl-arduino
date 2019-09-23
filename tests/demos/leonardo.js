var Avrgirl = require('../../');
var avrgirl = new Avrgirl({
  board: 'leonardo',
  debug: true
});

var hex = __dirname + '/../../junk/hex/leonardo/Blink.cpp.hex';

avrgirl.flash(hex, function(error) {
  if (error) {
    console.error(error);
  } else {
    console.info('done.');
  }
});
