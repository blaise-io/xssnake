import { CrosshairLevel } from "../level/levels/crosshair";
import { BoroBudurLevel } from "../level/levels/borobudur";
import { LinesLevel } from "../level/levels/lines";
import { PacmanLevel } from "../level/levels/pacman";
import { LevelSet } from "./levelSet";
import { _ } from "../util";

export const levelSets: LevelSet[] = [
    new LevelSet(_("Basic"), LinesLevel, CrosshairLevel),
    new LevelSet(_("Amazing"), LinesLevel, BoroBudurLevel, CrosshairLevel, PacmanLevel),
];
