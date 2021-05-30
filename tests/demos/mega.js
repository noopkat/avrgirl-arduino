var Avrgirl = require('../../');
var avrgirl = new Avrgirl({
  board: 'mega',
  debug: true
});

var hex = __dirname + '/../../junk/hex/mega/StandardFirmata.cpp.hex';

(async function() {
  try {
    await avrgirl.flash(hex) 
    console.info('done.');
  } catch (error) {
    console.error(error);
  }
})();
