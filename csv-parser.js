/*
usage:
  var config = {
    sourceFilePath: String //Absolute path of the file that will be parsed
    encoding: String //Default "utf8" //Source file encoding
    lineTerminator: String //Default "\n"
    separator: String //Default: "," //Indicates the character that separates the values
    wrapper: String //Default: null //Indicates the character that wraps the values
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

var EventEmitter = require("events").EventEmitter
,   lineReader = require("line-reader")
,   fs = require("fs")
,   util = require("util");

util.inherits(CSVParser, EventEmitter);

function CSVParser (config, map) {
  this.config = {
    sourceFilePath: "",
    encoding: "utf8",
    lineTerminator: "\n",
    separator: ",",
    wrapper: null
  };

  util._extend(this.config, config);

  if (this.config.wrapper) this.wrapperRegExp = new RegExp(this.config.wrapper, "g");
  if (!map) throw new Error("map cant be undefined");
};

CSVParser.prototype.method_name = function() {
  var self = this;
  if (!fs.existsSync(this.config.sourceFilePath))
    return this.emit("error", new Error("Unable to open file: " + this.config.sourceFilePath + ". It doesn't exist."))

  function handleFileOpen (reader) {
    self.reader = reader;
    var fields = null;

    function readNextLine () {
      if (!self.reader.hasNextLine()) return self.end();
      self.reader.nextLine(function (line) {
        try {
          if (!fields) {
            fields = line.split(self.config.separator);
            for (var i = 0; i < fields.length; i++) {
              fields[i] = field.trim()
              if (wrapperRegExp) fields[i] = fields[i].replace(this.wrapperRegExp, "");
            };
            readNextLine();
          } else {
            var object = {};
            var cols = line.split(this.config.separator);
            for (var i = 0; i < cols.length; i++) {
              cols[i] = col.trim()
              if (this.wrapperRegExp) cols[i] = cols[i].replace(this.wrapperRegExp, "");
            };

            function setKey (map, object, key) {
              var matcher = map[key];
              var _field = null;

              if (typeof matcher == "object" && !(matcher instanceof RegExp))
                object[key] = Array.isArray(matcher) ? [] : {};
                var _keys = Object.keys(matcher);
                for (var i = 0; i < _keys.length; i++) {
                  setKey(matcher, object[key], _keys[i]);
                };
                return;

              if (typeof matcher == "string") {
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

            self.emit("object", object, function (error){
              if (error) return this.end(error);
              readNextLine();
            });
          };
        } catch (e) {
          self.reader.close();
          self.emit("error", e);
        };
      });
    };
    readNextLine();
  };

  lineReader.open(this.config.sourceFilePath, handleFileOpen, this.config.lineTerminator, this.config.encoding);
};

CSVParser.prototype.end = function(error) {
  if (this.reader) this.reader.close();
  this.emit("end", error);
};