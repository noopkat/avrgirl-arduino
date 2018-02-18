module.exports = {
  connection: {
    open: 'connection:open',
    close: 'connection:close',
  },
  board: {
    found: 'board:found',
    reset: {
      init: 'board:reset:init',
      complete: 'board:reset:complete'
    },
  },
  flash: {
    init: 'flash:init',
    complete: 'flash:complete'
  }
}

