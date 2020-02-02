# Web Serial Demo of AvrGirl Arduino

⚠️ Web serial support in AvrGirl Arduino is alpha right now and not guaranteed to be stable and full featured. ⚠️

This directory contains a simple web app example of how to use Avrgirl Arduino in the browser. An equivalent example using React can be found [here](./react-demo).

## How to navigate this example

Most of the functionality is contained within `index.html`. All of the HTML elements are optional - they provide an interactive way to choose a file to upload and the Arduino board type. If you can provide a hex file in text format, you can avoid using an UI to source a file.

This example uses the 'global' type of AvrGirl Arduino library distribution, which means that the `AvrgirlArduino` instance is available on the browser's `window` object.

You can also use this library as an ES module and bundle it along with your app's code using a tool such a [webpack](https://webpack.js.org/).

## How to run this example

The fastest way to run this example is to git clone this repository, and run a local web server from this directory. If you have Python installed, [Simple HTTP Server](https://docs.python.org/3.8/library/http.server.html?highlight=http%20server#module-http.server) is a great tool for this, or you can also install [http-server](https://www.npmjs.com/package/http-server) from npm.

1. Install NodeJS or Python 3
2. In your terminal, run `git clone https://github.com/noopkat/avrgirl-arduino`
3. Run `cd avrgirl-arduino/tests/demos/webserial`

For Python 3, run `python -m http.server 3000`

For NodeJS, run `npx http-server -p 3000`

You can then navigate to `http://localhost:3000` in Chrome and play with the app from there.

## Caveats

Currently there is no support for AVR109 / boards that use USB emulation on chip. This includes boards such as Arduino Leonardo, Arduino Micro, Arduboy, etc. There are some technical limitations behind this, and be my guest to give this a try if you're up for a challenge because it's definitely possible to hack this in, it's just something not included with this alpha release.

The Web Serial API is currently in development and is only available behind a flag on the stable branch of Chrome. Please enable the `#enable-experimental-web-platform-features` flag in `chrome://flags` to run this example.

## Find bugs / problems?

I'd love for you to open an issue or a pull request! This is super new and not thoroughly tested so you'll be helping us move towards beta and full releases by contributing. Thank you!
