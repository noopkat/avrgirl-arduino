var test = require('tape');
var proxyquire = require('proxyquire');
var mockSerial = require('./helpers/mockSerial');
var sinon = require('sinon');

// module to test
var ConnectionTest = proxyquire.noCallThru()
                      .load('../lib/connection', { SerialPort: mockSerial.SerialPort });

// default options
var DEF_OPTS1 = {
  debug: false,
  board: {
    baud: 115200,
    signature: new Buffer([0x1e, 0x95, 0x0f]),
    pageSize: 128,
    numPages: 256,
    timeout: 400,
    productId: ['0x0043', '0x7523', '0x0001', '0xea60'],
    protocol: 'stk500v1'
  },
  port: ''
};

test('[ Connection ]  - new creation', function(t) {
  t.plan(2);
  var c = new ConnectionTest(DEF_OPTS1);
  t.ok(c.board, 'board exists');
  t.equal(c.board.protocol, 'stk500v1', 'random board property is as expected');
});

test('[ Connection ] ::_listPorts failure', function(t) {
  t.plan(2);
  var ConnectionTest = proxyquire.noCallThru().load('../lib/connection', { serialport: {
      list: function(callback) {
        callback(new Error('Fake Error'));
      },
      SerialPort: mockSerial.SerialPort
    } });

  // nodejs 0.10.x race condition needs this
  setTimeout(function() {
    var c = new ConnectionTest(DEF_OPTS1);
    c._listPorts(function(error, ports) {
      t.notOk(ports);
      t.ok(error);
    });
  }, 200);
});

test('[ Connection ] ::_listPorts (UNIX)', function(t) {
  t.plan(3);
  var ConnectionTest = proxyquire.noCallThru().load('../lib/connection', { serialport: {
      list: function(callback) {
        callback(null, [
          { comName: '/dev/cu.sierravsp', manufacturer: '', serialNumber: '',
            pnpId: '', locationId: '', vendorId: '', productId: '' },
          { comName: '/dev/cu.Bluetooth-Incoming-Port', manufacturer: '',
            serialNumber: '', pnpId: '', locationId: '', vendorId: '',
            productId: '' },
          { comName: '/dev/cu.usbmodem1421', manufacturer: 'Arduino (www.arduino.cc)',
            serialNumber: '55432333038351F03170', pnpId: '', locationId: '0x14200000',
            vendorId: '0x2341', productId: '0x0043' }
        ]);
      },

      SerialPort: mockSerial.SerialPort
    } });

  // nodejs 0.10.x race condition needs this
  setTimeout(function() {
    var c = new ConnectionTest(DEF_OPTS1);
    c._listPorts(function(error, ports) {
      t.ok(ports.length, 'got a list of ports');
      t.ok(ports[2]._standardPid, 'added _standardPid property');
      t.error(error, 'no error on listing');
    });
  }, 200);
});

test('[ Connection ] ::_listPorts (WINDOWS)', function(t) {
  t.plan(3);
  var ConnectionTest = proxyquire.noCallThru().load('../lib/connection', { serialport: {
      list: function(callback) {
        callback(null, [
          { comName: 'COM3', manufacturer: 'Microsoft', serialNumber: '',
            pnpId: 'USB\\\\VID_2341&PID_0043\\\\55432333038351F03170',
            locationId: '', vendorId: '', productId: '' }
        ]);
      },

      SerialPort: mockSerial.SerialPort
    } });

  // nodejs 0.10.x race condition needs this
  setTimeout(function() {
    var c = new ConnectionTest(DEF_OPTS1);
    c._listPorts(function(error, ports) {
      t.ok(ports.length, 'got a list of ports');
      t.ok(ports[0]._standardPid, 'added _standardPid property');
      t.error(error, 'no error on listing');
    });
  }, 200);
});

