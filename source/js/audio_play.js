/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS*/
'use strict';

/**
 * @constructor
 */
function AudioPlay() {
    this._setupFiles();
    // this._bindEvents(); TODO: subscribe to XSS.canvas.focus
    this.settings = {
        mute: false,
        enabled: true
    };
}

AudioPlay.prototype = {

    _mimetypes: {
        mp3: 'audio/mpeg',
        ogg: 'audio/ogg'
    },

    _getAudioData: function() {
        var el = document.createElement('audio');
        if (el.canPlayType) {
            if (el.canPlayType(this._mimetypes.mp3).replace(/no/, '')) {
                return {mime: this._mimetypes.mp3, files: XSS.audio.mp3};
            } else if (el.canPlayType(this._mimetypes.ogg).replace(/no/, '')) {
                return {mime: this._mimetypes.ogg, files: XSS.audio.ogg};
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
            if (!this.settings.mute && this.settings.enabled) {
                window.setTimeout(function() {
                    new Audio('data:' + mime + ';base64,' + data).play();
                }, 0);
            }
        }.bind(this);
    },

    _setupDummyFiles: function() {
        for (var k in XSS.audio.mp3) {
            if (XSS.audio.mp3.hasOwnProperty(k)) {
                this[key] = function() {};
            }
        }
    }

};