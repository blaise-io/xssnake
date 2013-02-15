/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var fs = require('fs');

var dir = __dirname + '/../source/levels/';
var files = fs.readdirSync(dir);
var data = [];

for (var i = 0, m = files.length; i < m; i++) {
    if (/\.png$/.test(files[i])) {
        var file = fs.readFileSync(dir + files[i]);
        data.push(file.toString('base64'));
    }
}

var dataJSON = JSON.stringify(data, null, 4).replace(/"/gi, '\'');
var contents, template = __dirname + '/../source/templates/levels.js.tpl';

contents = fs.readFileSync(template, 'utf-8');
contents = contents.replace('%%LEVELS%%', dataJSON);
contents = contents.replace('%%DATE%%', new Date().toUTCString());

fs.writeFile(__dirname + '/../server/shared/levels.js', contents);