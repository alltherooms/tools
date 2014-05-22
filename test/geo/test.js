var geo = require("../../geo");

describe("geo", function () {

  describe("#degreesToRadians", function () {
    it("behaves well given 0 radians", function () {
      expect(geo.degreesToRadians(0)).to.equal(0);
    });
    it("behaves well given negative radians", function () {
      expect(parseFloat(geo.degreesToRadians(-90).toFixed(8))).to.equal(-1.57079633);
    });
    it("behaves well given positive radians", function () {
      expect(parseFloat(geo.degreesToRadians(45).toFixed(8))).to.equal(0.78539816);
    });
  });

  describe("#getDistanceInMiles", function () {
    it("calculates the distance in miles of the given A and B arguments", function () {
      var A = [-73.9780035, 40.7056308]
      ,   B = [-75.57513699999998, 6.235925];
      expect(geo.getDistanceInMiles(A, B)).to.equal(2386.3299554467803);
    });
  });

  //TODO: Complete...
});