/*
SocketDataParser Transform Stream
Reads the socket input (buffer), and outputs javascript objects.

usage:
//...
var net = require('net')
,   SocketDataParser = require('tools/socket-data-parser')
,   socket = net.connect({host: host, port: port});

socket.pipe(new SocketDataParser()).on('data', function (object) {
  //Handle object
});
//...
*/

module.exports = AccommodationsParser;

var Transform = require('stream').Transform;
var util = require('util');
var utils = require('./utils');

util.inherits(AccommodationsParser, Transform);

function AccommodationsParser() {
  Transform.call(this, { objectMode: true });
  this._buffer = '';
  this._pendSignal = '>>>PEND<<<';
};

AccommodationsParser.prototype._transform = function(chunk, encoding, callback) {
  this._buffer += chunk;
  var pedLastIndex = this._buffer.lastIndexOf(this._pendSignal);

  if (pedLastIndex != -1) {
    var packages = this._buffer.substring(0, pedLastIndex).split(this._pendSignal);
    this._buffer = this._buffer.substring(pedLastIndex, this._buffer.length);

    for (var i = 0; i < packages.length; i++) {
      try {
        if (packages[i]) this.push(JSON.parse(packages[i]));
      } catch (e) {
        return callback(e);
      }
    };
  };

  callback();
};