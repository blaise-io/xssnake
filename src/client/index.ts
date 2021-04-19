import "./assets/xssnake.css";
import { runDebug } from "./debug/_index";
import { EventHandler } from "./netcode/eventHandler";
import { StageFlow } from "./stage/stageFlow";
import { ClientState } from "./state/clientState";
import { AudioPlayer } from "./ui/audioPlayer";
import { Canvas } from "./ui/canvas";

console.log(`XSSnake client version ${ENV_VERSION}`);

ClientState.shapes = {};
ClientState.events = new EventHandler();
ClientState.canvas = new Canvas();
ClientState.audio = new AudioPlayer();
ClientState.flow = new StageFlow();

if (ENV_DEBUG) {
    runDebug();
}
