var Serialport = require('serialport');
var c = require('./c');

var CMD_SIGN_ON = 0x01;
var CMD_LOAD_ADDRESS = 0x06;
var CMD_ENTER_PROGMODE_ISP = 0x10;
var CMD_LEAVE_PROGMODE_ISP = 0x11;
var CMD_PROGRAM_FLASH_ISP = 0x13;
var CMD_SPI_MULTI = 0x1D;

var _options = {
  timeout:0xc8,
  stabDelay:0x64,
  cmdexeDelay:0x19,
  synchLoops:0x20,
  byteDelay:0x00,
  pollValue:0x53,
  pollIndex:0x03
};

var messageLen = new Buffer([0,0]);
messageLen.writeUInt16BE(1,0);
console.log('messageLen:', messageLen);

var body = new Buffer([CMD_SIGN_ON]);
//var wholeMessage = [c.MESSAGE_START, 0x00, 0x80, 0x01, 0x0E, CMD_SIGN_ON];
var wholeMessage = [0x1B, 0x00, messageLen[0], messageLen[1], 0x0E, CMD_SIGN_ON];

var checksum = 0;
for (var i = 0; i < wholeMessage.length; i += 1) {
  checksum ^= wholeMessage[i];
}
wholeMessage.push(checksum);
console.log(wholeMessage, checksum);

// var serialPort = new Serialport.SerialPort('/dev/cu.usbserial-AL00R4OW', {
var serialPort = new Serialport.SerialPort('/dev/cu.usbserial1411', {
    baudRate: 57600,
    parser: Serialport.parsers.raw
  }, false);

serialPort.on('data', function(data) {
  console.log('DATA RECEIVED:', data);
});

serialPort.open(function() {
  setTimeout(function() {
    serialPort.set({rts:false, dtr:false}, function(result){
      console.log("reset start");
    });
  }, 4000);
  setTimeout(function() {
    serialPort.set({rts:true, dtr:true}, function(result){
      console.log("reset done");
      reconnectandwrite();
    });
  }, 4070);
});


function reconnectandwrite() {
  serialPort.open(function() {
    var out = new Buffer(wholeMessage);
    console.log(out);
    serialPort.write(out, function(err, result) {
      console.log('err: ', err, 'result: ', result);
    })
  });
 
}






