import "./assets/xssnake.css";
import { runDebug } from "./debug";
import { EventHandler } from "./netcode/eventHandler";
import { StageFlow } from "./flow";
import { DebugStage } from "./stages/debugStage";
import { State } from "./state";
import { AudioPlayer } from "./ui/audioPlayer";
import { Canvas } from "./ui/canvas/canvas";

console.log(`XSSnake client version ${ENV_VERSION}`);

State.shapes = {};
State.events = new EventHandler();
State.canvas = new Canvas();
State.audio = new AudioPlayer();

if (ENV_DEBUG && runDebug()) {
    new StageFlow(DebugStage);
    runDebug()();
} else {
    new StageFlow();
}
