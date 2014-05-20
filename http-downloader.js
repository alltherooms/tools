module.exports = HTTPDownloader

var Downloader = require("downloader")
,   util = require('util');

function HTTPDownloader (options) {
  Downloader.apply(this, Array.prototype.slice.call(arguments));
}

util.inherits(HTTPDownloader, Downloader);