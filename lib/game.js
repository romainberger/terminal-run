'use strict';

var screen = require('./screen')

var Game = function() {
  this.isPlaying    = false
  this.menuScreen   = false
  this.startTimeout = false
  this.timeout      = false
  this.maxSpeed     = 10

  this.character    = '👻'
  this.blocks       = ['🌵', '🌲', '🌳', '🌴']
  this.ground       = ['█']

  this.blockSpace   = 15

  this.stdin = process.stdin
  this.stdin.resume()
  this.stdin.setRawMode(true)
  this.stdin.setEncoding('utf8')

  screen.cursor.hide()
}

Game.prototype.reset = function() {
  this.height       = 0
  this.jumpState    = 0
  this.position     = 0
  this.points       = 0
  this.blink        = 0
  this.speed        = 30
  this.lastBlock    = this.blockSpace
  this.currentLevel = new Array(2)
  this.getInitialLine()
}

/**
 * Start a new game
 */
Game.prototype.start = function() {
  screen.writeText('NEW GAME')
  var self = this

  this.listenInput()
  this.reset()
  this.menuScreen = false

  this.startTimeout = setTimeout(function() {
    self.isPlaying = true
    screen.clearScreen()
    self.cycle()
  }, 1000)
}

/**
 * End the game
 * @param {boolean} exit
 */
Game.prototype.end = function(exit) {
  var self = this
  exit = exit || false

  this.isPlaying = false
  clearTimeout(this.timeout)
  clearTimeout(this.startTimeout)

  this.blinkScreen(function() {
    self.blink = 0
    screen.clearScreen()

    screen.writeText('GAME OVER', 'SCORE: ' + self.points, function() {
      if (exit) {
        setTimeout(function() {
          self.exit()
        }, 2000)
      }
      else {
        self.menuScreen = true
        screen.menuScreen()
      }
    })
  })
}

Game.prototype.exit = function() {
  screen.cursor.show()
  process.exit()
}

/**
 * Listen user's input
 */
Game.prototype.listenInput = function() {
  var self = this

  process.stdin.on('data', function(key) {
    if (key === '\u0003') {
      if (self.menuScreen) {
        self.exit()
      }
      else {
        self.end(true)
      }
    }
    else if (self.isPlaying) {
      self.height = self.height > 0 ? self.height : 3
      if (self.height === 3) {
        self.jumpState = 10
      }
    }

    if (self.menuScreen) {
      if (key === 'n') {
        self.start()
      }
      if (key === 'q') {
        self.exit()
      }
    }
  })
}

/**
 * Interval to run the game
 */
Game.prototype.cycle = function() {
  var self = this
  this.display()

  self.timeout = setTimeout(function() {
    self.isPlaying && self.cycle.call(self)
  }, self.speed)
}

/**
 * Main method to display the game
 * @param {boolean} getNewLevel - Determines if the game must generate a new block
 * @param {boolean} checkCollision - Determines if we check for collision
 * @param {string} color - Force a color for all display
 */
Game.prototype.display = function(getNewLevel, checkCollision, color) {
  var self  = this
  getNewLevel = typeof getNewLevel !== 'undefined' ? getNewLevel : true
  checkCollision = typeof checkCollision !== 'undefined' ? checkCollision : true
  color = color || false

  getNewLevel && this.getLine(screen.columns()).join('')

  screen.clearScreen()

  // display score
  screen.cursor.goto(screen.columns() - 10, 3).write('Score ' + self.points.toString())

  // display line
  screen.cursor.hex(color ? color : screen.colors.secondary)
    .goto(1, 21).write(self.currentLevel[1].join(''))
    .goto(1, 22).write(self.currentLevel[2].join(''))
    .hex(color ? color : screen.colors.ground2)
    .goto(1, 23).write(self.currentLevel[2].join(''))
    .hex(color ? color : screen.colors.ground3)
    .goto(1, 24).write(self.currentLevel[2].join(''))
    .reset()

  // check collision
  if (checkCollision && self.height < 3) {
    if (self.height === 0 && self.currentLevel[1][10] !== ' ') {
      self.end()
      return
    }
  }

  // display character
  screen.cursor.goto(10, 21 - self.height).hex(color ? color : screen.colors.primary).write(this.character).reset()

  // character falling
  if (self.jumpState > 0) {
    self.jumpState--
    self.height = self.jumpState > 3 ? self.height : self.jumpState
  }

  if (self.position === 50) {
    self.points++
    self.position = 0

    if (self.points > 0 && self.points % 5 === 0) {
      self.speed = self.speed < self.maxSpeed ? self.maxSpeed : self.speed - 2
    }
  }
  else {
    self.position++
  }
}

/**
 * Get next block
 * Takes into account the last block generated
 */
Game.prototype.getBlock = function() {
  if (this.lastBlock < this.blockSpace) {
    this.lastBlock++
    return ' '
  }
  this.lastBlock = 0
  return Math.random() > .4 ? this.blocks[~~(Math.random() * 4)] : ' '
}

/**
 * Blink the current screen in red three times
 * @param {function} cb
 */
Game.prototype.blinkScreen = function(cb) {
  var self = this
  this.display(false, false, screen.colors.error)
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

/**
 * Get the initial game leve
 */
Game.prototype.getInitialLine = function() {
  this.currentLevel[1] = []
  this.currentLevel[2] = []

  for (var i = 0; i < process.stdout.columns; i++) {
    this.currentLevel[1].push(' ')
    this.currentLevel[2].push(this.ground)
  }
}

/**
 * Generate the level with a new block
 */
Game.prototype.getLine = function() {
  var block = this.getBlock()
  this.currentLevel[1].shift()
  this.currentLevel[1].push(block)

  return this.currentLevel
}

module.exports = Game
