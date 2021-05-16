import pacman from "./pacman.png";
import { Level, LevelSettings } from "../level";

export class PacmanLevel extends Level {
    static image = pacman;

    settings = new LevelSettings({ snakeSpeed: 100, powerupsEnabled: [] });
}
