'use strict';

var util = require('util');
var fs = require('fs');
var path = require('path');

var banner = '', footer = '';

banner += '// This file was generated using `grunt audio`\n';

footer += '\n};\n';

exports.concat = {};

exports.concat.mp3 = {
    options: {
        separator: ',\n',
        banner: banner + 'xss.data.mp3 = {\n',
        footer: footer,
        process: function(data, file) {
            return util.format(
                '    %s: \'%s\'',
                path.basename(file, '.mp3'),
                // grunt-contrib-concat file-to-string breaks binary files,
                // read binary file ourselves.
                fs.readFileSync(file).toString('base64')
            );
        }
    },
    src: ['build/audio/*.mp3'],
    dest: 'client/data/mp3.js'
};

exports.concat.ogg = {
    options: {
        separator: ',\n',
        banner: banner + 'xss.data.ogg = {\n',
        footer: footer,
        process: function(data, file) {
            return util.format(
                '    %s: \'%s\'',
                path.basename(file, '.ogg'),
                // grunt-contrib-concat file-to-string breaks binary files,
                // read binary file ourselves.
                fs.readFileSync(file).toString('base64')
            );
        }
    },
    src: ['build/audio/*.ogg'],
    dest: 'client/data/ogg.js'
};
