/* see bootstrap/main.js */
import { CrosshairLevel } from "../shared/levels/debug/crosshair";
import { LinesLevel } from "../shared/levels/debug/lines";
import { Registry } from "../shared/levelset/registry";
import { Basic } from "../shared/levelsets/basic";
import { EventHandler } from "./netcode/eventHandler";
import { State } from "./state/state";

const basic = new Basic();
basic.register(LinesLevel);
basic.register(CrosshairLevel);

const levelsetRegistry = new Registry();
levelsetRegistry.register(basic);
levelsetRegistry.preloadLevels();

const events = new EventHandler()

State.shapes.push(1)

console.log(State.shapes);

// xss.event     = new xss.EventHandler();
// xss.font      = new xss.Font();
// xss.canvas    = new xss.Canvas();
// xss.shapegen  = new xss.ClientShapeGenerator();
// xss.transform = new xss.Transform();
// xss.audio     = new xss.AudioPlayer();
// xss.flow      = new xss.StageFlow();
