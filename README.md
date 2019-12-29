[![Build Status](https://travis-ci.org/noopkat/avrgirl-arduino.svg?branch=master)](https://travis-ci.org/noopkat/avrgirl-arduino) [![Coverage Status](https://coveralls.io/repos/noopkat/avrgirl-arduino/badge.svg?branch=master&service=github)](https://coveralls.io/github/noopkat/avrgirl-arduino?branch=master)

# avrgirl-arduino

[![Greenkeeper badge](https://badges.greenkeeper.io/noopkat/avrgirl-arduino.svg)](https://greenkeeper.io/)

A NodeJS library for flashing compiled sketch files to Arduino microcontroller boards.

🆕[Alpha release of web serial support](tests/demos/webserial) for some Arduino boards 🆕

**Want to [contribute](CONTRIBUTING.md)?**

**Own a supported Arduino and want to be a test pilot for this project with two minutes of your time?**

1. Run `npm install -g avrgirl-arduino@latest` in your terminal.
2. Type `avrgirl-arduino test-pilot`, hit enter / return key and follow the prompts.
3. Thank you, friend :heart:

![logo](http://i.imgur.com/AAvwp0F.png)

## What is this?

avrgirl-arduino is a NodeJS library written to present a convenient way to upload precompiled sketches to an Arduino. avrgirl-arduino supports a selection of Arduino boards.

The current supported list:

+ **Arduino Uno**
+ **Arduino Mega**
+ **Arduino ADK**
+ **Arduino Leonardo**
+ **Arduino Micro**
+ **Arduino Nano**
+ **Arduino Duemilanove (168)**
+ **Arduino Pro Mini**
+ **Arduino Lilypad USB**
+ **Arduino Yun**
+ **Arduino Esplora**
+ **Femtoduino IMUduino**
+ **RedBearLab Blend Micro**
+ **Tinyduino**
+ **Sparkfun Pro Micro**
+ **Qtechknow Qduino**
+ **Pinoccio Scout**
+ **Adafruit Feather 32u4 Basic Proto**
+ **Arduboy**
+ **Adafruit Circuit Playground**
+ **BQ Zum**
+ **BQ ZUM Core 2**
+ **BQ ZUM Core 2**


This library is designed to ultimately be rolled into the avrgirl project (in development), however it still works perfectly well as a stand-alone package to be used outside of avrgirl if you wish.

## How to install

1. Install NodeJS from [nodejs.org](http://nodejs.org)
2. Run `npm install avrgirl-arduino` in your shell of choice

## For Windows users

Before using your Arduino with avrgirl-arduino on Windows XP, 7, and 8, you may need to install the Arduino drivers included with the Arduino IDE.  You can follow steps 1-4 on [this guide](https://www.arduino.cc/en/Guide/Windows) to install the [Arduino IDE](https://www.arduino.cc/en/Main/Software) and activate the [relevant drivers](https://www.arduino.cc/en/Guide/Windows#toc4).  After step 4 of the guide (drivers) you will be ready to use your Arduino with avrgirl!

## How do I use it?

Your first task is to source a pre-compiled .hex file of the sketch you're interested in uploading to your Arduino. It needs to be compiled for your specific Arduino. You'll find some example hex files for each board within the `junk/hex` folder of this repo, however if you'd like to use your own, [see this guide](#sourcing-a-compiled-arduino-hex-file) if you're unsure of how to go about this.

Already have a .hex file in a Buffer object ready to go? No problem! Pass this Buffer object in instead of the file path string, and avrgirl-arduino will take care of the rest. Hooray!

Don't forget to plug your supported Arduino of choice into an available USB port on your computer!

Wanna use this in the CLI? See [this section](#can-i-use-avrgirl-arduino-as-a-cli-tool).

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

When creating `new Avrgirl()`, only the `board` property is required. The board names to use are detailed in the table below: 

|Programmer|Board Option String|
|:----------|:--------------|
|Arduino Uno|`uno`|
|Arduino Mega|`mega`|
|Arduino ADK|`adk`|
|Arduino Leonardo|`leonardo`|
|Arduino Micro|`micro`|
|Arduino Nano|`nano`|
|Arduino Nano (with new bootloader)|`nano (new bootloader)`|
|Arduino Lilypad USB|`lilypad-usb`|
|Arduino Duemilanove|`duemilanove168`|
|Arduino Yun|`yun`|
|Arduino Esplora|`esplora`|
|RedBearLab Blend Micro|`blend-micro`|
|Tiny Circuits Tinyduino|`tinyduino`|
|SparkFun Pro Micro|`sf-pro-micro`|
|Qtechknow Qduino|`qduino`|
|Pinoccio Scout|`pinoccio`|
|Femtoduino IMUduino|`imuduino`|
|Adafruit Feather 32u4 Basic Proto|`feather`|
|Arduboy|`arduboy`|
|Adafruit Circuit Playground|`circuit-playground-classic`|
|BQ ZUM|`bqZum`|
|BQ ZUM Core 2|`zumcore2`|
|BQ ZUM Junior|`zumjunior`|

You can optionally specify a port to connect to the Arduino, but if you omit this property avrgirl-arduino will do a pretty good job of finding it for you. **The exception to this is if you're using the Arduino Pro Mini - please specify your port in this case as avrgirl-arduino cannot auto detect it for you.**

Specifying the port would look something like this:

```javascript
var avrgirl = new Avrgirl({
  board: 'uno',
  port: '/dev/cu.usbmodem1412'
});
```

You can list available USB ports programmatically using the the `list` method:

```javascript
Avrgirl.list(function(err, ports) {
  console.log(ports);
  /*
  [ { comName: '/dev/cu.usbmodem1421',
  	   manufacturer: 'Arduino (www.arduino.cc)',
      serialNumber: '55432333038351F03170',
      pnpId: '',
      locationId: '0x14200000',
      vendorId: '0x2341',
      productId: '0x0043',
      _standardPid: '0x0043' } ]
  */
});
```

Alternatively, you can use the CLI to list active ports:

```
$ avrgirl-arduino list
[ { comName: '/dev/cu.usbmodem1421',
  	 manufacturer: 'Arduino (www.arduino.cc)',
    serialNumber: '55432333038351F03170',
    pnpId: '',
    locationId: '0x14200000',
    vendorId: '0x2341',
    productId: '0x0043',
    _standardPid: '0x0043' } ]
```

**Like logs?** Turn on debug mode to see simple flashing progress logs in the console:

```javascript
var avrgirl = new Avrgirl({
  board: 'uno',
  // turn on debug mode!
  debug: true
});
```

A sample:

```
found uno on port /dev/cu.usbmodem14141
connected
flashing, please wait...
flash complete.
```

**Prefer your own custom debug behaviour?** No Problem!

You can pass in your own debug function instead of a boolean, and avrgirl-arduino will run that instead.

Example:

```javascript
var myCustomDebug = function(debugLogString) {
  // do your own debug stuff in here
}

var avrgirl = new Avrgirl({
  board: 'uno',
  // turn on debug with your own function
  debug: myCustomDebug
});
```

**Have a device that requires a manual reset?** 

You can pass in a `manualReset` property as a boolean, in either your custom board object _or_ in the general Avrgirl options. This will skip the reset flow when flashing the board. Please note that this is only available for use with boards that speak the AVR109 protocol (most ATMega32U4 powered boards).


Example without custom board:

```javascript
var avrgirl = new Avrgirl({
  board: 'uno',
  // you can put it here:
  manualReset: true
});
```

Example with custom board:

```javascript
var board = {
  name: 'micro',
  baud: 57600,
  signature: new Buffer([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
  productId: ['0x0037', '0x8037', '0x0036'],
  protocol: 'avr109',
  // or you can put it here:
  manualReset: true
};


var avrgirl = new Avrgirl({
  board: board
});
```

## Can I use avrgirl-arduino as a CLI tool?

### You sure can!

Run `npm install -g avrgirl-arduino` in a shell session to install globally for easy CLI use.

The same example above would look like the following as a CLI call in your shell:

`avrgirl-arduino flash -f Blink.cpp.hex -a uno`

Required flags:

+ **-f** specify the location of the hex file to flash
+ **-a** specify the spcification of the Arduino. It can be:
  + the name of the Arduino (`uno`, `mega`,`leonardo`, `micro`, `nano`, `"nano (new bootloader)"`, `pro-mini`, `duemilanove168`, `yun`, `esplora`, `blend-micro`, `tinyduino`, `sf-pro-micro`, `qduino`, `pinoccio`, `feather`, or `imuduino`)
  + a JavaScript file describing a custom board

When using a custom board, the JavaScript file must export the board specification:

```javascript
var board = {
  name: 'micro',
  baud: 57600,
  signature: new Buffer([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
  productId: ['0x0037', '0x8037', '0x0036'],
  protocol: 'avr109',
};

module.exports = board;
```

Optional flags:

+ **-p** will allow you to specify the port where your Arduino is plugged in. **Remember to specify your port if using an Arduino Pro Mini.**
+ **-v** will turn on debug/verbose mode, which will print a log of things when you run the command.

You can also list the supported boards:

`avrgirl-arduino boards`

As well as listing all available USB devices on your computer:

`avrgirl-arduino list`

The output will be presented in JSON format, very similar to the output of the `Serialport.list()` method (if you've used [node-serialport](https://github.com/voodootikigod/node-serialport) before).

## Custom board specification

When specifying a custom board object, a number of properties must be provided:

+ `name`: the name of the board, used in debug and error messages
+ `baud`: the data rate for data transmission
+ `signature`: a `Buffer` containing the device signature
+ `productId`: an array of valid USB product IDs for the board
+ `protocol`: the board communication protocol (`avr109`, `stk500v1` and `stk500v2` are currently supported)

If using the `stk500v2` protocol, you also need to specify:

+ `pageSize`: the size of the page used to load programs

The other board specification properties are optional. You may look at `boards.js` for more details.

## Sourcing a compiled Arduino hex file

A .hex file is the compiled end result of an Arduino sketch file. I have provided some example hex files for each board within the `junk/hex` folder of this repo. Feel free to use these, or if you're after something specific not provided, see the directions below.

The most common way to compile a sketch for your Arduino of choice is to download and install the [Arduino IDE](https://www.arduino.cc/en/Main/Software). Ensure you install version 1.6.5 or greater for the following steps.

1. Open the sketch file you'd like to export, or write a new one if you need to. 
2. Choose the correct target Arduino board you want to compile the hex file for, from the Tools -> Board menu.
3. Export your hex file by navigating to Sketch -> Export compiled binary
![screenshot of the Sketch menu in Arduino IDE with Export compiled binary menu item highlighted in blue](http://f.cl.ly/items/0r1A082H3U3G0U2z1Z40/export_bin.png)
4. You can find the exported hex file in the same directory your sketch file is located in.

## Acknowledgements

Credit to [Jacob Rosenthal](https://github.com/jacobrosenthal), [Ryan Day](https://github.com/soldair), and [Elijah Insua](https://github.com/tmpvar) for a lot of the heavy lifting going on underneath in this library.

## Contributors

+ [Arek Sredzki](https://github.com/ArekSredzki)
+ [Pawel Szymczykowski](https://github.com/makenai)
+ [Andrew 'AJ' Fisher](https://github.com/ajfisher)
+ [Derek Wheelden](https://github.com/frxnz)
+ [Byron Hulcher](https://github.com/byronhulcher)
+ [Luis Montes](https://github.com/monteslu)
+ [Ryan Braganza](https://github.com/ryanbraganza)
+ [Alvaro Sanchez](https://github.com/alvarosBQ)
+ [Francis Gulotta](https://github.com/reconbot)
+ [Tom Calvo](https://github.com/tocalvo)
+ [Kimio Kosaka](https://github.com/kimio-kosaka)
+ [Sandeep Mistry](https://github.com/sandeepmistry)
+ [Nick Hehr](https://github.com/hipsterbrown)
