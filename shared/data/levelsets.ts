import { CrosshairLevel } from "../levels/debug/crosshair";
import { LinesLevel } from "../levels/debug/lines";
import { BasicLevelSet } from "../levelsets/basicLevelSet";

const basic = new BasicLevelSet();
basic.register(LinesLevel);
basic.register(CrosshairLevel);

export const levelsets = [basic];
