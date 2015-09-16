module.exports = {
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
      self.forEachAsync(array, each, done);
    });
  },

  /*
  * Escape special characters from a string in order to prepare it
  * for a regular expression.
  *
  * @param {String} - string
  *
  * Usage:
  *   new RegExp(escapeRegExp(userInput))
  *
  * See http://stackoverflow.com/a/6969486/638425
  */
  escapeRegExp: function (string) {
    return string.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  }
};