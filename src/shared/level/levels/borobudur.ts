import image from "./borobudur.png";
import { Level, LevelSettings } from "../level";

export class BoroBudurLevel extends Level {
    static image = image;

    settings = new LevelSettings({ snakeSpeed: 100, powerupsEnabled: [] });
}
