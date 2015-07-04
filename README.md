# avrgirl-arduino

![status not ready](https://img.shields.io/badge/status-not%20ready-red.svg)

An avrgirl-wrapper library for flashing Arduino microcontroller boards. 

## What is this?

avrgirl-arduino is a library written to present a convenient way to upload precompiled sketches to an Arduino. avrgirl-arduino supports a selection of Arduino boards, with more to be added soon. 

The current supported list:

+ Arduino Uno
+ Arduino Leonardo
+ Arduino Micro
+ Femtuduino IMUduino

Coming soon:

+ Arduino Mega
+ Arduino Diecimila / Duemilanove
+ Arduino Nano
+ Arduino Pro
+ Blend-Micro
+ Tinyduino

This library is designed to ultimately be rolled into the avrgirl project, however it still works perfectly well as a stand alone package to be used outside of avrgirl if you wish.

## How to install

1. Install NodeJS from http://nodejs.org
2. Run `npm install avrgirl-arduino` in your shell of choice
3. Node-serialport is a dependency of avrgirl-arduino, so if you run into any troubles in step 2 and the stack trace pins it on node-serialport, [check here](https://github.com/voodootikigod/node-serialport#to-install) for further instructions on how to get everything all fixed up.

## How do I use it?

Your first task is to source a pre-compiled .hex of the sketch you're interested in uploading to your Arduino. It needs to be compiled for your specific Arduino. [See this guide]() if you're unsure of how to go about this.

Don't forget to plug your supported Arduino of choice into an available USB port on your computer!

The following example code should get you up and running with an Arduino Uno:

```javascript
var Avrgirl = require('avrgirl-arduino');
var avrgirl = new Avrgirl({
  board: 'uno'
});

avrgirl.flash('Blink.cpp.hex', function (error) {
  if (error) {
    console.error(error);
  } else {
    console.info('done.');
  }
});

```

When creating `new Avrgirl()`, only the `board` property is required. The current board names can be specified as `'uno'`, `'leonardo'`, `'micro'`, or `'imuduino'`.

You can also optionally specify a port to connect to the Arduino, but if you omit this property avrgirl-arduino will do a pretty good job of finding it for you.

Specifying the port would look something like this:

```javascript
var avrgirl = new Avrgirl({
  board: 'uno',
  port: '/dev/cu.usbmodem1412'
});
```

If you'd like a quick way of listing out the current available USB ports on your system, run `node lib/list.js` from the `avrgirl-arduino` root within your `node_modules` directory.

## Sourcing a compiled arduino .hex file

todo
