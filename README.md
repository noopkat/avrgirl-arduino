[![Build Status](https://travis-ci.org/noopkat/avrgirl-arduino.svg?branch=master)](https://travis-ci.org/noopkat/avrgirl-arduino) [![Coverage Status](https://coveralls.io/repos/noopkat/avrgirl-arduino/badge.svg?branch=master&service=github)](https://coveralls.io/github/noopkat/avrgirl-arduino?branch=master)

# avrgirl-arduino

An avrgirl-wrapper library for flashing Arduino microcontroller boards with NodeJS.

Want to [contribute](CONTRIBUTING.md)?

![logo](http://i.imgur.com/AAvwp0F.png)

## What is this?

avrgirl-arduino is a NodeJS library written to present a convenient way to upload precompiled sketches to an Arduino. avrgirl-arduino supports a selection of Arduino boards.

The current supported list:

+ **Arduino Uno**
+ **Arduino Mega**
+ **Arduino Leonardo**
+ **Arduino Micro**
+ **Arduino Nano**
+ **Arduino Duemilanove (168)**
+ **Arduino Pro Mini**
+ **Femtoduino IMUduino**
+ **RedBearLab Blend Micro**
+ **Tinyduino**
+ **Sparkfun Pro Micro**
+ **Qtechknow Qduino**
+ **Pinoccio Scout**
+ **Adafruit Feather 32u4 Basic Proto**

This library is designed to ultimately be rolled into the avrgirl project (in development), however it still works perfectly well as a stand-alone package to be used outside of avrgirl if you wish.

## How to install

1. Install NodeJS from [nodejs.org](http://nodejs.org)
2. Run `npm install avrgirl-arduino` in your shell of choice

## How do I use it?

Your first task is to source a pre-compiled .hex of the sketch you're interested in uploading to your Arduino. It needs to be compiled for your specific Arduino. You'll find some example hex files for each board within the `junk/hex` folder of this repo, however if you'd like to use your own, [see this guide](#sourcing-a-compiled-arduino-hex-file) if you're unsure of how to go about this.

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
|Arduino Leonardo|`leonardo`|
|Arduino Micro|`micro`|
|Arduino Nano|`nano`|
|Arduino Duemilanove|`duemilanove168`|
|RedBearLab Blend Micro|`blend-micro`|
|Tiny Circuits Tinyduino|`tinyduino`|
|SparkFun Pro Micro|`sf-pro-micro`|
|Qtechknow Qduino|`qduino`|
|Pinoccio Scout|`pinoccio`|
|Femtoduino IMUduino|`imuduino`|
|Adafruit Feather 32u4 Basic Proto|`feather`|

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


## Can I use avrgirl-arduino as a CLI tool?

### You sure can!

Run `npm install -g avrgirl-arduino` in a shell session to install globally for easy CLI use.

The same example above would look like the following as a CLI call in your shell:

`avrgirl-arduino flash -f Blink.cpp.hex -a uno`

Required flags:

+ **-f** specify the location of the hex file to flash
+ **-a** specify the name of the Arduino (`uno`, `mega`,`leonardo`, `micro`, `nano`, `pro-mini`, `duemilanove168`, `blend-micro`, `tinyduino`, `sf-pro-micro`, `qduino`, `pinoccio`, `feather`, or `imuduino`)

Optional flags:

+ **-p** will allow you to specify the port where your Arduino is plugged in. **Remember to specify your port if using an Arduino Pro Mini.**
+ **-v** will turn on debug/verbose mode, which will print a log of things when you run the command.

You can also list the supported boards:

`avrgirl-arduino boards`

As well as listing all available USB devices on your computer:

`avrgirl-arduino list`

The output will be presented in JSON format, very similar to the output of the `Serialport.list()` method (if you've used [node-serialport](https://github.com/voodootikigod/node-serialport) before).

## Sourcing a compiled Arduino hex file

A .hex file is the compiled end result of an Arduino sketch file. I have provided some example hex files for each board within the `junk/hex` folder of this repo. Feel free to use these, or if you're after something specific not provided, see the directions below.

The most common way to compile a sketch for your Arduino of choice is to download and install the [Arduino IDE](https://www.arduino.cc/en/Main/Software).

First make sure you have checked the 'compilation' box under "Show verbose output' heading in your Arduino preferences:

![screencap](http://i.imgur.com/t8IY9z0.png)

Open your sketch (for example 'Blink' under the File -> Examples -> Basics menu), then choose the correct board and port under your Tools menu. Clicking the Verify button (or Ctrl/Cmd + R) will then compile your hex file.

While the compilation is happening you'll see a ton of lines outputting on screen. Search for something like the following when it completes:

```
/var/folders/zp/bpw8zd0141j5zf7l8m_qtt8w0000gp/T/build6252696906929781517.tmp/Blink.cpp.hex

Sketch uses 896 bytes (2%) of program storage space. Maximum is 32,256 bytes.
Global variables use 9 bytes (0%) of dynamic memory, leaving 2,039 bytes for local variables. Maximum is 2,048 bytes.
```
Select and copy the entire file path to your clipboard. You can use your shell/Terminal to copy that file to somewhere more convenient first if you wish, so that you don't have to bother compiling it again if you lose it.

## Acknowledgements

Credit to [Jacob Rosenthal](https://github.com/jacobrosenthal), [Ryan Day](https://github.com/soldair), and [Elijah Insua](https://github.com/tmpvar) for a lot of the heavy lifting going on underneath in this library.

## Contributors

+ [Arek Sredzki](https://github.com/ArekSredzki)
+ [Pawel Szymczykowski](https://github.com/makenai)
+ [Andrew 'AJ' Fisher](https://github.com/ajfisher)
+ [Derek Wheelden](https://github.com/frxnz)
