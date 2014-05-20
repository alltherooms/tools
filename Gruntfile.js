var fs = require('fs');

module.exports = function (grunt) {
  grunt.initConfig({
    mochaTest: {
      options: {
        reporter: "spec",
        require: "./tests/support"
      },
      all: {src: ["./tests/http-downloader.js"]}
    }
  });

  grunt.loadNpmTasks('grunt-mocha-test');
};