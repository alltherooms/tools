'use strict';

var netInterfaces = require('os').networkInterfaces();
var exec = require('child_process').exec;

// #isPrivateIP was borrowed from http://stackoverflow.com/a/13969691/638425 with minor modifications
function isPrivateIP (ip) {
  var parts = ip.split('.');
  if (parts[0] === '10' ||
    (parts[0] === '172' && (parseInt(parts[1], 10) >= 16 && parseInt(parts[1], 10) <= 31)) ||
    (parts[0] === '192' && parseInt(parts[1]) === 168)) {
    return true;
  }
  return false;
}

module.exports = {
  getPublicAddress: function () {
    var publicAddress;
    var ip;

    Object.keys(netInterfaces).forEach(function (key) {
      netInterfaces[key].forEach(function (_interface) {
        if (_interface.family === 'IPv4' && !_interface.internal) {
          ip = _interface.address;
          if (!isPrivateIP(ip) || process.env.NODE_ENV === 'development') {
            publicAddress = ip;
          }
        }
      });
    });

    return publicAddress;
  },

  getHostname: function (callback) {
    exec('hostname', function (error, stdout) {
      if (error) return callback(new Error('Could not retrieve a hostname'));
      callback(null, stdout.trim());
    });
  }
};
