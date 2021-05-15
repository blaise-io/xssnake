import "./assets/xssnake.css";
import { runDebug } from "./debug";
import { StageFlow } from "./flow";
import { DebugStage } from "./stages/debugStage";
import { State } from "./state";
import { AudioPlayer } from "./ui/audioPlayer";
import { Canvas } from "./ui/canvas/canvas";
import { fontLoad } from "./ui/font";

console.log(`XSSnake client version ${ENV_VERSION}`);

(async () => {
    State.shapes = {};
    State.canvas = new Canvas();
    State.audio = new AudioPlayer();

    await fontLoad();

    if (ENV_DEBUG && runDebug()) {
        new StageFlow(DebugStage);
        runDebug()();
    } else {
        new StageFlow();
    }
})();
