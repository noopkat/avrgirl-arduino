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
    this.baudrate = this.options.baudRate;
    this.requestOptions = this.options.requestOptions || {};

    if (this.options.autoOpen) this.open();
  }

  list(callback) {
    return navigator.serial.getPorts()
      .then((list) => {if (callback) {return callback(null, list)}})
      .catch((error) => {if (callback) {return callback(error)}}); 
  }

  open(callback) {
    window.navigator.serial.requestPort(this.requestOptions)
      .then(serialPort => {
        this.port = serialPort;
        if (this.isOpen) return;
        return this.port.open({ baudrate: this.baudrate || 57600 });
      })
      .then(() => this.writer = this.port.writable.getWriter())
      .then(() => this.reader = this.port.readable.getReader())
      .then(async () => {
        this.emit('open');
        this.isOpen = true;
        callback(null);
        while (this.port.readable.locked) {
          try {
            const { value, done } = await this.reader.read();
            if (done) {
              break;
            }
            this.emit('data', Buffer.from(value));
          } catch (e) {
            console.error(e);
          }
        }
      })
      .catch(error => {callback(error)});
  }

  async close(callback) {
    try {
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

  async set(props, callback) {
    try {
      await this.port.setSignals(props);
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

  async read(callback) {
    let buffer;
    try {
      buffer = await this.reader.read();
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
    if (callback) callback(null, buffer);
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
