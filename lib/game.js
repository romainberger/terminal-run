'use strict';

var screen = require('./screen')
  , fs     = require('fs')

var Game = function() {
  this.isPlaying    = false
  this.height       = 0
  this.jumpState    = 0
  this.position     = 0
  this.points       = 0
  this.startTime    = +new Date
  this.startTimeout = false
  this.timeout      = false
  this.speed        = 20
  this.blink        = 0

  this.character    = 'ʘ‿ʘ'
  this.blocks       = ['░', '▒', '▓', '█']

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

  this.startTimeout = setTimeout(function() {
    self.isPlaying = true
    screen.clearScreen()
    self.cycle()
  }, 1000)
}

Game.prototype.end = function() {
  var self = this

  this.isPlaying = false
  clearTimeout(this.timeout)
  clearTimeout(this.startTimeout)

  this.blinkScreen(function() {
    self.display()
    self.blink = 0
    screen.clearScreen()

    screen.writeText('GAME OVER', 'SCORE: ' + self.points, function() {
      setTimeout(function() {
        screen.cursor.show()
        process.exit()
      }, 2000)
    })
  })
}

Game.prototype.listenInput = function() {
  var self = this

  process.stdin.on('data', function(key) {
    if (key === '\u0003') {
      self.end()
    }
    else {
      self.height = self.height > 0 ? self.height : 3
      if (self.height === 3) {
        self.jumpState = 10
      }
    }
  })
}

Game.prototype.cycle = function() {
  var self = this
  this.display()

  self.timeout = setTimeout(function() {
    self.isPlaying && self.cycle.call(self)
  }, self.speed)
}

Game.prototype.display = function(getNewLevel, checkCollision) {
  var self  = this
  getNewLevel = typeof getNewLevel !== 'undefined' ? getNewLevel : true
  checkCollision = typeof checkCollision !== 'undefined' ? checkCollision : true

  getNewLevel && this.getLine(screen.columns()).join('')

  screen.clearScreen()

  // display score
  screen.cursor.goto(screen.columns() - 10, 3).write('Score ' + self.points.toString())

  // display line
  screen.cursor.hex(screen.colors.secondary)
    .goto(1, 20).write(self.currentLevel[0].join(''))
    .goto(1, 21).write(self.currentLevel[1].join(''))
    .goto(1, 22).write(self.currentLevel[2].join(''))
    .reset()

  // check collision
  if (checkCollision && self.height < 3) {
    if ((self.height === 1 && self.currentLevel[0][10] !== ' ') ||
      (self.height === 0 && self.currentLevel[1][10] !== ' ')) {
      self.end()
      return
    }
  }

  // display character
  screen.cursor.goto(10, 21 - self.height).hex(screen.colors.primary).write(this.character).reset()

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
}

Game.prototype.getBlock = function() {
  // @todo check the last block to keep a space between blocks
  return Math.random() > .95 ? this.blocks[~~(Math.random() * 3)] : ' '
}

Game.prototype.blinkScreen = function(cb) {
  var self = this
  this.display(false, false)
  self.blink++

  if (self.blink < 4) {
    setTimeout(function() {
      screen.clearScreen()

      setTimeout(function() {
        self.blinkScreen(cb)
      }, 300)
    }, 300)
  }
  else {
    typeof cb === 'function' && cb()
  }
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
