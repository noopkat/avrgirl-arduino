const { EventEmitter } = require('events');

class SerialPort extends EventEmitter {
  constructor(port, options) {
    super(options);
    this.options = options || {};

    this.browser = true;
    this.path = this.options.path;
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
        return this.port.open({ baudrate: this.baudrate || 57600 });
      })
      .then(() => this.writer = this.port.writable.getWriter())
      .then(() => this.reader = this.port.readable.getReader())
      .then(async () => {
        this.emit('open');
        callback(null);
        while (this.port.readable) {
          try {
            while (true) {
              const { value, done } = await this.reader.read();
              if (done) {
                break;
              }
              this.emit('data', Buffer.from(value));
            }
          } catch (e) {
            console.log('ERROR while reading port:', e);
          }
        }
      })
      .catch(error => {callback(error)});
  }

  close(callback) {
    this.port.close();
		if (callback) return callback(null);
  }

  set(props, callback) {
    this.port.setSignals(props)
      .then(() => callback(null))
      .catch((error) => callback(error));
  }

  write(buffer, callback) {
    this.writer.write(buffer);
    return callback(null);
  }

  read(callback) {
    this.reader.read()
      .then((buffer) => callback(null, buffer))
      .catch((error) => callback(error));
  }

  // TODO: is this correct?
  flush() {
    this.port.flush();
  }
}

module.exports = SerialPort;
