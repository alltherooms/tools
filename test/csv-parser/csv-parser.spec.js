var CSVParser = require("../../csv-parser");
var fs = require("fs");

describe("CSVParser", function() {
  describe("Parsing with semicolon and quotes", function() {
    beforeEach(function() {
      this.csvParser = new CSVParser({
        sourceFilePath: __dirname + "/fixtures/source.csv",
        separator: ";",
        wrapper: "\""
      }, {
        id: "Id",
        name: "Name",
        location: ["Longitude", "Latitude"],
        minprice: "MinPrice",
        rating: {
          reviewScore: "HotelReviewScore",
          numberOfReviews: "HotelNumberReviews"
        }
      });
    });

    function forEachParsedObject(csvParser, fn, done) {
      csvParser.on("object", function(object, next) {
        fn(object);
        next();
      });
      csvParser.on("error", done);
      csvParser.on("end", done);
      csvParser.start();
    };

    it("emits each object with all the mapped fields", function(done) {
      var self = this;
      forEachParsedObject(this.csvParser, function(object) {
        expect(object).to.have.keys(Object.keys(self.csvParser.map));
      }, done);
    });

    it("emits each object with a valid location array", function(done) {
      forEachParsedObject(this.csvParser, function(object) {
        expect(object.location).to.be.an("array").and.to.have.length(2);
        expect(isNaN(parseFloat(object.location[0]))).to.be.false;
        expect(isNaN(parseFloat(object.location[1]))).to.be.false;
      }, done);
    });

    it("emits each object with a valid rating object", function(done) {
      var self = this;
      forEachParsedObject(this.csvParser, function(object) {
        expect(object.rating).to.be.an("object").and.to.have.keys(Object.keys(self.csvParser.map.rating));
        expect(parseFloat(object.rating.reviewScore)).to.be.a("number");
        expect(parseFloat(object.rating.numberOfReviews)).to.be.a("number");
      }, done);
    });

    it("properly sets the values of all fields", function(done) {
      var tested = false;
      forEachParsedObject(this.csvParser, function(object) {
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

  describe("Parsing with comma and quotes", function() {
    beforeEach(function() {
      this.csvParser = new CSVParser({
        sourceFilePath: __dirname + "/fixtures/source2.csv",
        separator: ",",
        wrapper: "\""
      }, {
        uid: 'Id',
        expediaUid: 'ExpediaId',
        name: 'Name',
        address: 'Address1',
        phone: 'Telephone',
        raw_city: 'City',
        raw_country: 'Country',
        description: 'Description',
        location: [
          'Longitude',
          'Latitude'
        ],
        stars: 'Star_rating',
        rating: 'Star_rating',
        number_of_reviews: 'Number_Reviews',
        thumbnail: 'ImageURL',
        dateless_deeplink: 'PropertyDetailsLink',
        raw_property_type: 'PropertyType',
        raw_amenities: '[Amenity{id|name|value}]'
      });
    });

    function forEachParsedObject(csvParser, fn, done) {
      csvParser.on("object", function(object, next) {
        if (!object.uid) return next();

        fn(object);
        next();
      });
      csvParser.on("error", done);
      csvParser.on("end", done);
      csvParser.start();
    };

    it("emits each object with all the mapped fields", function(done) {
      var self = this;
      forEachParsedObject(this.csvParser, function(object) {
        expect(object).to.have.keys(Object.keys(self.csvParser.map));
      }, done);
    });

    it("emits each object with a valid location array", function(done) {
      forEachParsedObject(this.csvParser, function(object) {
        expect(object.location).to.be.an("array").and.to.have.length(2);
        expect(isNaN(parseFloat(object.location[0]))).to.be.false;
        expect(isNaN(parseFloat(object.location[1]))).to.be.false;
      }, done);
    });

    it("emits each object with a valid rating", function(done) {
      var self = this;
      forEachParsedObject(this.csvParser, function(object) {
        expect(parseFloat(object.rating.numberOfReviews)).to.be.a("number");
      }, done);
    });

    it("properly sets the values of all fields", function(done) {
      var tested = false;
      forEachParsedObject(this.csvParser, function(object) {
        if (tested) return;
        tested = true;

        expect(object.uid).to.equal("626282");
        expect(object.name).to.equal('Holiday Keihäri');
        expect(object.location).to.deep.equal(["25.57059", "63.082969"]);
        expect(parseFloat(object.rating)).to.equal(3);
      }, done);
    });
  });
});