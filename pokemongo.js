"use strict";

var pokemongo = module.exports;

pokemongo.calculatePokeTiles = function (centroid) {
  var centerLng = centroid[0];
  var centerLat = centroid[1];
  var resolution = 10000;
  var factor = 0.1 / resolution;

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