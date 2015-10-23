// This file is designed to run as a child process, as a workaround to the serialport.close() reliability issue.

var Serialport = require('serialport');
var port = process.argv[2];

// connecting to an AVR109 Leonardo based Arduino at 1200 baud rate resets the device upon disconnect.
var serialPort = new Serialport.SerialPort('/dev/cu.usbmodem1411', {
    baudRate: 1200,
});

// open a connection, then immediately close to perform the reset of the board.
serialPort.on('open', function() {
  serialPort.set({
    rts: true,
    dtr: true
  }, function(err) {
    setTimeout(function clear() {
      serialPort.set({
        rts: false,
        dtr: false
      }, function(err) {
        setTimeout(function done() {
          console.log("arduino reset.");
          serialPort.write('hello');
          console.log(serialPort.isOpen())
        }, 50);
      });
    }, 250);
  });
});
