module.exports = Downloader

var utils = require('./utils');
var fs = require('fs');

function Downloader (options) {
  this.options = {
    connect: {},
    files: [],
    destinationPath: 'donwloads/'
  };

  utils.extend(this.options, options);

  if (!this.options.connect.host) throw new Error("A host must be specified in the 'connect' option");
  if (!this.options.files.length) throw new Error("'files' can't be an empty array");

  if (this.options.destinationPath.lastIndexOf("/") !== this.options.destinationPath.length - 1)
    this.options.destinationPath = this.options.destinationPath + "/";

  if (!fs.existsSync(this.options.destinationPath)) fs.mkdirSync(this.options.destinationPath);
}