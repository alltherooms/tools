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
      CSVParser: {src: "./test/csv-parser/test.js"},
      geo: {src: "./test/geo/test.js"}
    }
  });

  grunt.loadNpmTasks('grunt-mocha-test');
};