'use strict';

var chai = require('chai');
var spies = require('chai-spies');
var sinon = require('sinon');

chai.use(spies);

chai.should();

global.expect = chai.expect;
global.spy = chai.spy;
global.sinon = sinon;
