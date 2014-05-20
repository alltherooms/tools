/*
usage:
  var ftpDownloader = new FTPDownloader({
    connect: Object #Refer to https://github.com/mscdex/node-ftp#methods for 'connect' configuration docs.
    files: [String/RegExp]
      #If Regular Expressions are provided, the downloader will run a 'list' to lookup for the files which full path matches the RegExp and then run a 'get' for each file.
      #If Strings are provided, the downloader will run a 'get' command for each file.
      #Both, Regular Expressions and Strings can be provided to the same FTPDownloader instance.
    destinationPath: String #Absolute path where to save the downloaded files.
  })
  ftpDownloader.downloadFiles(function (errors) {
    if (errors) {
      //Handle errors
    } else {
      //Download completed
    }
  });
*/

module.exports = FTPDownloader;

var util = require('util')
,   fs = require('fs')
,   FTPClient = require('ftp');

function FTPDownloader (options) {
  this.options = {
    connect: {},
    files: [],
    destinationPath: 'donwloads/'
  };

  util._extend(this.options, options);

  if (!this.options.connect.host) throw new Error("A host must be specified in the 'connect' option");
  if (!this.options.files.length) throw new Error("'files' can't be an empty array");

  if (this.options.destinationPath.lastIndexOf("/") !== this.options.destinationPath.length - 1)
    this.options.destinationPath = this.options.destinationPath + "/";

  if (!fs.existsSync(this.options.destinationPath)) fs.mkdirSync(this.options.destinationPath);

  this.ftpClient = new FTPClient();
};

/*
Returns the fileName of a given filePath.
this.getFileName('/path/to/file.txt') //returns 'file.txt'
*/
FTPDownloader.prototype.getFileName = function(filePath) {
  return filePath ? filepath.substring(filePath.lastIndexOf('/') + 1) : null;
};

/*
Returns a safe destination path for the given filePath
*/
FTPDownloader.prototype.getSafeDestinationFilePath = function(filePath) {
  var destinationFilePath;
  var safeDestinationFilePath;

  destinationFilePath = safeDestinationFilePath = this.options.destinationPath + this.getFileName(filePath);

  var i = 1
  while (fs.existsSync(safeDestinationFilePath)) {
    safeDestinationFilePath = destinationFilePath.substring(0, destinationFilePath.lastIndexOf(".")) + i +
      destinationFilePath.substring(destinationFilePath.lastIndexOf("."));
    i++;
  };

  return safeDestinationFilePath;
};

FTPDownloader.prototype.downloadFile = function(filePath, callback) {
  var destinationFilePath = this.getSafeDestinationFilePath(filePath);
  this.ftpClient.get(filePath, function (error, readStream) {
    if (error) {
      if (error.message != "Unable to make data connection")
        if (callback) callback(error);
      return;
    };

    if (!readStream) {
      if (callback) callback(new Error("Unable to get file " + filePath + ". Internal server error"));
      return;
    };

    readStream.pipe(fs.createWriteStream(destinationFilePath));
    readStream.on('error', callback);
    readStream.on('end', callback);
  });
};

/*
Downloads the secified files. Execute callback when done, sending an error if any.
*/
FTPDownloader.prototype.downloadFiles = function (callback) {
    var self = this;

    var handleError = function (error) {
      self.ftpClient.destroy();
      if (callback) callback(error);
    };

    this.ftpClient.on('ready', function(){
      utils.forEachAsync(
        self.options.files,
        function (file, nextFile) {
          if (typeof file === "string") {
            self.downloadFile(file, function(error){
              if (error) return nextFile(error);
              nextFile();
            });
          } else if (file instanceof RegExp) {
            var allPaths = [];
            var lookupFiles = function (directory) {
              if (!directory) directory = "./";

              allPaths.splice(allPaths.indexOf(directory), 1);

              if (directory.lastIndexOf("/") != directory.length - 1)
                directory = directory + "/";

              self.ftpClient.list(directory, function (error, paths) {
                if (!(paths && paths.length)) return;
                utils.forEachAsync(
                  paths,
                  function (path, nextPath) {//For each path
                    if (path.type == "-") {//File
                      var filePath = "#{directory}#{path.name}";
                      if (file.test(filePath)) {
                        self.downloadFile(filePath, function (error) {
                          nextPath(error);
                        });
                      } else {
                        nextPath();
                      };
                    } else if (path.type == "d") {
                      if (path.name !== "." && path.name != "..") //Directory
                        allPaths.push(directory + path.name);
                      nextPath();
                    };
                  },
                  function (error) {//Done with paths
                    if (error) return handleError(error);
                    if (allPaths.length) lookupFiles(allPaths[0]);
                    else nextFile();
                  }
                );
              });
            };
            lookupFiles();
          };
        },
        function (error) {
          if (error) return handleError(error);
          self.ftpClient.destroy();
          if (callback) callback();
        }
      );
    });

    this.ftpClient.on('error', callback);
    this.ftpClient.connect(this.options.connect);
};