/*jshint globalstrict:true, node:true, sub:true*/
'use strict';

var fs = require('fs');

var dir = __dirname + '/../source/levels/';
var files = fs.readdirSync(dir);
var data = [];

for (var i = 0, m = files.length; i < m; i++) {
    if (/\.png$/.test(files[i])) {
        var buffer = fs.readFileSync(dir + files[i]);
        data.push(buffer.toString('base64'));
    }
}

var json = JSON.stringify(data, null, 4).replace(/"/gi, '\'');
var contents, template = __dirname + '/../source/templates/levels.js.tpl';

contents = fs.readFileSync(template, 'utf-8');
contents = contents.replace('%%LEVELS%%', json);
contents = contents.replace('%%DATE%%', new Date().toUTCString());

fs.writeFile(__dirname + '/../server/shared/levels.js', contents);
