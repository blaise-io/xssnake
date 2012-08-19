/*jshint globalstrict:true,es5:true*/
'use strict';

var levelTplFile, jsOutputFile, levelImagesDir, levels, files, done, total,
    fs = require('fs'),
    toSrc = require("toSrc"),
    LevelImage = require('./levels/level_image.js');

levelTplFile = __dirname + '/../shared/levels.tpl';
jsOutputFile = __dirname + '/../shared/levels.js';
levelImagesDir = __dirname + '/../data/level_images/';

files = fs.readdirSync(levelImagesDir);

levels = [];
done = 0;
total = 0;

function setlevel(file, index) {
    void(new LevelImage(file, function(data) {
        var template, levelsStr;
        levels[index] = data;

        // Got all levels, write to file
        if (++done === total) {

            levelsStr = toSrc(levels, 99);
            levelsStr = levelsStr.replace(/"/g, '');
            levelsStr = levelsStr.replace(/\{/g, '\n        ' + '{'); // OCD
            levelsStr = levelsStr.replace(/\]$/g, '\n    ' + ']');

            template = fs.readFileSync(levelTplFile, 'utf-8');
            template = template.replace('%LEVELS%', levelsStr);
            template = template.replace('%DATE%', new Date().toUTCString());

            fs.writeFile(jsOutputFile, template);
        }
    }));
}

for (var i = 0, m = files.length; i < m; i++) {
    if (/\.png$/.test(files[i])) {
        setlevel(levelImagesDir + files[i], i);
        total++;
    }
}