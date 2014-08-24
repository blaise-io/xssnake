'use strict';

var util = require('util');
var fs = require('fs');
var path = require('path');

var banner = '', footer = '';

banner += '// This file was generated using `grunt levels`\n';
banner += 'xss.data.levels = {\n';

footer += '\n};\n';

exports.concat = {
    options: {
        separator: ',\n',
        banner: banner,
        footer: footer,
        process: function(data, file) {
            return util.format(
                '    %s: {imagedata: \'%s\'}',
                path.basename(file, '.png'),
                // grunt-contrib-concat file-to-string breaks binary files,
                // read binary file ourselves.
                fs.readFileSync(file).toString('base64')
            );
        }
    },
    src: ['build/levels/*.png'],
    dest: 'shared/data/levels.js'
};
