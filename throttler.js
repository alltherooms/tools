
/*
class Throttler
Usage:
  var throttler = new Throttler()

  //Configuration:
  //Execute 2 concurrent functions, with a maximum of 10 executions every 3 minutes
  throttler.concurrency = 2;
  throttler.executionsPerRound = 10;
  throttler.roundMinutes = 3;
  //These options can be passed to the constructor as well: new Throttler(2, 10, 3);

  //Adding functions
  for (var i = 0; i < 20; i++) {
    throttler.add(function (next)
      setTimeOut(function (){
        next()
        //Call next to indicate this function finished. Optionally `next(error)` to end throttler with `error`
      }, 2000);
    });
  };

  throtller.on('error', function (error) {
    //Something went wrong
  });

  throttler.on('finish', function (error) {
    //Finished!
  });

  throttler.run(); //Start throttler

Events:
  'error': Fires when an error happen
  'finish': Fires when finished executing all functions
*/

module.exports = Throttler;

var EventEmitter = require("events").EventEmitter
,   util = require("util");
util.inherits(Throttler, EventEmitter);

function Throttler (concurrency, executionsPerRound, roundMinutes) {
  this.concurrency = concurrency || 1;
  this.executionsPerRound = executionsPerRound || null;
  this.roundMinutes = roundMinutes || null;
  this.queue = [];
  this.nextRoundInterval = null;
  this.round = 0;
  this.executing = 0;
  this.executed = 0;
};

Throttler.prototype._isTimed = function () {
  return this.executionsPerRound && this.roundMinutes;
};

Throttler.prototype._validate = function (first_argument) {
  if (this._isTimed() && this.concurrency > this.executionsPerRound) {
    return this.emit("error", new Error("concurrency: " + this.concurrency +
      " can't be greater than executionsPerRound: " + this.executionsPerRound));
  };
};

Throttler.prototype._isTimeForNextRound = function () {
  if (this.round == 0) return true;
  var now = new Date();
  return (now - this.startedAt) / 1000 / 60 >= this.roundMinutes;
};

Throttler.prototype.setIntervalAndExecute = function(fn, ms) {
  var intervalId = setInterval(fn, ms);
  fn();
  return intervalId;
};

Throttler.prototype.add = function (fn) {
  this.queue.push(fn);
};

Throttler.prototype.run = function () {
  var self = this;
  this.startedAt = this.startedAt || new Date();
  this._validate();

  function _next (error) {
    if (error) return self.emit("error", error);
    if (--self.executing == 0 && self.queue.length == 0) {
      self.emit("finish");
    } else {
      self.run();
    };
  };

  if (this._isTimed()) {
    if (this.queue.length && this.executing < this.concurrency) {
      if (this.executed < this.round * this.executionsPerRound){
        while (this.queue.length && this.executing < this.concurrency && this.executed < this.round * this.executionsPerRound) {
          this.executing++;
          this.executed++;
          var fn = this.queue.shift();
          if (typeof fn == "function") fn(_next);
        };
      } else if (this.executed < (this.round + 1) * this.executionsPerRound && !this.nextRoundInterval) {
        this.nextRoundInterval = this.setIntervalAndExecute(function () {
          if (self._isTimeForNextRound()){
            clearInterval(self.nextRoundInterval);
            self.nextRoundInterval = null;
            self.round++;
            self.startedAt = new Date();
            while (self.queue.length && self.executing < self.concurrency && self.executed < self.round * self.executionsPerRound) {
              self.executing++;
              self.executed++;
              var fn = self.queue.shift()
              if (typeof fn == "function") fn(_next);
            };
          };
        }, this.roundMinutes / 2 * 60 * 1000);
      };
    };
  } else if (this.queue.length && this.executing < this.concurrency) {
    while (this.queue.length && this.executing < this.concurrency) {
      this.executing++;
      var fn = this.queue.shift();
      if (typeof fn == "function") fn(_next);
    };
  };
};

Throttler.prototype.stop = function () {
  this.queue.length = 0;
};

module.exports = Throttler;