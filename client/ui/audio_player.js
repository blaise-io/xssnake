'use strict';

/**
 * @constructor
 */
xss.AudioPlayer = function() {
    /** @type {Object.<string,string>} */
    this.files;
    /** @type {string} */
    this.mimetype;
    this.setupFiles();
};

xss.AudioPlayer.prototype = {

    /**
     * @param {string} file
     */
    play: function(file) {
        if (
            this.files &&
            this.files[file] &&
            !xss.util.storage(xss.STORAGE_MUTE) &&
            xss.canvas.focus
        ) {
            new Audio('data:' + this.mimetype + ';base64,' + this.files[file]).play();
        }
    },

    getSupportedAudioFiles: function() {
        var audioElement, mimetypes;

        audioElement = document.createElement('audio');

        mimetypes = {
            mp3: 'audio/mpeg',
            ogg: 'audio/ogg'
        };

        if (audioElement.canPlayType) {
            // Prefer ogg over mp3 because of this Firefox bug:
            // https://bugzilla.mozilla.org/show_bug.cgi?id=849264
            if (audioElement.canPlayType(mimetypes.ogg).replace(/no/, '')) {
                return {mimetype: mimetypes.ogg, files: xss.data.ogg};
            } else if (audioElement.canPlayType(mimetypes.mp3).replace(/no/, '')) {
                return {mimetype: mimetypes.mp3, files: xss.data.mp3};
            }
        }

        return null;
    },

    setupFiles: function() {
        var audioFiles = this.getSupportedAudioFiles();
        if (audioFiles) {
            this.mimetype = audioFiles.mimetype;
            this.files = audioFiles.files;
        }
    }

};
