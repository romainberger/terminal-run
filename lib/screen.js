'use strict';

var figlet = require('figlet')
  , ansi   = require('ansi')
  , cursor = ansi(process.stdout)

module.exports.cursor = cursor

module.exports.columns = function() {
  return process.stdout.columns
}

module.exports.rows = function() {
  return process.stdout.rows
}

var colors = {
  primary:   '#660066',
  secondary: '#006633',
  error:     '#ff0000'
}
module.exports.colors = colors

module.exports.writeText = function(title, message, cb) {
  message = typeof message === 'undefined' ? false : message.toString()

  figlet(title, function(err, output) {
    var ar = output.split('\n')
      , marginV = (process.stdout.rows - ar.length) / 2
      , marginH = (process.stdout.columns - ar[0].length) / 2
      , whiteSpaceH = new Array(parseInt(marginH, 10)).join(' ')

    output = ar.map(function(line) {
      return whiteSpaceH + line
    })

    clearScreen()
    cursor.goto(1, marginV).hex(colors.primary).write(output.join('\n')).reset()
    if (message) {
      var x = (process.stdout.columns - message.length) / 2
        , y = marginV + output.length + 3
      cursor.goto(x, y).hex(colors.secondary).write(message).reset()
    }

    typeof cb === 'function' && cb()
  })
}

var clearScreen = function() {
  cursor.write('\u001B[2J\u001B[')
}
module.exports.clearScreen = clearScreen
