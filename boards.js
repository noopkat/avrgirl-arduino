var boards = [
  {
    name: 'uno',
    baud: 115200,
    signature: Buffer.from([0x1e, 0x95, 0x0f]),
    pageSize: 128,
    numPages: 256,
    timeout: 400,
    productId: ['0x0043', '0x7523', '0x0001', '0xea60', '0x6015'],
    productPage: 'https://store.arduino.cc/arduino-uno-rev3',
    protocol: 'stk500v1'
  },
  {
    name: 'micro',
    baud: 57600,
    signature: Buffer.from([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    productId: ['0x0037', '0x8037', '0x0036', '0x0237'],
    productPage: 'https://store.arduino.cc/arduino-micro',
    protocol: 'avr109'
  },
  {
    name: 'imuduino',
    baud: 57600,
    signature: Buffer.from([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    productId: ['0x0036', '0x8037', '0x8036'],
    productPage: 'https://www.kickstarter.com/projects/1265095814/imuduino-wireless-3d-motion-html-js-apps-arduino-p?lang=de',
    protocol: 'avr109'
  },
  {
    name: 'leonardo',
    baud: 57600,
    signature: Buffer.from([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    productId: ['0x0036', '0x8036', '0x800c'],
    productPage: 'https://store.arduino.cc/leonardo',
    protocol: 'avr109'
  },
  {
    name: 'arduboy',
    baud: 57600,
    signature: Buffer.from([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    productId: ['0x0036', '0x8036', '0x800c'],
    productPage: 'https://arduboy.com/',
    protocol: 'avr109'
  },
  {
    name: 'feather',
    baud: 57600,
    signature: Buffer.from([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    productId: ['0x800c', '0x000c'],
    productPage: 'https://www.adafruit.com/feather',
    protocol: 'avr109'
  },
  {
    name: 'little-bits',
    baud: 57600,
    signature: Buffer.from([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    productId: ['0x0036', '0x8036'],
    productPage: 'https://littlebits.com/collections/bits-and-accessories/products/arduino-bit',
    protocol: 'avr109'
  },
  {
    name: 'blend-micro',
    baud: 57600,
    signature: Buffer.from([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    productId: ['0x2404'],
    productPage: 'https://redbear.cc/product/retired/blend-micro.html',
    protocol: 'avr109'
  },
  {
    name: 'nano',
    baud: 57600,
    signature: Buffer.from([0x1e, 0x95, 0x0f]),
    pageSize: 128,
    numPages: 256,
    timeout: 400,
    productId: ['0x6001', '0x7523'],
    productPage: 'https://web.archive.org/web/20150813095112/https://www.arduino.cc/en/Main/ArduinoBoardNano',
    protocol: 'stk500v1'
  },
  {
    name: 'nano (new bootloader)',
    baud: 115200,
    signature: Buffer.from([0x1e, 0x95, 0x0f]),
    pageSize: 128,
    numPages: 256,
    timeout: 400,
    productId: ['0x6001', '0x7523'],
    productPage: 'https://store.arduino.cc/arduino-nano',
    protocol: 'stk500v1'
  },
  {
    name: 'duemilanove168',
    baud: 19200,
    signature: Buffer.from([0x1e, 0x94, 0x06]),
    pageSize: 128,
    numPages: 128,
    timeout: 400,
    productId: ['0x6001'],
    productPage: 'https://www.arduino.cc/en/Main/arduinoBoardDuemilanove',
    protocol: 'stk500v1'
  },
  {
    name: 'duemilanove328',
    baud: 57600,
    signature: Buffer.from([0x1e, 0x95, 0x14]),
    pageSize: 128,
    numPages: 256,
    timeout: 400,
    productId: ['0x6001'],
    productPage: 'https://www.arduino.cc/en/Main/arduinoBoardDuemilanove',
    protocol: 'stk500v1'
  },
  // the alias is here because of an accidental naming change of the tinyduino
  // keeping in for backwards compatibility (SHA 05d65842)
  {
    name: 'tinyduino',
    baud: 57600,
    signature: Buffer.from([0x1e, 0x95, 0x0f]),
    pageSize: 128,
    numPages: 256,
    timeout: 400,
    productId: ['0x6015'],
    productPage: 'https://tinycircuits.com/pages/tinyduino-overview',
    protocol: 'stk500v1',
    aliases: ['tinduino']
  },
  {
    name: 'mega',
    baud: 115200,
    signature: Buffer.from([0x1e, 0x98, 0x01]), // ATmega2560
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
    productPage: 'https://store.arduino.cc/mega-2560-r3',
    protocol: 'stk500v2'
  },
  {
    name: 'adk',
    baud: 115200,
    signature: Buffer.from([0x1e, 0x98, 0x01]), // ATmega2560
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
    productPage: 'https://store.arduino.cc/arduino-mega-adk-rev3',
    protocol: 'stk500v2'
  },
  {
    name: 'sf-pro-micro',
    baud: 57600,
    signature: Buffer.from([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    productId: ['0x9206', '0x9205', '0x0036'],
    productPage: 'https://www.sparkfun.com/products/12640',
    protocol: 'avr109'
  },
  {
    name: 'pro-mini',
    baud: 57600,
    signature: Buffer.from([0x1e, 0x95, 0x0f]),
    pageSize: 128,
    numPages: 256,
    timeout: 400,
    productPage: 'https://store.arduino.cc/arduino-pro-mini',
    protocol: 'stk500v1'
  },
  {
    name: 'qduino',
    baud: 57600,
    signature: Buffer.from([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    productId: ['0x516d', '0x514d'],
    productPage: 'https://www.sparkfun.com/products/13614',
    protocol: 'avr109'
  },
  {
    name: 'pinoccio',
    baud: 115200,
    signature: Buffer.from([0x1e, 0xa8, 0x02]), // ATmega256RFR2
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
    productPage: 'https://www.mouser.de/new/crowd-supply/crowd-supply-pinoccio-microcontroller/',
    protocol: 'stk500v2'
  },
  {
    name: 'lilypad-usb',
    baud: 57600,
    signature: Buffer.from([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    productId: ['0x9207', '0x9208', '0x1B4F'],
    productPage: 'https://www.sparkfun.com/products/12049',
    protocol: 'avr109'
  },
  {
    name: 'yun',
    baud: 57600,
    signature: Buffer.from([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    productId: ['0x0041', '0x8041'],
    productPage: 'https://store.arduino.cc/arduino-yun',
    protocol: 'avr109'
  },
  {
    name: 'esplora',
    baud: 57600,
    signature: Buffer.from([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    productId: ['0x003C', '0x803C'],
    productPage: 'https://store.arduino.cc/arduino-esplora',
    protocol: 'avr109'
  },
  {
    name: 'circuit-playground-classic',
    baud: 57600,
    signature: Buffer.from([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    productId: ['0x0011', '0x8011'],
    productPage: 'https://www.adafruit.com/product/3000',
    protocol: 'avr109'
  },
  /** BQ - Arduino Based Boards. Used in Bitbloq -> bitbloq.bq.com and Arduino IDE*/
  {
    name: 'zumjunior',
    baud: 115200,
    signature: Buffer.from([0x1e, 0x95, 0x0f]),
    pageSize: 128,
    numPages: 256,
    timeout: 400,
    productId: ['0xEA60'],
    productPage: 'https://store-de.bq.com/de/zum-kit-junior',
    protocol: 'stk500v1'
  },
  {
    name: 'zumcore2',
    baud: 115200,
    signature: Buffer.from([0x1e, 0x95, 0x0f]),
    pageSize: 128,
    numPages: 256,
    timeout: 400,
    productId: ['0xEA60'],
    productPage: 'https://www.bq.com/de/zum-core-2-0',
    protocol: 'stk500v1'
  },
  {
    name: 'bqZum',
    baud: 19200,
    signature: Buffer.from([0x1e, 0x95, 0x0f]),
    pageSize: 128,
    numPages: 256,
    timeout: 400,
    productId: ['0x6001', '0x7523'],
    productPage: 'http://diwo.bq.com/zum-bt-328-especificaciones-tecnicas/',
    protocol: 'stk500v1'
  },
  /** END OF BQ - Arduino Based Boards. Used in Bitbloq -> bitbloq.bq.com and Arduino IDE*/

  /** START OF Spark Concepts Boards - Arduino Based CNC Controller but uses Atmega328pb (Note 'pb' not 'p' = different signature) https://github.com/Spark-Concepts/xPro-V4 */
  {
    name: 'xprov4',
    baud: 115200,
    signature: Buffer.from([0x1e, 0x95, 0x16]),
    pageSize: 128,
    numPages: 256,
    timeout: 400,
    productId: ['0x0043', '0x7523', '0x0001', '0xea60'],
    productPage: 'http://www.spark-concepts.com/cnc-xpro-v4-controller/',
    protocol: 'stk500v1'
  },
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
