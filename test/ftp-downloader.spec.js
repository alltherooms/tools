'use strict';

/*
 FTPDownloader test
 */

var execSync = require('child_process').execSync;
var fs = require('fs');
var path = require('path');
var FTPDownloader = require('../ftp-downloader');
var FTPServer = require('ftp-test-server');

describe('FTPDownloader', function () {
  var FTPRoot = 'tmp';
  var destinationPath = __dirname + '/downloads';

  function getLocalPath(aPath) {
    return path.join(__dirname, FTPRoot, aPath);
  }

  function download(files, expected, callback) {
    var ftpDownloader = new FTPDownloader({
      connect: FTPCredentials,
      files: files,
      destinationPath: destinationPath
    });

    ftpDownloader.downloadFiles(function (error) {
      if (error) return callback(error);
      fs.readdir(destinationPath, function (error, files) {
        expect(files).to.have.length(expected.length);
        expected.forEach(function (file) {
          expect(files).to.include(file);
        });

        callback();
      });
    });
  }

  var FTPCredentials = {
    host: 'localhost',
    port: 12345,
    user: 'foo',
    pass: 'bar',
    root: getLocalPath('')
  };
  FTPCredentials.password = FTPCredentials.pass;

  var server;

  beforeEach(function (done) {
    this.timeout(60000);
    execSync('mkdir -p ' + getLocalPath(''));

    server = new FTPServer();
    server.init(FTPCredentials);
    setTimeout(done, 500);
  });

  afterEach(function (done) {
    execSync('rm -rf ' + getLocalPath(''));
    execSync('rm -rf ' + destinationPath);
    server.stop();
    setTimeout(done, 10);
  });

  it('downloads the files providing strings', function (done) {
    fs.writeFileSync(getLocalPath('README'), 'test');
    fs.mkdirSync(getLocalPath('pub'));
    fs.writeFileSync(getLocalPath('pub/README'), 'test');

    download(
      ['README', 'pub/README'],
      ['README', 'README1'],
      done);
  });

  describe('regular expressions', function () {
    beforeEach(function () {
      fs.writeFileSync(getLocalPath('README'), 'test');
    });

    it('downloads a matched file', function (done) {
      download([/R\w{4}E/], ['README'], done);
    });

    it('downloads a matched file even when FTP has empty folders', function (done) {
      fs.mkdirSync(getLocalPath('pub'));
      download([/R\w{4}E/], ['README'], done);
    });

    it('downloads matched files in subfolder', function (done) {
      fs.mkdirSync(getLocalPath('pub'));
      fs.writeFileSync(getLocalPath('pub/README'), 'test');
      download([/R\w{4}E/], ['README', 'README1'], done);
    });
  });
});