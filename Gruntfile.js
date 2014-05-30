var fs = require('fs');

module.exports = function (grunt) {
  grunt.initConfig({
    mochaTest: {
      options: {
        reporter: "spec",
        require: "./test/support"
      },
      all: {src: ["./test/**/*.js"]},
      HttpDownloader: {src: "./test/http-downloader/test.js"},
      FTPDownloader: {src: "./test/ftp-downloader/test.js"},
      CSVParser: {src: "./test/csv-parser/test.js"},
      geo: {src: "./test/geo/test.js"},
      throttler: {src: "./test/throttler/test.js"}
    }
  });

  grunt.loadNpmTasks('grunt-mocha-test');
};