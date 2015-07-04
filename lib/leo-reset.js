var Serialport = require('serialport');
var port = process.argv[2];

console.log(port);

var serialPort = new Serialport.SerialPort(port, {
    baudRate: 1200,
});

serialPort.on('open', function() {
  serialPort.close();
});
