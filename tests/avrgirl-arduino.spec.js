var test = require('tape-async');
var proxyquire = require('proxyquire');
var sinon = require('sinon');

// proxyquired connection module
var Connection = proxyquire.noCallThru().load('../lib/connection',
  { serialport: {
    list: function() { return Promise.resolve(
      [
        { comName: '/dev/cu.sierravsp', manufacturer: '', serialNumber: '',
          pnpId: '', locationId: '', vendorId: '', productId: '' },
        { comName: '/dev/cu.Bluetooth-Incoming-Port', manufacturer: '',
          serialNumber: '', pnpId: '', locationId: '', vendorId: '',
          productId: '' },
        { comName: '/dev/cu.usbmodem1421', manufacturer: 'Arduino (www.arduino.cc)',
          serialNumber: '55432333038351F03170', pnpId: '', locationId: '0x14200000',
          vendorId: '0x2341', productId: '0x0043' }
      ])
    }
  },

  SerialPort: require('./helpers/mockSerial').SerialPort
  });

// module to test
var Avrgirl = proxyquire('../', { Connection: Connection });

// default options
var DEF_OPTS2 = {
  board: 'uno'
};

test('[ AVRGIRL-ARDUINO ] method presence', function(t) {
  var a = new Avrgirl(DEF_OPTS2);
  function isFn(name) {
    return typeof a[name] === 'function';
  }

  var methods = ['flash', '_validateBoard', 'listPorts'];
  for (var i = 0; i < methods.length; i += 1) {
    t.ok(isFn(methods[i]), methods[i]);
    if (i === methods.length - 1) {
      t.end();
    }
  }
});

test('[ AVRGIRL-ARDUINO ] new creation', function(t) {
  t.plan(3);

  var a = new Avrgirl(DEF_OPTS2);
  t.ok(a.connection, 'connection was established');
  t.ok(a.options.board.baud, 'board was established');
  t.ok(a.protocol.chip, 'protocol was established');
});

test('[ AVRGIRL-ARDUINO ] ::_validateBoard (GOOD)', function(t) {
  t.plan(1);

  var a = new Avrgirl(DEF_OPTS2);
  t.doesNotThrow(a._validateBoard.bind(a), 'does not throw');
});

test('[ AVRGIRL-ARDUINO ] ::_validateBoard (SPARSE)', function(t) {
  t.plan(1);

  var a = new Avrgirl({ board: { name: DEF_OPTS2.board } });
  a._validateBoard();
  t.doesNotThrow(a._validateBoard.bind(a), 'does not throw');
});

test('[ AVRGIRL-ARDUINO ] ::_validateBoard (SPARSE NO NAME)', function(t) {
  t.plan(1);

  var a = new Avrgirl({ board: { notName: DEF_OPTS2.board } });
  t.throws(a._validateBoard.bind(a), 'error returned');
});

test('[ AVRGIRL-ARDUINO ] ::_validateBoard (NO BOARD)', function(t) {
  t.plan(1);

  var a = new Avrgirl({ board: 'bacon' });
  t.throws(a._validateBoard.bind(a), 'error returned');
});

test('[ AVRGIRL-ARDUINO ] ::_validateBoard (NO PROTOCOL)', function(t) {
  t.plan(1);

  var a = new Avrgirl(DEF_OPTS2);
  a.protocol = 'bacon';
  t.throws(a._validateBoard.bind(a), 'error returned');
});

test('[ AVRGIRL-ARDUINO ] ::_validateBoard (NO PORT & PRO-MINI)', function(t) {
  t.plan(1);

  var a = new Avrgirl({ board: 'pro-mini' });
  t.throws(a._validateBoard.bind(a), 'error returned');
});

test('[ AVRGIRL-ARDUINO ] ::listPorts', async (t) => {
  t.plan(2);

  var ports = await Avrgirl.listPorts();
  t.ok(ports.length, 'got a list of ports');
  t.ok(ports[2]._standardPid, 'added _standardPid property');
});

test('[ AVRGIRL-ARDUINO ] ::listPorts (prototype)', async (t) => {
  t.plan(2);

  var a = new Avrgirl(DEF_OPTS2);
  var ports = await a.listPorts();
  t.ok(ports.length, 'got a list of ports');
  t.ok(ports[2]._standardPid, 'added _standardPid property');
});

test('[ AVRGIRL-ARDUINO ] ::flash (shallow)', async (t) => {
  t.plan(3);

  var a = new Avrgirl(DEF_OPTS2);
  var spyInit = sinon.stub(a.connection, '_init').callsFake(function() {
    return Promise.resolve();
  });

  var spyUpload = sinon.stub(a.protocol, '_upload').callsFake(function() {
    return Promise.resolve();
  });

  var spyValidate = sinon.spy(a, '_validateBoard');

  await a.flash(__dirname + '/../junk/hex/uno/Blink.cpp.hex');
  t.ok(spyValidate.calledOnce, 'validated board');
  t.ok(spyInit.calledOnce, 'connection init');
  t.ok(spyUpload.calledOnce, 'upload to board attempt');
});
