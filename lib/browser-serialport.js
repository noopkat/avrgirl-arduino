// TODO: switch out this browser shim for mitt: https://github.com/developit/mitt
const { EventEmitter } = require('events');

class SerialPort extends EventEmitter {
  constructor(port, options) {
    super(options);
    this.options = options || {};

    this.browser = true;
    this.path = this.options.path;
    this.isOpen = false;
    this.port = port || null;
    this.writer = null;
    this.reader = null;
    this.isUpdating = false;
    this.pausePromise = Promise.resolve();
    this.pauseResolve = () => {};
    this.baudRate = this.options.baudRate;
    this.requestOptions = this.options.requestOptions || {};

    if (this.options.autoOpen) this.open();
  }

  list(callback) {
    return navigator.serial.getPorts()
      .then((list) => {if (callback) {return callback(null, list)}})
      .catch((error) => {if (callback) {return callback(error)}}); 
  }

  async _getPort() {
    if (this.port && !this.options.forceRequest) return this.port;
    return window.navigator.serial.requestPort(this.requestOptions)
  }

  open(callback) {
    return new Promise((resolve, reject) => {
      this._getPort()
        .then(serialPort => {
          this.port = serialPort;
          if (this.isOpen) return;
          return this.port.open({ baudRate: this.baudRate || 57600 });
        })
        .then(() => this.writer = this.port.writable.getWriter())
        .then(() => this.reader = this.port.readable.getReader())
        .then(async () => {
          if (!this.isUpdating) this.emit('open');
          this.isOpen = true;
          if (callback) callback(null);
          resolve(null);
          while (this.port.readable.locked) {
            try {
              await this.pausePromise;
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
        .catch(error => {
          if (callback) callback(error);
          reject(error);
        });
    });
  }

  async close(callback) {
    if (!this.isOpen) {
      if (callback) callback(null);
      return;
    }
    try {
      await this.reader.releaseLock();
      await this.writer.releaseLock();
      await this.port.close();
      if (!this.isUpdating) this.emit('close');
      this.isOpen = false;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
    if (callback) callback(null);
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

  async get(callback) {
    const props = {};
    try {
      const signals = await this.port.getSignals();
      if (Object.prototype.hasOwnProperty.call(signals, 'dataCarrierDetect')) {
        props.dcd = signals.dataCarrierDetect;
      }
      if (Object.prototype.hasOwnProperty.call(signals, 'clearToSend')) {
        props.cts = signals.clearToSend;
      }
      if (Object.prototype.hasOwnProperty.call(signals, 'dataSetReady')) {
        props.dsr = signals.dataSetReady;
      }
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
    if (callback) return callback(props);
    return props;
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

  async update (options, callback) {
    try {
      if (
        Object.prototype.hasOwnProperty.call(options, 'baudRate')
        && this.baudRate !== options.baudRate
      ) {
        if (this.isOpen) {
          // try to quietly close then open the port with the new baudRate
          this.isUpdating = true;
          await this.close();
          this.baudRate = options.baudRate;
          await this.open();
          this.isUpdating = false;
        } else {
          this.baudRate = options.baudRate;
        }
      }
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
    if (callback) callback(null);
  }

  pause() {
    this.pausePromise = new Promise((resolve) => {
      this.pauseResolve = resolve;
    });
  }

  resume() {
    this.pauseResolve();
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
