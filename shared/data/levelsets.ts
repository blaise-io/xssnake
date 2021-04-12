import { CrosshairLevel } from "../levels/debug/crosshair";
import { LinesLevel } from "../levels/debug/lines";
import { Levelset } from "../levelset/levelset";
import { BasicLevelSet } from "../levelsets/basicLevelSet";

const basic = new BasicLevelSet();
basic.register(LinesLevel);
basic.register(CrosshairLevel);

export const levelsets: Levelset[] = [basic];
