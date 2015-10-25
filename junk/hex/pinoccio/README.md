Here are some hex files for the Pinoccio Scout. Detailed descriptions follow:

- **Blink.cpp.hex** - This is the standard Blink example, but blinking on pin 23. This is the green component of the onboard 'torch' LED. If you you prefer Red or Blue, you can recompile with 21 or 22.

- **Bootstrap.cpp.hex** - This is the firmware that the Pinoccio ships with. If you are planning on using [pinoccio-io](https://github.com/soldair/pinoccio-io), this is what you'll want on the board as that module uses ScoutScript instead of Firmata.

- **StandardFirmata.cpp.hex** - This is a Firmata compiled for the Scout. With this, the Pinoccio will behave like any other Arduino without wireless capability. It may be just what you want. To compile your own, you will need will need the latest [firmata](https://github.com/firmata/arduino).