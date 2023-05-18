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

  getPortToUse() {
    if (this.port) {
      return new Promise(function (resolve, reject) {
        resolve(this.port)
      });
    } else {
      window.navigator.serial.requestPort(this.requestOptions)
    }
  }

  list(callback) {
    return navigator.serial.getPorts()
      .then((list) => {if (callback) {return callback(null, list)}})
      .catch((error) => {if (callback) {return callback(error)}}); 
  }

  open(callback) {
    this.getPortToUse()
      .then(serialPort => {
        this.port = serialPort;
        if (this.isOpen) return;
        return this.port.open({ baudRate: this.baudRate || 57600 });
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

  openWithPort(callback, port) {
    try {
    this.port = serialPort;
    if (!this.isOpen) return;
      this.port.open({ baudRate: this.baudRate || 57600 });
    this.writer = this.port.writable.getWriter()
    this.reader = this.port.readable.getReader()

    async () => {
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
    }


    } catch(error) {
      callback(error)
    }
   
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
