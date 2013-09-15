'use strict';

var fs = require('fs');

var dir = __dirname + '/../client/audio/';
var files = fs.readdirSync(dir);
var data = {mp3: {}, ogg: {}};

for (var i = 0, m = files.length; i < m; i++) {
    var ext, buffer, key, file = files[i];
    ext = file.replace(/^[\w_-]+\./gi, '');
    if (data[ext]) {
        buffer = fs.readFileSync(dir + file);
        key = file.replace(new RegExp('.' + ext + '$'), '');
        data[ext][key] = buffer.toString('base64');
    }
}

var json = JSON.stringify(data, null, 4).replace(/"/gi, '\'');
var contents, template = __dirname + '/../client/templates/audio.js.tpl';

json = json.replace(/'([\w_]+)'/g, '$1');

contents = fs.readFileSync(template, 'utf-8');
contents = contents.replace('%%AUDIO%%', json);
contents = contents.replace('%%DATE%%', new Date().toUTCString());

fs.writeFile(__dirname + '/../client/js/audio.js', contents);
