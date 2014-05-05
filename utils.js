module.exports = {
  /*
  Extends the given objects
  */
  extend: function (a, b) {
    for (var x in b) {
      a[x] = b[x];
    };
  },

  /*
  Usage:
  var array = [1, 2, 3, 4, 5];
  forEachAsync(
    array,
    function (number, next) {//Executes for each number
      performAsyncOperation(number, function(error) {
        next(error)
      });
    },
    function (error){//Executes for each number
      if(error)
        //handle error
      else
        //succeded
    }
  );
  */
  forEachAsync: function (array, each, done) {
    var self = this;
    if (undefined === (item = array.shift())) return done();
    each(item, function (error) {
      if (error) return done(error);
      self.forEachAsync(each, done);
    });
  }
};