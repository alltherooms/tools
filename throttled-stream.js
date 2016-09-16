"use strict";

var util = require('util');
var EventEmiter = require('events').EventEmitter;

util.inherits(ThrottledStream, EventEmiter);

function ThrottledStream (readStream, options) {
  EventEmiter.call(this);

  if (!readStream) {
    throw new Error("'readStream' must be provided as first Constructor's argument");
  }

  options = options || {};

  this.readStream = readStream;
  this.concurrency = options.concurrency || 1;
}

ThrottledStream.prototype.init = function () {
  var self = this;

  this.processing = 0;
  this.streamPaused = false;
  this.streamEnded = false;

  this.queue = [];

  this.readStream.on('error', this.emit.bind(this, 'error'));

  this.readStream.on('data', function (data) {
    self.queue.push(data);
    if (self.queue.length == self.concurrency) {
      self.streamPaused = true;
      self.readStream.pause();
    }
  });

  this.readStream.on('end', function () {
    self.streamEnded = true;

    if (self.didFinish()) {
      return self.emit('end');
    }

    if (self.queue.length && self.queue.length < self.concurrency) {
      var object;
      while (object = self.queue.shift()) self.send(object);
    }
  });

  this.read(this.concurrency);
};

ThrottledStream.prototype.read = function (size) {
  if (this.queue.length >= size) {
    for (var i = 0; i < size; i++) {
      this.send(this.queue.shift());
    }
  } else {
    if (this.streamPaused) {
      this.streamPaused = false;
      this.readStream.resume();
    }

    setImmediate(this.read.bind(this, size));
  }
};

ThrottledStream.prototype.send = function (object) {
  var self = this;

  this.processing++;

  this.emit('data', object, function (error) {
    if (error) return self.emit('error', error);

    self.processing--;

    if (self.didFinish()) {
      self.emit('end');
    } else {
      self.read(1);
    }
  });
};

ThrottledStream.prototype.didFinish = function () {
  return (!this.processing && this.streamEnded && !this.queue.length);
};

module.exports = ThrottledStream;