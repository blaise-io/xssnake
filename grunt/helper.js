'use strict';
var fs = require('fs');

exports.replaceStrict = function(src, filepath) {
    return '// ' + filepath + '\n' + src.replace(/'use strict';\n/g, '');
};

exports.getFilesInDirAsStr = function(dir) {
    var contents = [], files = fs.readdirSync(dir);
    for (var i = 0, m = files.length; i < m; i++) {
        contents.push(String(fs.readFileSync(dir + files[i])));
    }
    return contents.join('\n');
};
