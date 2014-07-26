'use strict';

/**
 * @constructor
 */
xss.AudioPlay = function() {
    this._setupFiles();
};

xss.AudioPlay.prototype = {

    _mimetypes: {
        mp3: 'audio/mpeg',
        ogg: 'audio/ogg'
    },

    _getAudioData: function() {
        var el = document.createElement('audio');
        if (el.canPlayType) {
            // Prefer ogg over mp3 because of this Firefox bug:
            // https://bugzilla.mozilla.org/show_bug.cgi?id=849264
            if (el.canPlayType(this._mimetypes.ogg).replace(/no/, '')) {
                return {mime: this._mimetypes.ogg, files: xss.data.ogg};
            } else if (el.canPlayType(this._mimetypes.mp3).replace(/no/, '')) {
                return {mime: this._mimetypes.mp3, files: xss.data.mp3};
            }
        }
        return null;
    },

    _setupFiles: function() {
        var data = this._getAudioData();
        if (data) {
            for (var k in data.files) {
                if (data.files.hasOwnProperty(k)) {
                    this._setupFile(k, data.mime, data.files[k]);
                }
            }
        } else {
            this._setupDummyFiles();
        }
    },

    _setupFile: function(key, mime, data) {
        this[key] = function() {
            if (!xss.util.storage(xss.STORAGE_MUTE) && xss.canvas.focus) {
                new Audio('data:' + mime + ';base64,' + data).play();
            }
        }.bind(this);
    },

    _setupDummyFiles: function() {
        for (var k in xss.data.mp3) {
            if (xss.data.mp3.hasOwnProperty(k)) {
                this[k] = xss.util.noop;
            }
        }
    }

};
