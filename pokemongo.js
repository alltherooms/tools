"use strict";

var pokemongo = module.exports;

pokemongo.constants = {
  RESOLUTION: 100000,
  FACTOR: 1 / 100000
};

pokemongo.calculatePokeTiles = function (centroid) {
  var centerLng = centroid[0];
  var centerLat = centroid[1];
  var resolution = this.constants.RESOLUTION;
  var factor = this.constants.FACTOR;

  var centerPokeTile = {
    sw: [
      Math.floor(centerLng * resolution)/resolution,
      Math.floor(centerLat * resolution)/resolution
    ]
  };

  return [
    {sw: [(centerPokeTile.sw[0] - factor), (centerPokeTile.sw[1] + factor)]},
    {sw: [(centerPokeTile.sw[0]         ), (centerPokeTile.sw[1] + factor)]},
    {sw: [(centerPokeTile.sw[0] + factor), (centerPokeTile.sw[1] + factor)]},

    {sw: [(centerPokeTile.sw[0] - factor), (centerPokeTile.sw[1]         )]},
    {sw: [(centerPokeTile.sw[0]         ), (centerPokeTile.sw[1]         )]},
    {sw: [(centerPokeTile.sw[0] + factor), (centerPokeTile.sw[1]         )]},

    {sw: [(centerPokeTile.sw[0] - factor), (centerPokeTile.sw[1] - factor)]},
    {sw: [(centerPokeTile.sw[0]         ), (centerPokeTile.sw[1] - factor)]},
    {sw: [(centerPokeTile.sw[0] + factor), (centerPokeTile.sw[1] - factor)]}
  ];
};

pokemongo.calculateMiddlePoint = function (pokeTile) {
  var swLng = pokeTile.sw[0];
  var swLat = pokeTile.sw[1];
  var neLng = swLng + this.constants.FACTOR;
  var neLat = swLat + this.constants.FACTOR;

  return [
    (swLng + neLng) / 2,
    (swLat + neLat) / 2
  ];
};