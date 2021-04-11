import { CrosshairLevel } from "../shared/levels/debug/crosshair";
import { LinesLevel } from "../shared/levels/debug/lines";
import { Registry } from "../shared/levelset/registry";
import { Basic } from "../shared/levelsets/basic";
import { Server } from "./netcode/server";
import { State } from "./state/state";

console.log("Running XSSnake server version XX.");

const basic = new Basic();
basic.register(LinesLevel);
basic.register(CrosshairLevel);

State.levelsetRegistry = new Registry();
State.levelsetRegistry.register(basic);

new Server();
