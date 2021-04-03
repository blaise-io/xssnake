import { CrosshairLevel } from "../shared/levels/debug/crosshair";
import { LinesLevel } from "../shared/levels/debug/lines";
import { Registry } from "../shared/levelset/registry";
import { Basic } from "../shared/levelsets/basic";
import { EventHandler } from "./netcode/eventHandler";
import { StageFlow } from "./stage/stageFlow";
import { State } from "./state/state";
import { AudioPlayer } from "./ui/audioPlayer";
import { Canvas } from "./ui/canvas";

const basic = new Basic();
basic.register(LinesLevel);
basic.register(CrosshairLevel);

State.levelsetRegistry = new Registry();
State.levelsetRegistry.register(basic);
State.levelsetRegistry.preloadLevels();

State.shapes = {};
State.events = new EventHandler();
State.canvas = new Canvas();
State.audio = new AudioPlayer();
State.flow = new StageFlow();

window.onerror = (error) => {
    console.error(error);
    State.canvas.error = true;  // Stop the paint!
};
