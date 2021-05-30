var Avrgirl = require('../../');

var avrgirl = new Avrgirl({
  board: 'uno',
  debug: true
});

var hex = __dirname + '/../../junk/hex/uno/StandardFirmata.cpp.hex';

(async function() {
  try {
    await avrgirl.flash(hex) 
    console.info('done.');
  } catch (error) {
    console.error(error);
  }
})();
