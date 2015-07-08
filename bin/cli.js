var Avrgirl = require('../avrgirl-arduino');
var boards = require('../boards');
var parseArgs = require('minimist');
var path = require('path');

var args = (process.argv.slice(2));
var argv = parseArgs(args, opts={})
var userAction = argv._[0];
var help = 'usage: avrgirl-arduino flash -f <file> -a <arduino name> [-p <port>] [-v]';

function showHelp() {
  console.log(help);
}

var debug = argv.v ? console.log : function() {};

handleInput(userAction, argv);

function handleInput(action, argz) {
  switch (action) {
    case 'flash':
      if (!argz.f || !argz.a) { 
        return showHelp();
        process.exit(1);
      }
      else if (!boards[argz.a]) {
        console.error(new Error('Oops! That board is not supported, sorry.'));
        process.exit(1);
      }
      else {
        var options = {};
        options.board = argz.a;
        if (argz.p) { options.port = argz.p; }
        flash(argz.f, options);
      }
      // run flash function here if all is well
      break;
    case 'help':
      showHelp();
      return process.exit();
    case undefined:
      showHelp();
      return process.exit(1);
      break;
    default:
      showHelp();
      return process.exit(1);
      break;
  }
}

function flash(file, options) {
  var avrgirl = new Avrgirl(options);
  var filepath = path.resolve(process.cwd(), file);

  avrgirl.flash(filepath, function(error) {
    if (error) { 
      console.error(error);
      return process.exit(1);
    } else {
      debug('flash complete.'); 
      return process.exit();
    }
  });

}
