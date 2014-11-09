var CSVParser = require("../../csv-parser")
,   fs = require("fs");

describe("CSVParser", function () {

  beforeEach(function () {
    this.csvParser = new CSVParser({
      sourceFilePath: __dirname + "/fixtures/source.csv",
      separator: ";",
      wrapper: "\""
    }, {
      id: "Id",
      name: "Name",
      location: ["Longitude", "Latitude"],
      minprice : "MinPrice",
      rating: {
        reviewScore: "HotelReviewScore",
        numberOfReviews: "HotelNumberReviews"
      }
    });
  });

  function forEachParsedObject (csvParser, fn, done) {
    csvParser.on("object", function (object, next) {
      fn(object);
      next();
    });
    csvParser.on("error", done);
    csvParser.on("end", done);
    csvParser.start();
  };

  it("emits each object with all the mapped fields", function (done) {
    var self = this;
    forEachParsedObject(this.csvParser, function (object) {
      expect(object).to.have.keys(Object.keys(self.csvParser.map));
    }, done);
  });

  it("emits each object with a valid location array", function (done) {
    forEachParsedObject(this.csvParser, function (object) {
      expect(object.location).to.be.an("array").and.to.have.length(2);
      expect(parseFloat(object.location[0])).to.be.a("number");
      expect(parseFloat(object.location[1])).to.be.a("number");
    }, done);
  });

  it("emits each object with a valid rating object", function (done) {
    var self = this;
    forEachParsedObject(this.csvParser, function (object) {
      expect(object.rating).to.be.an("object").and.to.have.keys(Object.keys(self.csvParser.map.rating));
      expect(parseFloat(object.rating.reviewScore)).to.be.a("number");
      expect(parseFloat(object.rating.numberOfReviews)).to.be.a("number");
    }, done);
  });

  it("properly sets the values of all fields", function (done) {
    var tested = false;
    forEachParsedObject(this.csvParser, function (object) {
      if (tested) return;
      tested = true;

      expect(object.id).to.equal("102");
      expect(object.name).to.equal('"Hampshire" Hotel; Prinsengracht');
      expect(object.minprice).to.equal("47.17");
      expect(object.location).to.deep.equal(["4.8945", "52.362"]);
      expect(object.rating).to.deep.equal({
        reviewScore: "3.5",
        numberOfReviews: "168"
      });
    }, done);
  });
});