var ProgressBar = require('progress');

var progress = function(size) {

  this.bar = new ProgressBar('  flashing [:bar] :percent', {
    complete: '=',
    incomplete: ' ',
    width: 20,
    total: size
  });

};

progress.prototype.update = function(size) {
  this.bar.tick(size);
};

module.exports = progress;
