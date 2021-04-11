// import { CrosshairLevel } from "../shared/levels/debug/crosshair";
// import { LinesLevel } from "../shared/levels/debug/lines";
// import { Registry } from "../shared/levelset/registry";
// import { Basic } from "../shared/levelsets/basic";
import { EventHandler } from "./netcode/eventHandler";
import { StageFlow } from "./stage/stageFlow";
import { ClientState } from "./state/clientState";
import { AudioPlayer } from "./ui/audioPlayer";
import { Canvas } from "./ui/canvas";

// const basic = new Basic();
// basic.register(LinesLevel);
// basic.register(CrosshairLevel);
//
// ClientState.levelsetRegistry = new Registry();
// ClientState.levelsetRegistry.register(basic);
// ClientState.levelsetRegistry.preloadLevels();

ClientState.shapes = {};
ClientState.events = new EventHandler();
ClientState.canvas = new Canvas();
ClientState.audio = new AudioPlayer();
ClientState.flow = new StageFlow();

window.onerror = (error) => {
    console.error(error);
    ClientState.canvas.error = true; // Stop the paint!
};
