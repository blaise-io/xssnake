import "./assets/xssnake.css";
import { EventHandler } from "./netcode/eventHandler";
import { StageFlow } from "./stage/stageFlow";
import { ClientState } from "./state/clientState";
import { AudioPlayer } from "./ui/audioPlayer";
import { Canvas } from "./ui/canvas";

(async () => {
    ClientState.shapes = {};
    ClientState.events = new EventHandler();
    ClientState.canvas = new Canvas();
    ClientState.audio = new AudioPlayer();
    ClientState.flow = new StageFlow();

    window.onerror = (error) => {
        console.error(error);
        ClientState.canvas.error = true; // Stop the paint!
    };
})();
