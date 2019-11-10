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
    navigator.serial.getPorts()
      .then((list) => callback(null, list))
      .catch((error) => callback(error)); 
  }

  open(callback) {
    navigator.serial.requestPort(this.requestOptions)
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
        try {
          while (this.port.readable.locked) {
            const { value, done } = await this.reader.read();
            if (done) {
              break;
            }
            this.emit('data', Buffer.from(value));
          }
        } catch (e) {
          console.log('ERROR while reading port:', e);
        }
    })
    .catch(error => {callback(error)});
  }

  close(callback) {
    this.reader.cancel()
      .then(() => this.reader.releaseLock())
      .then(() => this.port.close())
      .then(() => callback && callback(null))
      .catch((error) => callback && callback(error));
  }

  set(props, callback) {
    this.port.setSignals(props)
      .then(() => callback(null))
      .catch((error) => callback(error));
  }

  write(buffer, callback) {
    this.writer.write(buffer);
    if (callback) return callback(null);
  }

  read(callback) {
    this.reader.read()
      .then((buffer) => callback(null, buffer))
      .catch((error) => callback(error));
  }

  // TODO: is this correct?
  flush(callback) {
    //this.port.flush();
    if (callback) return callback(null);
  }

  drain(callback) {
    if (callback) return callback(null);
  }
}

module.exports = SerialPort;