test('[ Connection ] ::_sniffPort (UNIX)', function(t) {
  t.plan(3);
  var ConnectionTest = proxyquire.noCallThru().load('../lib/connection', { serialport: {
      list: function(callback) {
        callback(null, [
          { comName: '/dev/cu.sierravsp', manufacturer: '', serialNumber: '',
            pnpId: '', locationId: '', vendorId: '', productId: '' },
          { comName: '/dev/cu.Bluetooth-Incoming-Port', manufacturer: '',
            serialNumber: '', pnpId: '', locationId: '', vendorId: '',
            productId: '' },
          { comName: '/dev/cu.usbmodem1421', manufacturer: 'Arduino (www.arduino.cc)',
            serialNumber: '55432333038351F03170', pnpId: '', locationId: '0x14200000',
            vendorId: '0x2341', productId: '0x0043' }
        ]);
      },

      SerialPort: mockSerial.SerialPort
    } });

  // nodejs 0.10.x race condition needs this
  setTimeout(function() {
    var c = new ConnectionTest(DEF_OPTS1);
    c._sniffPort(function(error, match) {
      t.ok(match.length, 'board was detected');
      t.equal(match[0].comName, '/dev/cu.usbmodem1421', 'correct comName to match against');
      t.error(error, 'no error on return');
    });
  }, 200);
});

test('[ Connection ] ::_sniffPort (WINDOWS)', function(t) {
  t.plan(3);
  var ConnectionTest = proxyquire.noCallThru().load('../lib/connection', { serialport: {
    list: function(callback) {
      callback(null, [
        { comName: 'COM3', manufacturer: 'Microsoft', serialNumber: '',
          pnpId: 'USB\\\\VID_2341&PID_0043\\\\55432333038351F03170',
          locationId: '', vendorId: '', productId: '' }
      ]);
    },

    SerialPort: mockSerial.SerialPort
  } });

  // nodejs 0.10.x race condition needs this
  setTimeout(function() {
    var c = new ConnectionTest(DEF_OPTS1);
    c._sniffPort(function(error, match) {
      t.ok(match.length, 'board was detected');
      t.equal(match[0].comName, 'COM3', 'correct comName to match against');
      t.error(error, 'no error on return');
    });
  }, 200);
});

test('[ Connection ] ::_cycleDTR', function(t) {
  t.plan(2);
  var options = {
    debug: false,
    board: 'uno',
    port: '/dev/cu.usbmodem1421'
  };
  var c = new ConnectionTest(options);
  var stub = sinon.stub(c, '_setDTR', function(bool, timeout, callback) {
    return callback(null);
  });

  c._cycleDTR(function(error) {
    t.ok(stub.calledTwice, '_setDTR was called twice');
    t.error(error, 'no error');
  });
});

test('[ Connection ] ::_pollForPort', function(t) {
  t.plan(1);
  var mockedSerial = mockSerial.SerialPort;
  mockedSerial.list = function(callback) {
      callback(null, [
        { comName: '/dev/cu.sierravsp', manufacturer: '', serialNumber: '',
          pnpId: '', locationId: '', vendorId: '', productId: '' },
        { comName: '/dev/cu.Bluetooth-Incoming-Port', manufacturer: '',
          serialNumber: '', pnpId: '', locationId: '', vendorId: '',
          productId: '' },
        { comName: '/dev/cu.usbmodem1421', manufacturer: 'Arduino (www.arduino.cc)',
          serialNumber: '55432333038351F03170', pnpId: '', locationId: '0x14200000',
          vendorId: '0x2341', productId: '0x0043' }
      ]);
    };

  var ConnectionTest = proxyquire.noCallThru()
                        .load('../lib/connection', { serialport: mockSerial.SerialPort });

  var options = {
    debug: false,
    board: {
      baud: 115200,
      signature: new Buffer([0x1e, 0x95, 0x0f]),
      pageSize: 128,
      numPages: 256,
      timeout: 400,
      productId: ['0x0043', '0x7523', '0x0001', '0xea60'],
      protocol: 'stk500v1'
    },
    port: '/dev/cu.usbmodem1421'
  };

  // nodejs 0.10.x race condition needs this
  setTimeout(function() {
    var c = new ConnectionTest(options);
    c._pollForPort(function(error) {
      t.error(error, 'no error on polling result');
    });
  }, 200);

});
