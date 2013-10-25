exports = {};

exports.concat = {
    src: [
        'shared/namespace.js',
        'shared/*.js',
        'server/lib/*.js',
        'test/*.js'
    ],
    dest: 'dist/testsuite.js'
};
