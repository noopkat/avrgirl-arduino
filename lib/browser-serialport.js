// TODO: switch out this browser shim for mitt: https://github.com/developit/mitt
const { EventEmitter } = require('events');

class SerialPort extends EventEmitter {
  constructor(port, options) {
    super(options);
    this.options = options || {};

    this.browser = true;
    this.path = this.options.path;
    this.isOpen = false;
    this.port = null;
    this.writer = null;
    this.reader = null;
    this.baudRate = this.options.baudRate;
    this.requestOptions = this.options.requestOptions || {};

    if (this.options.autoOpen) this.open();
  }

  list(callback) {
    return navigator.serial.getPorts()
      .then((list) => {if (callback) {return callback(null, list)}})
      .catch((error) => {if (callback) {return callback(error)}}); 
  }

  async open(callback) {
    try {
      const serialPort = await window.navigator.serial.requestPort(this.requestOptions);
      // TODO: check for the same port choice match first before resolving
      if (this.isOpen) return Promise.resolve();
      this.port = serialPort;
      await this.port.open({ baudRate: this.baudRate || 57600 });
      this.writer = this.port.writable.getWriter();
      this.reader = this.port.readable.getReader();
      // potentially omit this
      this.emit('open');
      this.isOpen = true;
      // this needs to keep running in its own thread past promise fulfillment 
      // we do not need or want to await it
      this.readPoll();
      return callback(null);
    } catch (e) {
      return callback(e);
    }
  }

  async readPoll() {
    while (this.port.readable) {
      const { value, done } = await this.reader.read();
      if (done) {
        break;
      }
      this.emit('data', Buffer.from(value));
    }
  }

  async close(callback) {
    try {
      await this.reader.cancel();
      await this.reader.releaseLock();
      await this.writer.releaseLock();
      await this.port.close();
      this.isOpen = false;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
    callback && callback(null);
  }

  async set(props = {}, callback) {
    try {
      const signals = {};
      if (Object.prototype.hasOwnProperty.call(props, 'dtr')) {
        signals.dataTerminalReady = props.dtr;
      }
      if (Object.prototype.hasOwnProperty.call(props, 'rts')) {
        signals.requestToSend = props.rts;
      }
      if (Object.prototype.hasOwnProperty.call(props, 'brk')) {
        signals.break = props.brk;
      }
      if (Object.keys(signals).length > 0) {
        await this.port.setSignals(signals);
      }
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
    if (callback) return callback(null);
  }

  write(buffer, callback) {
    this.writer.write(buffer);
    if (callback) return callback(null);
  }

  // TODO: is this correct?
  flush(callback) {
    //this.port.flush(); // is this sync or a promise?
    console.warn('flush method is a NOP right now');
    if (callback) return callback(null);
  }

  // TODO: is this correct?
  drain(callback) {
    // this.port.drain(); // is this sync or a promise?
    console.warn('drain method is a NOP right now');
    if (callback) return callback(null);
  }
}

module.exports = SerialPort;
