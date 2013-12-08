exports.concat = {
    src: [
        'shared/namespace.js',
        'shared/**/*.js',
        'server/**/*.js',
        'test/*.js',
        '!server/start.js'
    ],
    dest: 'dist/testsuite.js'
};
