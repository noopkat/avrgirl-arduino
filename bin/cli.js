#!/usr/bin/env node
var Avrgirl = require('../avrgirl-arduino');
var boards = require('../boards');
var parseArgs = require('minimist');
var path = require('path');

var args = (process.argv.slice(2));
var argv = parseArgs(args, {});
var userAction = argv._[0];
var help = 'Usage:\n' +
  '  avrgirl-arduino flash -f <file> -a <arduino name> [-p <port>] [-v]\n' +
  '  avrgirl-arduino boards\n' +
  '  avrgirl-arduino list';

function showHelp() {
  console.log(help);
}

function flash(file, options) {
  var avrgirl = new Avrgirl(options);
  var filepath = path.resolve(process.cwd(), file);

  avrgirl.flash(filepath, function(error) {
    if (error) {
      console.error(error);
      process.exit(1);
    }
  });
}

function handleInput(action, argz) {
  switch (action) {
    case 'flash': {
      if (!argz.f || !argz.a) {
        showHelp();
        process.exit(1);
      } else if (!boards.byName[argz.a]) {
        console.error(new Error('Oops! That board is not supported, sorry.'));
        process.exit(1);
      } else {
        // run flash function here if all is well
        var options = {
          board: argz.a,
          port: argz.p || '',
          debug: argz.v || false
        };

        flash(argz.f, options);
      }

      break;
    }

    case 'boards': {
      var boardNames = Object.keys(boards.byName).sort();
      console.log('Supported Boards:\n - ' + boardNames.join('\n - '));
      break;
    }

    case 'list': {
      Avrgirl.listPorts(function(err, ports) {
        console.log(ports);
      });

      break;
    }

    case 'help': {
      showHelp();
      process.exit();
      break;
    }

    default: {
      // Invalid or no argument specified, show help and exit with an error status
      showHelp();
      process.exit(9);
      break;
    }
  }
}

handleInput(userAction, argv);
