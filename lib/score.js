'use strict';

var Parse  = require('parse').Parse
  , appId  = null
  , appKey = null

Parse.initialize(appId, appKey)

var Score = Parse.Object.extend('Score')

module.exports.getBestScores = function(cb) {
  var query = new Parse.Query(Score)
  query.limit(10)
  query.descending('score')
  query.find({
    success: cb
  })
}

module.exports.saveScore = function(name, score) {
  var newScore = new Score
  return newScore.save({name: name, score: score})
}
