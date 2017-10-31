/*
SocketDataParser test
*/

var fs = require("fs")
,   SocketDataParser = require("../../socket-data-parser");

describe("SocketDataParser", function () {
  before(function (done) {
    var self = this
    ,   rs = fs.createReadStream(__dirname + "/fixtures/accommodations-buffer.txt");

    this.socketDataParser = new SocketDataParser();
    this.accommodations = [];

    rs.pipe(this.socketDataParser);

    this.socketDataParser.on("data", function (accommodation) {
      self.accommodations.push(accommodation);
    }).on("end", done);
  });

  it("parses all the accommodations in the buffer", function () {
    expect(this.accommodations).to.have.length(4);
  });
});