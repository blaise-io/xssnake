import { STORAGE_MUTE } from "../const";
import { MP3_FILES, OGG_FILES } from "../data/audio";
import { State } from "../state";
import { storage } from "../util/clientUtil";

export class AudioPlayer {
    private files: Record<string, string>;
    private mimetype: string;

    constructor() {
        const audioFiles = this.getSupportedAudioFiles();
        if (audioFiles) {
            this.mimetype = audioFiles.mimetype;
            this.files = audioFiles.files;
        }
    }

    play(file: string): void {
        if (this.files && this.files[file] && !storage(STORAGE_MUTE) && State.canvas.focus) {
            new Audio(this.files[file]).play();
        }
    }

    getSupportedAudioFiles(): { mimetype: string; files: Record<string, string> } | null {
        const audioElement = document.createElement("audio");
        const mimetypes = {
            mp3: "audio/mpeg",
            ogg: "audio/ogg",
        };

        if (audioElement.canPlayType) {
            // Prefer ogg over mp3 because of this Firefox bug:
            // https://bugzilla.mozilla.org/show_bug.cgi?id=849264
            if (audioElement.canPlayType(mimetypes.ogg).replace(/no/, "")) {
                return { mimetype: mimetypes.ogg, files: OGG_FILES };
            } else if (audioElement.canPlayType(mimetypes.mp3).replace(/no/, "")) {
                return { mimetype: mimetypes.mp3, files: MP3_FILES };
            }
        }

        return null;
    }
}
