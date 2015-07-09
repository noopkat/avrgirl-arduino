module.exports = {
  'uno': {
    baud: 115200,
    signature: new Buffer([0x1e, 0x95, 0x0f]),
    pageSize: 128,
    numPages: 256,
    timeout: 400,
    productId: ['0x0043'],
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
    productId: ['0x0036', '0x8036'],
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
  }
};
