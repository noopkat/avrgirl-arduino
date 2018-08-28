var boards = [
  {
    name: 'uno',
    baud: 115200,
    signature: new Buffer([0x1e, 0x95, 0x0f]),
    pageSize: 128,
    numPages: 256,
    timeout: 400,
    productId: ['0x0043', '0x7523', '0x0001', '0xea60'],
    protocol: 'stk500v1'
  },
  {
    name: 'micro',
    baud: 57600,
    signature: new Buffer([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    productId: ['0x0037', '0x8037', '0x0036', '0x0237'],
    protocol: 'avr109'
  },
  {
    name: 'imuduino',
    baud: 57600,
    signature: new Buffer([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    productId: ['0x0036', '0x8037', '0x8036'],
    protocol: 'avr109'
  },
  {
    name: 'leonardo',
    baud: 57600,
    signature: new Buffer([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    productId: ['0x0036', '0x8036', '0x800c'],
    protocol: 'avr109'
  },
  {
    name: 'arduboy',
    baud: 57600,
    signature: new Buffer([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    productId: ['0x0036', '0x8036', '0x800c'],
    protocol: 'avr109'
  },
  {
    name: 'feather',
    baud: 57600,
    signature: new Buffer([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    productId: ['0x800c', '0x000c'],
    protocol: 'avr109'
  },
  {
    name: 'little-bits',
    baud: 57600,
    signature: new Buffer([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    productId: ['0x0036', '0x8036'],
    protocol: 'avr109'
  },
  {
    name: 'blend-micro',
    baud: 57600,
    signature: new Buffer([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    productId: ['0x2404'],
    protocol: 'avr109'
  },
  {
    name: 'nano',
    baud: 57600,
    signature: new Buffer([0x1e, 0x95, 0x0f]),
    pageSize: 128,
    numPages: 256,
    timeout: 400,
    productId: ['0x6001', '0x7523'],
    protocol: 'stk500v1'
  },
  {
    name: 'duemilanove168',
    baud: 19200,
    signature: new Buffer([0x1e, 0x94, 0x06]),
    pageSize: 128,
    numPages: 128,
    timeout: 400,
    productId: ['0x6001'],
    protocol: 'stk500v1'
  },
  {
    name: 'duemilanove328',
    baud: 57600,
    signature: new Buffer([0x1e, 0x95, 0x14]),
    pageSize: 128,
    numPages: 256,
    timeout: 400,
    productId: ['0x6001'],
    protocol: 'stk500v1'
  },
  // the alias is here because of an accidental naming change of the tinyduino
  // keeping in for backwards compatibility (SHA 05d65842)
  {
    name: 'tinyduino',
    baud: 57600,
    signature: new Buffer([0x1e, 0x95, 0x0f]),
    pageSize: 128,
    numPages: 256,
    timeout: 400,
    productId: ['0x6015'],
    protocol: 'stk500v1',
    aliases: ['tinduino']
  },
  {
    name: 'mega',
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
    productId: ['0x0042', '0x6001', '0x0010', '0x7523'],
    protocol: 'stk500v2'
  },
  {
    name: 'adk',
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
    productId: ['0x0044', '0x6001', '0x003F'],
    protocol: 'stk500v2'
  },
  {
    name: 'sf-pro-micro',
    baud: 57600,
    signature: new Buffer([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    productId: ['0x9206', '0x9205'],
    protocol: 'avr109'
  },
  {
    name: 'pro-mini',
    baud: 57600,
    signature: new Buffer([0x1e, 0x95, 0x0f]),
    pageSize: 128,
    numPages: 256,
    timeout: 400,
    protocol: 'stk500v1'
  },
  {
    name: 'qduino',
    baud: 57600,
    signature: new Buffer([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    productId: ['0x516d', '0x514d'],
    protocol: 'avr109'
  },
  {
    name: 'pinoccio',
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
  },
  {
    name: 'lilypad-usb',
    baud: 57600,
    signature: new Buffer([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    productId: ['0x9207', '0x9208', '0x1B4F'],
    protocol: 'avr109'
  },
  {
    name: 'yun',
    baud: 57600,
    signature: new Buffer([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    productId: ['0x0041', '0x8041'],
    protocol: 'avr109'
  },
  {
    name: 'esplora',
    baud: 57600,
    signature: new Buffer([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    productId: ['0x003C', '0x803C'],
    protocol: 'avr109'
  }, 
  {
    name: 'circuit-playground-classic',
    baud: 57600,
    signature: new Buffer([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    productId: ['0x0011', '0x8011'],
    protocol: 'avr109'
  },
  /** BQ - Arduino Based Boards. Used in Bitbloq -> bitbloq.bq.com and Arduino IDE*/
  {
    name: 'zumjunior',
    baud: 115200,
    signature: new Buffer([0x1e, 0x95, 0x0f]),
    pageSize: 128,
    numPages: 256,
    timeout: 400,
    productId: ['0xEA60'],
    protocol: 'stk500v1'
  },
  {
    name: 'zumcore2',
    baud: 115200,
    signature: new Buffer([0x1e, 0x95, 0x0f]),
    pageSize: 128,
    numPages: 256,
    timeout: 400,
    productId: ['0xEA60'],
    protocol: 'stk500v1'
  },
  {
    name: 'bqZum',
    baud: 19200,
    signature: new Buffer([0x1e, 0x95, 0x0f]),
    pageSize: 128,
    numPages: 256,
    timeout: 400,
    productId: ['0x6001', '0x7523'],
    protocol: 'stk500v1'
  }
  /** END OF BQ - Arduino Based Boards. Used in Bitbloq -> bitbloq.bq.com and Arduino IDE*/
];

/**
 * Generate an object with board name keys for faster lookup
 * @return {object} byBoardName
 */
function boardLookupTable() {
  var byBoard = {};
  for (var i = 0; i < boards.length; i++) {
    var currentBoard = boards[i];
    byBoard[currentBoard.name] = currentBoard;

    var aliases = currentBoard.aliases;
    if (Array.isArray(aliases)) {
      for (var j = 0; j < aliases.length; j++) {
        var currentAlias = aliases[j];
        byBoard[currentAlias] = currentBoard;
      }
    }
  }
  return byBoard;
}

module.exports = boardLookupTable();
