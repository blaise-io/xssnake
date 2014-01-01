'use strict';

var util = require('util');
var fs = require('fs');
var path = require('path');

var banner = '', footer = '';

banner += '\'use strict\';\n\n';
banner += '// This file was generated using `grunt source`\n';
banner += 'xss.data.levelImages = {\n';

footer += '\n};\n';

exports.concat = {
    options: {
        separator: ',\n',
        banner: banner,
        footer: footer,
        process: function(data, file) {
            return util.format(
                '    %s: \'%s\'',
                path.basename(file, '.png'),
                // grunt-contrib-concat file-to-string breaks binary files,
                // read binary file ourselves.
                fs.readFileSync(file).toString('base64')
            );
        }
    },
    src: ['shared/data/level_images/*.png'],
    dest: 'shared/data/level_images.js'
};
