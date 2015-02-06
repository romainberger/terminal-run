'use strict';

var figlet = require('figlet')
  , ansi   = require('ansi')
  , cursor = ansi(process.stdout)
  , BGS    = ['░', '▒', '▓', '█']

module.exports.cursor = cursor

module.exports.columns = function() {
  return process.stdout.columns
}

module.exports.rows = function() {
  return process.stdout.rows
}

module.exports.writeText = function(message, cb) {
  figlet(message, function(err, output) {
    var ar = output.split('\n')
      // @todo fix margin
      , marginV = (process.stdout.rows - ar.length) / 2
      // bad, should take the longest line
      , marginH = (process.stdout.columns - ar[0].length) / 2
      , whiteSpaceH = new Array(parseInt(marginH, 10)).join(' ')
      , whiteSpaceV = new Array(parseInt(marginV, 10))

    output = ar.map(function(line) {
      return whiteSpaceH + line
    })

    clearScreen()
    cursor.write(whiteSpaceV.join('\n') + output.join('\n'))
    typeof cb === 'function' && cb()
  })
}

var clearScreen = function() {
  cursor.write('\u001B[2J\u001B[')
}
module.exports.clearScreen = clearScreen

module.exports.generateBackground = function() {
  var line = new Array(process.stdout.columns)

  for (var i = 0, max = line.length; i < max; i++) {
    line[i] = Math.random() > .7 ? BGS[1] : BGS[0]
  }

  return line.join('')
}
