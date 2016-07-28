"use strict";

var pokemongo = module.exports;

pokemongo.calculatePokeTiles = function (centerLatLng) {
  var centerLng = centerLatLng[0];
  var centerLat = centerLatLng[1];
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