# React Web Serial Demo of AvrGirl Arduino

This directory contains a simple example of how to use Avrgirl Arduino with React.

## How to navigate this example

This React project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). Most of the functionality is contained within `/src/App.js`. This example uses the UMD AvrGirl Arduino library distribution which allows it to be imported and bundled.

## How to run this example

The fastest way to run this example is to git clone this repository and run the app locally.

1. Install NodeJS
2. In your terminal, run `git clone https://github.com/noopkat/avrgirl-arduino`
3. Run `cd avrgirl-arduino/tests/demos/webserial/react-demo`
4. Run `npm install`
5. Run `npm start`. Open `http://localhost:3000` in Chrome to play with the app.

## Caveats

The Web Serial API is currently in development and is only available behind a flag on the stable branch of Chrome. Please enable the `#enable-experimental-web-platform-features` flag in `chrome://flags` to run this example.
