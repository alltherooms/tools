/*
Throttler test
*/

var Throttler = require("../../throttler");

describe("throttler", function () {

  beforeEach(function () {
    this.throttler = new Throttler();
    this.functions = [];
    for (var i = 0; i < 10; i++) {
      var fn = function (done) {
        setTimeout(done, 100);
      };
      spyFn = spy(fn);
      this.functions.push(spyFn);
      this.throttler.add(spyFn);
    };
  });

  it("executes all functions", function (done) {
    var self = this;

    this.throttler.on("error", done);

    this.throttler.on("finish", function (error) {
      for (var i = 0; i < self.functions.length; i++) {
        expect(self.functions[i]).to.have.been.called.once;
      };
      done();
    });

    this.throttler.run();
  });

  describe("concurrency", function () {
    beforeEach(function () {
      this.throttler.concurrency = 5;
    });

    it("executes a maximum of 5 functions concurrently", function (done) {
      var self = this;
      this.throttler.on("error", done);
      this.throttler.run();

      for (var i = 0; i < this.functions.length; i++) {
        if (i < 5) {
          expect(this.functions[i]).to.have.been.called.once;
        } else {
          expect(this.functions[i]).to.not.have.been.called();
        };
      };

      setTimeout(function () {
        for (var i = 5; i < self.functions.length; i++) {
          expect(self.functions[i]).to.have.been.called.once;
        };
        done();
      }, 100);
    });
  });

  describe("concurrency + time", function () {
    beforeEach(function () {
      this.throttler.concurrency = 4;
      this.throttler.executionsPerRound = 5;
      this.throttler.roundMinutes = 1 / 2 / 60; //half a second
    });

    it("executes a maxmimum of 5 functions (4 concurrent) every 0.5 seconds", function (done) {
      var self = this;
      this.throttler.on("error", done);
      this.throttler.run();

      for (var i = 0; i < this.functions.length; i++) {
        if (i < 4) {
          expect(this.functions[i]).to.have.been.called.once;
        } else {
          expect(this.functions[i]).to.not.have.been.called();
        };
      };

      setTimeout(function () {
        expect(self.functions[4]).to.have.been.called.once;
        for (var i = 5; i < self.functions.length; i++) {
          expect(self.functions[i]).to.not.have.been.called();
        };
      }, 100);

      setTimeout(function () { //It isn't time for the next round yet
        for (var i = 5; i < self.functions.length; i++) {
          expect(self.functions[i]).to.not.have.been.called();
        };
      }, 450);

      setTimeout(function () { //It's now time for the next round!
        for (var i = 5; i < self.functions.length; i++) {
          if (i < 9) {
            expect(self.functions[i]).to.have.been.called.once;
          } else {
            expect(self.functions[i]).to.not.have.been.called();
          };
        };
        setTimeout(function () {
          expect(self.functions[9]).to.have.been.called.once;
          done();
        }, 100);
      }, 510);

    });
  });

  describe("stop executions", function () {
    beforeEach(function () {
      this.throttler.concurrency = 1;

      // Set defaults
      this.throttler.executionsPerRound = null;
      this.throttler.roundMinutes = null;

      // Set fresh functions
      this.functions = [];
      for (var i = 0; i < 10; i++) {
        var fn = function (done) {
          setTimeout(done, 100);
        };
        spyFn = spy(fn);
        this.functions.push(spyFn);
        this.throttler.add(spyFn);
      };
    });

    it("doesn't call the last function", function (done) {
      var self = this;

      this.throttler.on("error", done);

      this.throttler.on("finish", function (error) {
        expect(self.functions.pop()).to.not.have.been.called;
        done();
      });

      this.throttler.run();

      setTimeout(function () {
        self.throttler.stop();
      }, 1500); // Aprox. 5 functions will be called
    });
  });
});