#Usage

Require the `tools` module and access to any tools.

```js
var tools = require('tools');
var miles = tools.geo.getDistanceInMiles([lng1, lat1], [lng2, lat2]);
console.log(miles);
```

Or simply require the tool you need.
```js
var geo = require('tools/geo');
var miles = geo.getDistanceInMiles([lng1, lat1], [lng2, lat2]);
console.dir(miles);
```

#Available tools

##utils
Set of useful functions.<br/>
Available at: `tools.utils` <br/>
See: `tools/utils.js` for available functions and documentation.

##geo
Set of useful functions to perform geographical calculations.<br/>
Available at: `tools.geo` <br/>
See: `tools/geo.js` for available functions and documentation.

##FTPDownloader
Connects to a specific ftp server and downloads the indicated files.<br/>
Available at: `tools.FTPDownloader` <br/>
See: `tools/ftp-downloader.js` for usage and documentation.

##CSVParser
Get's a csv file path and a mapping object, then emits an object for each line of the file with the format specified in the mapping.<br/>
Available at: `tools.CSVParser`<br/>
See: `tools/csv-parser.js` for usage and documentation.