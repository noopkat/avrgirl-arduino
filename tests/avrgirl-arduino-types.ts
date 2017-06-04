import * as Avrgirl from '../avrgirl-arduino'

const noop = () => {};
const listNoop = (error: any, ports: object[]) => {};

const board = {
    name: 'coolness',
    manualReset: false,
    signature: new Buffer('my sig'),
    productId: ['one', 'two', 'three'],
    pageSize: 128,
    pages: 256,
    baud: 9600,
    protocol: 'stk500v1',
    timeout: 400
};

// only board prop is required
let avrgirl = new Avrgirl({
    board: 'uno'
});

// supply all as correct types
avrgirl = new Avrgirl({
    board: 'uno',
    port: 'COM3',
    manualReset: true,
    debug: true
});


// supply alt correct types
avrgirl = new Avrgirl({
    board: board,
    port: 'COM3',
    manualReset: true,
    debug: noop
});

// call with filename string
avrgirl.flash('filename.hex', noop);
avrgirl.flash('filename.hex');

// call with file buffer
avrgirl.flash(new Buffer('hey'), noop);
avrgirl.flash(new Buffer('hey'));

// static
Avrgirl.list(noop);
Avrgirl.listPorts(listNoop);

// instance
avrgirl.list(noop);
avrgirl.listPorts(listNoop);
