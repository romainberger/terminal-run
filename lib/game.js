'use strict';

var screen = require('./screen')

var Game = function() {
  this.isPlaying = false
  this.height    = 0
  this.jumpState = 0
  this.position  = 0
  this.points    = 0
  this.startTime = +new Date
  this.timeout   = false
  this.speed     = 20

  this.character = 'ʘ‿ʘ'
  this.blocks    = ['░', '▒', '▓', '█']

  this.currentLevel = new Array(3)
  this.getInitialLine()

  this.stdin = process.stdin
  this.stdin.resume()
  this.stdin.setRawMode(true)
  this.stdin.setEncoding('utf8')

  screen.cursor.hide()
}

Game.prototype.start = function() {
  screen.writeText('NEW GAME')
  var self = this

  this.listenInput()

  setTimeout(function() {
    self.isPlaying = true
    self.display()
  }, 1000)
}

Game.prototype.end = function() {
  this.isPlaying = false
  clearTimeout(this.timeout)

  screen.writeText('GAME OVER', function() {
    setTimeout(function() {
      screen.cursor.show()
      process.exit()
    } , 500)
  })
}

Game.prototype.listenInput = function() {
  var self = this

  process.stdin.on('data', function(key) {
    if (key === '\u0003') {
      self.end()
    }

    if (key === 'w') {
      self.height = self.height > 0 ? self.height : 3
      if (self.height === 3) {
        self.jumpState = 10
      }
    }
  })
}

Game.prototype.display = function() {
  var self  = this
    , line  = this.getLine(screen.columns()).join('')
    , level = this.character + '\n' + line

  screen.clearScreen()

  // display score
  screen.cursor.goto(screen.columns() - 10, 3).write('Score ' + self.points.toString())

  // display line
  screen.cursor
    .goto(1, 20).write(self.currentLevel[0].join(''))
    .goto(1, 21).write(self.currentLevel[1].join(''))
    .goto(1, 22).write(self.currentLevel[2].join(''))

  // check collision
  if (self.height < 3) {
    if ((self.height === 1 && self.currentLevel[0][10] !== ' ') ||
      (self.height === 0 && self.currentLevel[1][10] !== ' ')) {
      screen.clearScreen()
      self.end()
      return
    }
  }

  // display character
  screen.cursor.goto(10, 21 - self.height).write(this.character)

  // character falling
  if (self.jumpState > 0) {
    self.jumpState--
    self.height = self.jumpState > 3 ? self.height : self.jumpState
  }

  if (self.position === 50) {
    self.points++
    self.position = 0
  }
  else {
    self.position++
  }

  self.timeout = setTimeout(function() {
    self.isPlaying && self.display.call(self)
  }, self.speed)
}

Game.prototype.getBlock = function() {
  // @todo check the last block to keep a space between blocks
  return Math.random() > .95 ? this.blocks[Math.floor(Math.random() * 3)] : ' '
}

Game.prototype.getInitialLine = function() {
  this.currentLevel[0] = []
  this.currentLevel[1] = []
  this.currentLevel[2] = []

  for (var i = 0; i < process.stdout.columns; i++) {
    this.currentLevel[0].push(' ')
    this.currentLevel[1].push(' ')
    this.currentLevel[2].push(this.blocks[3])
  }
}

Game.prototype.getLine = function() {
  var block = this.getBlock()
  this.currentLevel[1].shift()
  this.currentLevel[0].shift()

  if (block !== '') {
    var bigBlock = Math.random() > .8 ? block : ' '
  }

  this.currentLevel[1].push(block)
  this.currentLevel[0].push(bigBlock)

  return this.currentLevel
}

module.exports = Game
