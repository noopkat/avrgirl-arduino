const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

const resolve = {
  fallback: {
     "util": require.resolve("util/"),
     "stream": require.resolve("stream-browserify"),
     "os": require.resolve("os-browserify/browser"),
  }
}

const plugins = [
  new webpack.ProvidePlugin({
    Buffer: ['buffer', 'Buffer'],
    process: 'process/browser.js',
  })
];

const importableConfig = {
  entry: './avrgirl-arduino-browser.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'avrgirl-arduino.js',
    libraryTarget: 'umd'
  },
  optimization: {
    minimize: false,
  },
  resolve,
  plugins
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
  resolve,
  plugins
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
  resolve,
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
  },
  resolve,
  plugins
};

module.exports = [importableConfig, importableMinConfig, globalConfig, globalConfigNonMin];
