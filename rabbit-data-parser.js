/*
RabbitDataParser Transform Stream
Reads the input (string), and outputs javascript objects.
*/

module.exports = AccommodationsParser;

var Transform = require('stream').Transform;
var util = require('util');
var utils = require('./utils');

util.inherits(AccommodationsParser, Transform);

function AccommodationsParser() {
  Transform.call(this, { objectMode: true });
};

AccommodationsParser.prototype._transform = function(string, encoding, callback) {
  const jsonString = utils.tryParseJSON(string.toString());

  if (jsonString) this.push(jsonString);

  callback();
};
