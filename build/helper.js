'use strict';

var fs = require('fs');

exports.replaceStrict = function(src, filepath) {
    return '// #sourceURL ' + filepath + '\n' + src.replace(/'use strict';\n/g, '');
};

exports.readFileSync = function(abspath) {
    return String(fs.readFileSync(abspath));
};

exports.getFilesInDirAsStr = function(dir) {
    var contents = [], files = fs.readdirSync(dir);
    for (var i = 0, m = files.length; i < m; i++) {
        contents.push(exports.readFileSync(dir + files[i]));
    }
    return contents.join('\n');
};
