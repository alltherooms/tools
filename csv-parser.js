/*
usage:
  var config = {
    sourceFilePath: String //Absolute path of the file that will be parsed
    encoding: String //Default "utf8" //Source file encoding
    lineTerminator: String //Default "\n"
    separator: String //Default: "," //Indicates the character that separates the values
    wrapper: String //Default: null //Indicates the character that wraps the values
    escapeChar: String //Default: null //Indicates the escape character for values inside the wrapper. e.g: "This is a wrapped value with \"escaped quoutes\""
  }
  var map = {
    key: String/RegExp/Function
  }//Describes the mapping of the keys and values that will be assigned to every object for each parser file. See section "Mapping example"

  var csvParser = new CSVParser(config, map);

  //Events
  csvParser.on('object', function (object, next) {
    //Process object
    next();//Parse next object
    //Optionally call next(error); to end stream sending the error
  })

  csvParser.on('error', function (error) {
    //Handle error
    csvParser.end(error); //Optionaly, end stream sending the error
  });

  csvParser.on('end', function (error) {
    if (error)
      //Handle error
    else
      //Finished parsing
  });

  //Start the stream
  csvParser.start()

  //Mapping example
  {
    id: "HotelId", //Matches the field "HotelId"
    name: /HotelName/, //Matches any field containing "HotelName"
    checkIn: function (fields) { //Gets al fields as argument, and returns the field that best matches; in this case, the "CheckInHour" field
      for (var i = 0; i < fields.length; i++) {
        if (fields[i] is "CheckInHour") return fields[i];
      };
    },
    location: [
      "Longitude", //Sets object.location[0] to the value of "Longitude",
      "Latitude" //and object.location[1] to the value of "Latitude"
    ],
    address: {
      city: "AddressCity", //Sets object.address.city to the value of "AddressCity",
      zip: "AddressZip" //and object.address.zip to the value of "AddressZip"
    }
  }
*/

module.exports = CSVParser;

var EventEmitter = require("events").EventEmitter;
var lineReader = require("line-reader");
var util = require("util");

util.inherits(CSVParser, EventEmitter);

function CSVParser(config, map) {
  this.config = {
    sourceFilePath: "",
    encoding: "utf8",
    lineTerminator: "\n",
    separator: ",",
    wrapper: null,
    escapeChar: "\\"
  };

  util._extend(this.config, config);

  if (!map) throw new Error("map cant be undefined");

  this.map = map;
};

CSVParser.prototype.split = function(line) {
  var parts = [];
  var part = "";
  var separator = this.config.separator;
  var wrapper = this.config.wrapper;
  var escapeChar = this.config.escapeChar;
  var insideWrapper = false;

  line = line.replace(/\\""|\\''/g, "");

  for (var i = 0, l = line.length; i < l; i++) {
    if (insideWrapper) {
      if (wrapper && line[i] == wrapper) {
        insideWrapper = false;
      } else {
        if (line[i] == escapeChar) i++;
        part += line[i];
      };
    } else {
      if (wrapper && line[i] == wrapper) {
        insideWrapper = true;
      } else if (line[i] == separator) {
        parts.push(part);
        part = "";
      } else {
        part += line[i];
      };
    };
  };
  parts.push(part);

  return parts;
};

CSVParser.prototype.start = function() {
  var self = this;

  function handleFileOpen(error, reader) {
    if (error) {
      return this.emit("error", new Error("Unable to open file: " + this.config.sourceFilePath + ". It doesn't exist."))
    }

    self.reader = reader;
    var fields = null;

    function readNextLine() {
      if (!self.reader.hasNextLine()) return self.end();
      self.reader.nextLine(function(error, line) {
        try {
          if (!fields) {
            fields = self.split(line);
            for (var i = 0, l = fields.length; i < l; i++) {
              fields[i] = fields[i].trim();
            };
            readNextLine();
          } else {
            var object = {};
            var cols = self.split(line);
            for (var i = 0, l = cols.length; i < l; i++) {
              cols[i] = cols[i].trim();
            };

            function setKey(map, object, key) {
              var matcher = map[key];
              var _field = null;

              if (typeof matcher == "object" && !(matcher instanceof RegExp)) {
                object[key] = Array.isArray(matcher) ? [] : {};
                var _keys = Object.keys(matcher);
                for (var i = 0; i < _keys.length; i++) {
                  setKey(matcher, object[key], _keys[i]);
                };
              } else if (typeof matcher == "string") {
                _field = matcher;
              } else if (typeof matcher == "function") {
                _field = matcher(fields);
              } else if (matcher instanceof RegExp) {
                for (var i = 0; i < fields.length; i++) {
                  if (matcher.test(fields[i])) {
                    _field = fields[i];
                    break;
                  };
                };
              };

              if (_field) object[key] = cols[fields.indexOf(_field)];
            };

            keys = Object.keys(self.map);
            for (var i = 0; i < keys.length; i++) {
              setKey(self.map, object, keys[i]);
            };

            self.emit("object", object, function(error) {
              if (error) return self.end(error);
              readNextLine();
            });
          };
        } catch (e) {
          self.end(e);
        };
      });
    };
    readNextLine();
  };

  const options = {
    separator: this.config.lineTerminator,
    encoding: this.config.encoding
  };

  lineReader.open(this.config.sourceFilePath, options, handleFileOpen);
};

CSVParser.prototype.end = function(error) {
  const handler = (readerError) => {
    error = error || readerError;

    if (error) {
      this.emit('error', error);
    } else {
      this.emit('end');
    }
  };

  if (this.reader) {
    this.reader.close(handler);
  } else {
    handler(error);
  }
};