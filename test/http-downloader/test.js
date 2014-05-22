var HTTPDownloader = require("../../http-downloader")
,   Downloader = require("../../downloader");

describe("HTTPDownloader", function () {
  describe("#constructor", function () {
    it("is a Downloader", function () {
      var http = new HTTPDownloader({
        connect: {
          host: "http://foo.bar"
        },
        files: ['foo.bar']
      });
      expect(http).to.be.an.instanceof(Downloader);
    });
  });
});