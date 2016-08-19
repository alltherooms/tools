module.exports = {
  //converts the given `degress` and returns the value in radians
  degreesToRadians: function (degrees) {
    return degrees * (Math.PI / 180);
  },

  //Given a pair of coordiantes A and B with the format [lng, lat], returns the distance in miles beetween A and B.
  getDistanceInMiles: function (A, B) {
    var r = 3963.1676 //Earth radius in miles
    var dLat = this.degreesToRadians(B[1]-A[1]);
    var dLng = this.degreesToRadians(B[0]-A[0]);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(A[1])) * Math.cos(this.degreesToRadians(B[1])) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);

    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = r * c; //Distance in miles

    return d;
  },

  //Given a segmet A-B, with the following format [x1, y1]-[x2, y2], returns the middle point of the segment.
  getSegmentMiddlePoint: function (A, B) {
    return [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
  },

  //Given an array [], with the following format [[x1, y1], [x2, y2]], returns the centroid of the multipoint.
  getCentroidFromMultiPoint: function (multiPoint) {
    var sumX = 0;
    var sumY = 0;
    var centroid = [];
    for (var i = 0; i < multiPoint.length; i++) {
      var point = multiPoint[i];
      sumX += parseFloat(point[0]);
      sumY += parseFloat(point[1]);
      centroid[0] = sumX / multiPoint.length;
      centroid[1] = sumY / multiPoint.length;
    }

    return centroid;
  },

  /*
  Given a pair of coordiantes `geoPoint` with the format [lng, lat] and a distance in miles to any corner,
  returns an object in the following format:
  {
    swLat: Number -> Southwest latitude
    swLng: Number -> Southwest longitude
    neLat: Number -> Northeast latitude
    neLng: Number -> Northeast longitude
    seLat: Number -> Southeast latitude
    seLng: Number -> Southeast longitude
    nwLat: Number -> Nortwest latitude
    nwLng: Number -> Nortwest longitude
  }
  */
  getLatLngBounds: function (geoPoint, miles) {
    var bounds = {
      swLat: null,
      swLng: null,
      neLat: null,
      neLng: null,
      seLat: null,
      seLng: null,
      nwLat: null,
      nwLng: null
    };

    var lng = parseFloat(geoPoint[0]);
    var lat = parseFloat(geoPoint[1]);
    var r = miles / 69.11; //Distance in degrees
    var c = Math.cos(45 * (Math.PI / 180)); //Cosine(45 degrees)
    var s = Math.sin(45 * (Math.PI / 180)); //Sine(45 degrees)

    bounds.swLat = bounds.seLat = lat - r * s;
    bounds.swLng = bounds.nwLng = lng - r * c;

    bounds.neLat = bounds.nwLat = lat + r * s;
    bounds.neLng = bounds.seLng = lng + r * c;

    return bounds;
  },

  /*
  Given a set of latLngBouds, (see function above)
  returns a mongdb-ready polygon suitable for geo-spatial queries;
  see: http://docs.mongodb.org/manual/reference/glossary/#term-polygon
  */
  buildBox: function (latLngBounds) {
    var b = latLngBounds;
    return [[[b.nwLng, b.nwLat], [b.neLng, b.neLat], [b.seLng, b.seLat], [b.swLng, b.swLat], [b.nwLng, b.nwLat]]];
  },

  /*
  Returns true if the given point is inside the given box
  params:
    point: [lng, lat]
    box: mongdb-ready polygon, see: http://docs.mongodb.org/manual/reference/glossary/#term-polygon
  */
  isPointInsideBox: function (point, box) {
    boxSw = box[0][3];
    boxNe = box[0][1];
    return (point[0] >= boxSw[0] && point[0] <= boxNe[0] && point[1] >= boxSw[1] && point[1] <= boxNe[1]);
  },

  //Returns the center point of a given mongdb-ready polygon (see two functions above)
  getGridBoxCenter: function (box) {
    ne = box[0][1];
    sw = box[0][3];
    return [((sw[0] + ne[0]) / 2), ((sw[1] + ne[1]) / 2)];
  },

  /*
  Returns the grid boxes of a wrapper box
  params:
    sw -> [lng, lat] South west coordinate of wrapper box
    ne -> [lng, lat] North east coordinate of wrapper box
    bdx -> Float. Grid box distance in x axis relative to wrapper box
    bdy -> Float. Grid box distance in y axis to wrapper box
  */
  getGridBoxes: function (sw, ne, bdx, bdy) {
    var dx = ne[0] - sw[0]; //Distance in x axis
    var dy = ne[1] - sw[1]; //Distance in y axis

    var cols = Math.floor(dx / bdx); //Grid number of columns
    var rows = Math.floor(dy / bdy); //Grid number of rows

    var bdx = dx / cols;
    var bdy = dy / rows;

    var gridBoxes = [];
    for(var c = 1; c <= cols; c++){
      var neLng = seLng = sw[0] + (bdx * c);
      var swLng = nwLng = neLng - bdx;
      for(var r = 1; r <= rows; r++){
        neLat = nwLat = sw[1] + (bdy * r);
        swLat = seLat = neLat - bdy;
        gridBoxes.push([[[nwLng, nwLat], [neLng, neLat], [seLng, seLat], [swLng, swLat], [nwLng, nwLat]]]);
      }
    };

    return gridBoxes;
  },

  /*
  Given a pair of southwest `sw` and northeast `ne` coordinates,
  returns a mongdb-ready polygon
  */
  getBox: function (sw, ne) {
    se = [ne[0], sw[1]];
    nw = [sw[0], ne[1]];
    return [[nw, ne, se, sw, nw]];
  }
};