var Avrgirl = require('../avrgirl-arduino');
var boards = require('../boards');
var parseArgs = require('minimist');
var path = require('path');

var args = (process.argv.slice(2));
var argv = parseArgs(args, opts={})
var userAction = argv._[0];
var help = 'usage: avrgirl-arduino flash -f <file> -a <arduino name> [-p <port>]';

// console.log(argv._[0], argv);

// change this to verbose instead, then set up proper error codes and exit statuses (via process.exit)
var debug = argv.q ? function() {} : console.log;

handleInput(userAction, argv);

function handleInput(action, argz) {
  switch (action) {
    case 'flash':
      if (!argz.f || !argz.a) { return debug(help) }
      else if (!boards[argz.a]) { return debug('Oops! That board is not supported, sorry.') }
      else {
        var options = {};
        options.board = argz.a;
        if (argz.p) { options.port = argz.p; }
        flash(argz.f, options);
      }
      // run flash function here if all is well
      break;
    case undefined:
      return debug(help);
      break;
    default:
      return debug(help);
      break;
  }
}

function flash(file, options) {
  var avrgirl = new Avrgirl(options);
  var filepath = path.resolve(process.cwd(), file);

  avrgirl.flash(filepath, function(error) {
    if (error) { return debug(error) }
     return debug('flash complete.'); 
  });

}
