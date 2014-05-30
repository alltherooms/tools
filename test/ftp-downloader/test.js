/*
FTPDownloader test
*/

var sh = require("execSync")
,   fs = require("fs")
,   FTPDownloader = require("../../ftp-downloader")
,   destinationPath = __dirname + "/downloads";

describe("FTPDownloader", function () {
  before(function () {
    sh.run("rm -rf " + destinationPath);
    sh.run("mkdir " + destinationPath);
  });

  it("Downloads the files providing strings", function (done) {
    this.timeout(60000);
    var ftpDownloader = new FTPDownloader({
      connect: {
        host: "ftp.mozilla.org",
        port: 21
      },
      files: ["README", "pub/README"],
      destinationPath: destinationPath
    });

    ftpDownloader.downloadFiles(function (error) {
      if (error) return done(error);
      expect(fs.existsSync(destinationPath + "/README")).to.be.true;
      expect(fs.existsSync(destinationPath + "/README1")).to.be.true;
      done();
    });
  });

  //TODO: Test passing files as regular expressions. Figure out how to setup an FTP server locally.

  after(function () {
    sh.run("rm -rf " + destinationPath);
  });
});