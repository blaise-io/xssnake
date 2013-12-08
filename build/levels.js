'use strict';

var fs = require('fs');
var helper = require('./helper.js');

var banner = '', footer = '';

banner += '\'use strict\';\n\n';
banner += '// This file was generated using `grunt source`\n';
banner += 'xss.data = xss.data || {};\n';
banner += 'xss.data.levels = [\n';

footer += '\n];\n';

exports.concat = {
    options: {
        separator: ',\n',
        banner: banner,
        footer: footer,
        process: function(src, path) {
            var str,  animfile = path.replace(/.png$/, '.js');

            str = '    [\'';
            str += fs.readFileSync(path).toString('base64');
            str += '\'';

            if (fs.existsSync(animfile)) {
                str += ',function(){return [';
                str += helper.readFileSync(animfile).replace(/;\n/g, ',').replace(';', '');
                str += '];}';
            }

            str += ']';
            return str;
        }
    },
    src: ['build/levels/*.png'],
    dest: 'shared/data/levels.js'
};
