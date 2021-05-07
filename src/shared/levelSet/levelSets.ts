import { CrosshairLevel } from "../level/levels/crosshair";
import { LinesLevel } from "../level/levels/lines";
import { LevelSet } from "./levelSet";
import { _ } from "../util";

const basic = new LevelSet(_("Basic"));
basic.push(LinesLevel);
basic.push(CrosshairLevel);

const alsoBasic = new LevelSet(_("Amazing"));
alsoBasic.push(LinesLevel);
alsoBasic.push(CrosshairLevel);

export const levelSets: LevelSet[] = [basic, alsoBasic];
