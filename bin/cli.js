#!/usr/bin/env node
var Avrgirl = require('../avrgirl-arduino');
var boards = require('../boards');
var parseArgs = require('minimist');
var path = require('path');
var child = require('child_process');
var testPilot = require('../lib/test-pilot-checker');
var fs = require('fs');

var args = (process.argv.slice(2));
var argv = parseArgs(args, {});
var userAction = argv._[0];
var help = 'Usage:\n' +
  '  avrgirl-arduino flash -f <file> -a <arduino spec> [-p <port>] [-v]\n' +
  '  avrgirl-arduino boards\n' +
  '  avrgirl-arduino list\n' +
  '  avrgirl-arduino test-pilot';

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

function handlePotentialCustomBoardFile(filename) {
  const filepath = path.resolve(process.cwd(), filename);

  let contents;
  try {
    contents = fs.readFileSync(filepath, 'utf8');
  } catch (error) {
    // let's try to provide a more precise error if it looks like a real filename
    if (filename.includes('.') || filename.includes(path.sep)) {
      console.error(new Error('Oops! We could not read the custom board JSON file.'));
      process.exit(1);
    }
    return;
  }

  try {
    let board = JSON.parse(contents);
    board.signature = Buffer.from(board.signature);
    return board;
  } catch (error) {
    console.error(new Error('Oops! The custom board JSON file is invalid.'));
    process.exit(1);
  }
}

function handleInput(action, argz) {
  switch (action) {
    case 'flash': {
      if (!argz.f || !argz.a) {
        showHelp();
        process.exit(1);
      } else {
        const arduino = argz.a;
        let board = boards[arduino] || handlePotentialCustomBoardFile(arduino);

        if (!board) {
          console.error(new Error('Oops! That board is not supported, sorry.'));
          process.exit(1);
        }
        // run flash function here if all is well
        var options = {
          board: board,
          port: argz.p || '',
          debug: argz.v || false
        };

        flash(argz.f, options);
      }

      break;
    }

    case 'boards': {
      var boardNames = Object.keys(boards).sort();
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

    case 'test-pilot': {
      console.log('running preflight check...');
      testPilot.checkForInstall(function(err, isInstalled) {
        if (isInstalled) {
          testPilot.run();
        } else {
          console.log('installing test pilot, won\'t be long...');
          testPilot.install(function(err) {
            if (err) {
              var msg = err;
              if (err.code === 'EACCES' || err.code === 'EPERM') {
                msg = new Error('Oops! We ran into a permissions issue... you might want to check out this resource https://docs.npmjs.com/getting-started/fixing-npm-permissions');
              }
              return console.log(msg);
            } else {
              testPilot.run();
            }
          });
        }
      });
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
