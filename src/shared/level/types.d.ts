import { Level } from "./level";
import { LevelData } from "./levelData";

type LevelString = string;

interface LevelConstructor {
    image: LevelString;
    new (data: LevelData): Level;
}
