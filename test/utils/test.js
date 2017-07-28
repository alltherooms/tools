'use strict';

var utils = require('../../utils');

describe('Utils', function() {
  it('#tryParseJSON returns false when is a string', function() {
    var result = utils.tryParseJSON('string');
    expect(result).to.be.false;
  });

  it('#tryParseJSON returns false when is null', function() {
    var result = utils.tryParseJSON(null);
    expect(result).to.be.false;
  });

  it('#tryParseJSON returns false when is a number', function() {
    var result = utils.tryParseJSON(3);
    expect(result).to.be.false;
  });

  it('#tryParseJSON returns false when is bool', function() {
    var result = utils.tryParseJSON(false);
    expect(result).to.be.false;
  });

  it('#tryParseJSON returns false when is an object', function() {
    var result = utils.tryParseJSON({});
    expect(result).to.be.false;
  });

  it('#tryParseJSON returns the object when is valid', function() {
    var result = utils.tryParseJSON('{ "param": "string" }');
    expect(result).to.deep.include({ "param": "string" });
  });
});