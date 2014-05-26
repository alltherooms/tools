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

util.inherits(HTTPDownloader, Downloader);

function HTTPDownloader (options) {
  Downloader.apply(this, Array.prototype.slice.call(arguments));
};

HTTPDownloader.prototype.downloadFiles = function (callback) {
  var options = this.options;
  var wgetOptions = [
    " -r -np -nd -q",
    " -A " + options.files,
    " --http-user=" + options.connect.user,
    " --http-password=" + options.connect.password,
    " -P " + options.destinationPath
  ].join("");

  var proc = exec("wget" + wgetOptions + " " + options.connect.host);
  proc.on('close', function (code, signal) {
    switch (code) {
      case 0:
      case 8: // 404 errors
        callback();
        break;
      default:
        var message = "Wget failed";
        if (code) {
          message += " with code " + code;
        }
        callback(new Error(message));
    }
  });

};