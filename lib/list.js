// convenience file for listing ports in console, not required for or used by avrgirl-arduino
var Serialport = require('serialport');

Serialport.list(function (err, ports) {
  console.log(ports);    
});
