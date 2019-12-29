const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

const importableConfig = {
  entry: './avrgirl-arduino-browser.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'avrgirl-arduino.js',
    libraryTarget: 'umd'
  },
  optimization: {
    minimize: false,
  }
};

const importableMinConfig = {
  entry: './avrgirl-arduino-browser.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'avrgirl-arduino.min.js',
    libraryTarget: 'umd'
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
};


const globalConfig = {
  entry: './avrgirl-arduino-browser.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'avrgirl-arduino.global.min.js',
    library: 'AvrgirlArduino',
    libraryTarget: 'window'
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
};
const globalConfigNonMin = {
  entry: './avrgirl-arduino-browser.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'avrgirl-arduino.global.js',
    library: 'AvrgirlArduino',
    libraryTarget: 'window',
  },
  optimization: {
    minimize: false,
  }
};

module.exports = [importableConfig, importableMinConfig, globalConfig, globalConfigNonMin];
