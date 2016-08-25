var boards = {
  'uno': {
    baud: 115200,
    signature: new Buffer([0x1e, 0x95, 0x0f]),
    pageSize: 128,
    numPages: 256,
    timeout: 400,
    productId: ['0x0043', '0x7523', '0x0001', '0xea60'],
    protocol: 'stk500v1'
  },
  'micro': {
    baud: 57600,
    signature: new Buffer([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    productId: ['0x0037', '0x8037'],
    protocol: 'avr109'
  },
  'imuduino': {
    baud: 57600,
    signature: new Buffer([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    productId: ['0x0036', '0x8037', '0x8036'],
    protocol: 'avr109'
  },
  'leonardo': {
    baud: 57600,
    signature: new Buffer([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    productId: ['0x0036', '0x8036', '0x800c'],
    protocol: 'avr109'
  },
  'arduboy': {
    baud: 57600,
    signature: new Buffer([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    productId: ['0x0036', '0x8036', '0x800c'],
    protocol: 'avr109'
  },
  'feather': {
    baud: 57600,
    signature: new Buffer([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    productId: ['0x800c'],
    protocol: 'avr109'
  },
  'little-bits': {
    baud: 57600,
    signature: new Buffer([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    productId: ['0x0036', '0x8036'],
    protocol: 'avr109'
  },
  'blend-micro': {
    baud: 57600,
    signature: new Buffer([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    productId: ['0x2404'],
    protocol: 'avr109'
  },
  'nano': {
    baud: 57600,
    signature: new Buffer([0x1e, 0x95, 0x0f]),
    pageSize: 128,
    numPages: 256,
    timeout: 400,
    productId: ['0x6001', '0x7523'],
    protocol: 'stk500v1'
  },
  'duemilanove168': {
    baud: 19200,
    signature: new Buffer([0x1e, 0x94, 0x06]),
    pageSize: 128,
    numPages: 128,
    timeout: 400,
    productId: ['0x6001'],
    protocol: 'stk500v1'
  },
  'tinyduino': {
    baud: 57600,
    signature: new Buffer([0x1e, 0x95, 0x0f]),
    pageSize: 128,
    numPages: 256,
    timeout: 400,
    productId: ['0x6015'],
    protocol: 'stk500v1'
  },
  'bqZum': {
    baud: 19200,
    signature: new Buffer([0x1e, 0x95, 0x0f]),
    pageSize: 128,
    numPages: 256,
    timeout: 400,
    productId: ['0x6001', '0x7523'],
    protocol: 'stk500v1'
  },
  'mega': {
    baud: 115200,
    signature: new Buffer([0x1e, 0x98, 0x01]), // ATmega2560
    pageSize: 256,
    delay1: 10,
    delay2: 1,
    timeout:0xc8,
    stabDelay:0x64,
    cmdexeDelay:0x19,
    synchLoops:0x20,
    byteDelay:0x00,
    pollValue:0x53,
    pollIndex:0x03,
    productId: ['0x0042', '0x6001'],
    protocol: 'stk500v2'
  },
  'sf-pro-micro': {
    baud: 57600,
    signature: new Buffer([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    productId: ['0x9206'],
    protocol: 'avr109'
  },
  'pro-mini': {
    baud: 57600,
    signature: new Buffer([0x1e, 0x95, 0x0f]),
    pageSize: 128,
    numPages: 256,
    timeout: 400,
    protocol: 'stk500v1'
  },
  'qduino': {
    baud: 57600,
    signature: new Buffer([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    productId: ['0x516d'],
    protocol: 'avr109'
  },
  'pinoccio': {
    baud: 115200,
    signature: new Buffer([0x1e, 0xa8, 0x02]), // ATmega256RFR2
    pageSize: 256,
    delay1: 10,
    delay2: 1,
    timeout:0xc8,
    stabDelay:0x64,
    cmdexeDelay:0x19,
    synchLoops:0x20,
    byteDelay:0x00,
    pollValue:0x53,
    pollIndex:0x03,
    productId: ['0x6051'],
    protocol: 'stk500v2'
  }
};

/**
 * Generate a reverse lookup table by pid mapped to possible board names.
 * @return {object} byPid
 */
function pidLookupTable() {
  var byPid = {};
  var boardNames = Object.keys( boards );
  for (var i=0;i<boardNames.length;i++) {
    var boardName = boardNames[i];
    var board = boards[ boardName ];
    if (board.productId) {
      for (var j=0;j<board.productId.length;j++) {
        var productId = board.productId[j];
        byPid[ productId ] = byPid[ productId ] || [];
        byPid[ productId ].push( boardName );
      }
    }
  }
  return byPid;
}

module.exports = {
  byName: boards,
  byPid: pidLookupTable()
}
