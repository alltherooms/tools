var geo = require("../geo");

describe("geo", function () {

  var latLngBounds, box, sw, ne;

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
      expect(geo.getDistanceInMiles(A, B)).to.closeTo(2386.3299554, 0.0000001);
    });
  });

  describe("#getSegmentMiddlePoint", function () {
    it("returns the middle point of the given segment A-B", function () {
      expect(geo.getSegmentMiddlePoint([0, 1], [10, 20])).to.deep.equal([5, 10.5]);
    });
  });

  describe("#getCentroidFromMultiPoint", function () {
    it("returns the centroid of the given multipoint", function () {
      expect(geo.getCentroidFromMultiPoint([[-1, 0], [-1, 2], [-1, 3], [-1, 4], [-1, 7], [0, 1], [0, 3], [1, 1], [2, 0], [6, 0], [7, 8], [9, 8], [10, 6]]))
        .to.deep.equal([2.3076923076923075, 3.3076923076923075]);
    });
  });

  describe("#getLatLngBounds", function () {
    it("returns the latitude longitude bounds, given a point and it's distance in miles to any corner", function () {
      latLngBounds = geo.getLatLngBounds([-73.9780035, 40.7056308], 10);
      expect(latLngBounds).to.deep.equal({
        neLat: 40.80794693097765,
        neLng: -73.87568736902234,
        nwLat: 40.80794693097765,
        nwLng: -74.08031963097766,
        seLat: 40.60331466902235,
        seLng: -73.87568736902234,
        swLat: 40.60331466902235,
        swLng: -74.08031963097766
      });
    });
  });

  describe("#buildBox", function () {
    it("returns a mongodb-ready polygon given a set of latLngBounds", function () {
      box = geo.buildBox(latLngBounds);
      expect(box).to.deep.equal([[
        [-74.08031963097766, 40.80794693097765],
        [-73.87568736902234, 40.80794693097765],
        [-73.87568736902234, 40.60331466902235],
        [-74.08031963097766, 40.60331466902235],
        [-74.08031963097766, 40.80794693097765]
      ]]);
    });
  });

  describe("#getGridBoxCenter", function () {
    it("returns the center point of the given box", function () {
      expect(geo.getGridBoxCenter(box)).to.deep.equal([-73.9780035, 40.7056308]);
    });
  });

  describe("#isPointInsideBox", function () {
    it("returns true given a point inside the box", function () {
      expect(geo.isPointInsideBox([-74, 40.7], box)).to.be.true;
    });
    it("returns false given a point otuside the box", function () {
      expect(geo.isPointInsideBox([-73, 40], box)).to.be.false;
    });
  });

  describe("#getGridBoxes", function () {
    it("returns the grid boxes of the given wrapper box (sw and ne coordinates)", function () {
      sw = [latLngBounds.swLng, latLngBounds.swLat];
      ne = [latLngBounds.neLng, latLngBounds.neLat];
      expect(geo.getGridBoxes(sw, ne, 0.1, 0.1)[0]).to.deep.equal([[
        [-74.08031963097766,40.7056308],
        [-73.9780035, 40.7056308],
        [-73.9780035, 40.60331466902235],
        [-74.08031963097766, 40.60331466902235],
        [-74.08031963097766, 40.7056308]
      ]]);
    });
  });

  describe("#getBox", function () {
    it("returns a mongodb-ready polygon, given a a pair of sw and ne coordiantes", function () {
      expect(geo.getBox(sw, ne)).to.deep.equal([[
        [-74.08031963097766, 40.80794693097765],
        [-73.87568736902234, 40.80794693097765],
        [-73.87568736902234, 40.60331466902235],
        [-74.08031963097766, 40.60331466902235],
        [-74.08031963097766, 40.80794693097765]
      ]]);
    });
  });
});