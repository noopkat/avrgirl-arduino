// convenience file for listing ports in console, not required for or used by avrgirl-arduino
var Serialport = require('serialport');

Serialport.list(function (err, ports) {
  console.log(ports);
});

/*
[ { comName: '/dev/cu.Bluetooth-Incoming-Port',
    manufacturer: '',
    serialNumber: '',
    pnpId: '',
    locationId: '',
    vendorId: '',
    productId: '' },
  { comName: '/dev/cu.Bluetooth-Modem',
    manufacturer: '',
    serialNumber: '',
    pnpId: '',
    locationId: '',
    vendorId: '',
    productId: '' },
  { comName: '/dev/cu.PawelsJAMBOX-SPPDev',
    manufacturer: '',
    serialNumber: '',
    pnpId: '',
    locationId: '',
    vendorId: '',
    productId: '' },
  { comName: '/dev/cu.sierravsp',
    manufacturer: '',
    serialNumber: '',
    pnpId: '',
    locationId: '',
    vendorId: '',
    productId: '' },
  { comName: '/dev/cu.usbmodem1422',
    manufacturer: 'MBED',
    serialNumber: '1095020354D54E766BB3CFDE',
    pnpId: '',
    locationId: '0x14200000',
    vendorId: '0x0d28',
    productId: '0x0204' } ]

*/
