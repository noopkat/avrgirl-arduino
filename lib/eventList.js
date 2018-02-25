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
    writePage: {
       init: 'board:writePage:init',
       complete: 'board:writePage:complete'
    },
  },
  flash: {
    init: 'flash:init',
    complete: 'flash:complete'
  }
}

