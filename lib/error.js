function avrgError(options) {
  var custom = options.custom || '';
  var code = options.code;

  var errors = {
    'unsupported_board_error': `${custom} is not a supported board type.`,
    'unsupported_protocol_error': `${custom} is not a supported programming protocol`,
    'pro_mini_port_error': 'using a pro-mini - please specify the port in your options.',
    'board_not_found_error': `${custom} board was not found.`,
    'post_reset_not_found_error': `could not find board again after resetting.`,
    'post_reset_not_open_error': `could not reconnect to board again after resetting.`,
    'stk500v1_error': `${custom}`,
    'stk500v2_error': `${custom}`,
    'avr109_error': `${custom}`
  }

  this.message = errors[code];
  this.code = code;
}

avrgError.prototype = Object.create(Error.prototype);
avrgError.prototype.constructor = avrgError;

module.exports = avrgError;
