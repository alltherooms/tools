var chai = require("chai")
,   spies = require("chai-spies");

chai.use(spies);

chai.should();

global.expect = chai.expect;
global.spy = chai.spy;