var test = require('tape');
var Protocol = require('../lib/protocol.js');
var STK = require('stk500');

// default options
var DEF_OPTS3 = {
  protocol: STK,
  board: {
    baud: 115200,
    signature: Buffer.from([0x1e, 0x95, 0x0f]),
    pageSize: 128,
    numPages: 256,
    timeout: 400,
    productId: ['0x0043', '0x7523'],
    protocol: 'stk500v1'
  },
  connection: {},
  debug: function() {}
};

test('[ Protocol ]  - new creation', function(t) {
  t.plan(4);
  var p = new Protocol(DEF_OPTS3);
  t.ok(p.board, 'established board');
  t.ok(p.connection, 'established connection');
  t.ok(p.chip, 'established chip');
  t.equal(typeof p._reset, 'function', 'has _reset function');
});
