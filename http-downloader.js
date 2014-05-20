/*
  Download all files from an HTTP location that provides a directory
  listing page in the given connect.url

  Usage:

  var httpDownloader = new HTTPDownloader({
    connect: {
      url: "http://foo.bar",
      user: "foo",
      password: "bar"
    },
    files: "foo_*.bar" // wildcard file match string. Will download foo_1.bar and foo_.bar if exist.
  });

  httpDownloader.downloadFiles(function(error) {
    if (error) {
      // Handle error
    } else {
      // Download complete
    }
  });

*/

module.exports = HTTPDownloader

var Downloader = require("./downloader")
,   util = require('util')
,   exec = require('child_process').exec;

function HTTPDownloader (options) {
  Downloader.apply(this, Array.prototype.slice.call(arguments));
}

util.inherits(HTTPDownloader, Downloader);

HTTPDownloader.prototype.downloadFiles = function (callback) {
  var options = this.options;
  var wgetOptions = [
    " -r -np -nd",
    " -A " + options.files,
    " --http-user=" + options.connect.user,
    " --http-password=" + options.connect.password,
    " -P " + options.destinationPath
  ].join("");

  exec("wget" + wgetOptions + " " + options.connect.host, callback);
};