module.exports = function(grunt) {
  grunt.initConfig({
    mochaTest: {
      options: {
        reporter: "spec",
        require: "./test/support"
      },
      HttpDownloader: { src: "./test/http-downloader/test.js" },
      FTPDownloader: { src: "./test/ftp-downloader/test.js" },
      CSVParser: { src: "./test/csv-parser/test.js" },
      geo: { src: "./test/geo/test.js" },
      Throttler: { src: "./test/throttler/test.js" },
      SocketDataParser: { src: "./test/socket-data-parser/test.js" },
      Utils: { src: "./test/utils/test.js" }
    }
  });

  grunt.loadNpmTasks('grunt-mocha-test');
};