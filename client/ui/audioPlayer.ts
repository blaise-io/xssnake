/**
 * @constructor
 */
import { STORAGE_MUTE } from "../const";
import { MP3_FILES } from "../data/mp3";
import { OGG_FILES } from "../data/ogg";
import { State } from "../state/state";
import { storage } from "../util/clientUtil";

export class AudioPlayer {
    private files: any;
    private mimetype: string;

    constructor() {
        /** @type {Object.<string,string>} */
        this.files;
        /** @type {string} */
        this.mimetype;
        this.setupFiles();
    }

    /**
     * @param {string} file
     */
    play(file) {
        if (
            this.files &&
            this.files[file] &&
            !storage(STORAGE_MUTE) &&
            State.canvas.focus
        ) {
            new Audio('data:' + this.mimetype + ';base64,' + this.files[file]).play();
        }
    }

    getSupportedAudioFiles() {
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
                return {mimetype: mimetypes.ogg, files: OGG_FILES};
            } else if (audioElement.canPlayType(mimetypes.mp3).replace(/no/, '')) {
                return {mimetype: mimetypes.mp3, files: MP3_FILES};
            }
        }

        return null;
    }

    setupFiles() {
        const audioFiles = this.getSupportedAudioFiles();
        if (audioFiles) {
            this.mimetype = audioFiles.mimetype;
            this.files = audioFiles.files;
        }
    }

}
