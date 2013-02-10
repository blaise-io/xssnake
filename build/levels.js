/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var fs = require('fs'),
    util = require('util'),
    Compressor = require('../server/shared/compressor'),
    LevelImage = require('./lib/level_image.js');

var levelTplFile = __dirname + '/../source/templates/levels.js.tpl';
var levelImagesDir = __dirname + '/../source/levels/';
var jsOutputFile = __dirname + '/../server/shared/levels.js';

var files = fs.readdirSync(levelImagesDir);

var levels = [];
var done = 0;
var total = 0;

var compressor = new Compressor();

function formattingOCD(str) {
    str = str.replace(/"/g, '\''); // Double quotes to single
    str = str.replace(/\n\s{8}/g, ''); // Put objects one one huge line
    str = str.replace(/\n\s{4}\}/g, '}'); // Put object closing bracket on same line
    str = str.replace(/\n\s{4}\{ /g, '\n    {'); // Remove a space...
    return str;
}

function setlevel(file, index) {
    void(new LevelImage(file, function(data) {
        var template, levelsStr;

        for (var k in data) {
            if (data.hasOwnProperty(k) && typeof data[k] === 'object') {
                data[k] = compressor.compress(data[k]);
            }
        }

        levels[index] = data;

        // Got all levels, write to file
        if (++done === total) {
            levelsStr = JSON.stringify(levels, null, 4);

            // Don't quote property names, conflicts with Closure Compiler.
            levelsStr = levelsStr.replace(/"([\w]+)"(:)/g, ' $1:');
            levelsStr = formattingOCD(levelsStr);

            template = fs.readFileSync(levelTplFile, 'utf-8');
            template = template.replace('%%LEVELS%%', levelsStr);
            template = template.replace('%%DATE%%', new Date().toUTCString());

            fs.writeFile(jsOutputFile, template);

            jsOutputFile = fs.realpathSync(jsOutputFile);
            console.log('Saved ' + (1+index) + ' levels to ' + jsOutputFile);
            console.log(Math.round(levelsStr.length / 1024) + ' KB');
        }
    }));
}

for (var i = 0, m = files.length; i < m; i++) {
    if (/\.png$/.test(files[i])) {
        setlevel(levelImagesDir + files[i], i);
        total++;
    }
}