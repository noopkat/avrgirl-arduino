class SerialPort {
  constructor(options) {
    this.options = options;

    this.path = this.options.path;
    this.port = null;
    this.writer = null;
    this.reader = null;
    this.baudrate = this.options.baudRate;

    // not sure what needs to go into this options object (perhaps pid / vid filters like webusb?)
    var requestOptions = {};

    navigator.serial.requestPort(requestOptions)
      .then(serialPort => this.port = serialport)
      .then(() => this.writer = this.port.getWriter())
      .then(() => this.reader = this.port.getReader())
      .catch(error => {throw new Error(error)});
  }

  list(callback) {
    navigator.serial.getPorts()
      .then((list) => callback(null, list))
      .catch((error) => callback(error)); 
  }

  open(callback) {
    this.port.open({baudrate: this.boardrate})
      .then(() => callback(null))
      .catch((error) => callback(error));
  }

  close(callback) {
    this.port.close()
      .then(() => callback(null))
      .catch((error) => callback(error));
  }

  set(props, callback) {
    // I'm not entirely sure the remappings below are correct
    // TODO: read the serial spec to be sure 
    const remappedSignals = {
      signals: {
        dsr: props.dtr,
        ri: props.rts  
      }
    };

    this.port.setControlSignals(remappedSignals)
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
