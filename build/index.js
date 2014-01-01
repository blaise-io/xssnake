'use strict';

/**
 * exports.index = {
 *     options: {
 *         inline: {
 *             css: 'dist/client.min.css',
 *             js: 'dist/client.min.js'
 *         }
 *     },
 *     src: 'build/index.tpl',
 *     dest: 'www/index.html'
 * };
 *
 * <style><%= css %></style>
 * <script><%= js %></script>
 */

module.exports = function(grunt) {

    grunt.registerMultiTask('index', '', function() {
        var options = this.options(), data = {};

        // Expand `options.inline`.
        for (var k in options.inline) {
            if (options.inline.hasOwnProperty(k)) {
                if (!grunt.file.exists(options.inline[k])) {
                    grunt.log.warn('Inline file "' + options.inline[k] + '" not found.');
                } else {
                    data[k] = grunt.file.read(options.inline[k]);
                    data[k] = data[k].replace(/\n/g, '');
                }
            }
        }

        // Walk through src files.
        this.files.forEach(function(file) {
            var template, parsed, kb;

            // Gather templates.
            template = file.src.filter(function(filepath) {
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                }
                return true;
            }).map(grunt.file.read).join('');

            // Parse template and calculate size.
            parsed = grunt.template.process(template, {data: data});
            kb = (Buffer.byteLength(parsed, 'utf8') / 1024).toFixed(2);

            // Write file to dest and report status.
            grunt.file.write(file.dest, parsed);
            grunt.log.writeln('File ' + file.dest + ' (' + kb + ' KB) created.');
        });
    });
};
