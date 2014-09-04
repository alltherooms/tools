var heapdump = require("heapdump")
,   Throttler = require("../../throttler")
,   throttler = new Throttler()
,   loadThrottler;


loadThrottler = function () {
  var bigArray = [];
  for (var j = 0; j < 1000; j++) {
    bigArray.push(new Array(10000).join("."));
  };
  throttler.add(function (next) {
    if (bigArray.length) {
      setTimeout(function () {
        next();
      }, 0);
    }
  });
};

throttler.concurrency = 50;
throttler.executionsPerRound = 50;
throttler.roundMinutes = 1 / 1000;

heapdump.writeSnapshot(__dirname + "/start.heapsnapshot", function () {
  console.log("wrote start snapshot");

  for (var i = 0; i < 100; i++) {
    loadThrottler();
  };

  throttler.on("finish", function () {
    process.nextTick(function () {
      gc();
      heapdump.writeSnapshot(__dirname + "/end.heapsnapshot", function () {
        console.log("wrote end snapshot");
      });
    });
  });

  throttler.on("error", function (error) {
    console.error(error.stack);
  });

  throttler.run();
});