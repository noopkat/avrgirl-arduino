# Chrome Serial support for Avrgirl Arduino

## methods and properties needed for direct mappings / translation interface

### constructor / static
+ `new SerialPort()` -> `navigator.serial.requestPort`
+ `SerialPort.list` -> `navigator.serial.getPorts`

### instance
+ `serialPort.open` -> `serialPort.open`
+ `serialPort.path` -> manually set after user gesture and user permission granted? I don't see it in the port info object
+ `serialPort.close` -> `serialPort.close`
+ `serialPort.set` -> `serialPort.setControlSignals`
+ `serialPort.write` -> `serialPort.writeable.getWriter().write`
+ `serialPort.read` -> `serialPort.readable.getReader().read`
+ `serialPort.flush` -> `serialPort.flush`

### events
+ error
+ close
+ open

**Note:** this list is not exhaustive of node serialport but these are the minimum requirements in order to bootstrap Avrgirl Arduino

## questions
+ what should the default buffer size be for writing? Although in Avrgirl we can set this to the pageSize + amount of control bytes needed for opcodes
+ should the browser serialport library shim be written in typescript? (probably)
+ how are the pid and vid properties extracted? Assumption is that they're included in the properties of `getPorts` results though I don't see it in the fake mock that Reilly wrote
+ how can a static method be declared in an ES6 class declaration? I forget right now and I don't have internet for a week to look it up
+ should a more modern interface of promises be an option for the library shim while remaining compatible with existing callback implementation?
+ should the bundler be changed from browserify to webpack? graceful-fs would need to be swapped out for regular fs if so
+ do the events all match up to equivalencies?
+ perhaps the serialPort.path needs to be the id of the serial device instance? How do we reconnect after a reset of the device?

