import * as fs from "fs";
import * as test from "tape";
import { PNG } from "pngjs";
import { ServerSnake } from "../../../server/game/serverSnake";
import { ServerSnakeMove } from "../../../server/game/serverSnakeMove";
import { DIRECTION, VALIDATE_SUCCES } from "../../../shared/const";
import { Level } from "../../../shared/level/level";
import { LevelData } from "../../../shared/level/levelData";

const imagedata = fs.readFileSync(__dirname + "/../../../shared/level/levels/internal/blank.png");
const png = (PNG.sync.read(imagedata) as unknown) as ImageData;
const levelData = new LevelData(png);
const level = new Level(levelData);

test("Snake move", async (t) => {
    const snake = new ServerSnake(-1, 0, level);
    snake.parts = [
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [5, 0], // Last client-server match
        [6, 0], // Wrong prediction by server
    ];
    snake.size = 6;

    const clientPartialParts: Coordinate[] = [
        [3, 0],
        [4, 0],
        [5, 0], // Last client-server match
        [5, 1], // Client correction (allowed)
    ];

    const expectedGluedParts = [
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [5, 0], // Last client-server match
        [5, 1], // Client correction (allowed)
    ];

    const move = new ServerSnakeMove(clientPartialParts, DIRECTION.DOWN, snake, 50);
    t.isEqual(move.getStatus(), VALIDATE_SUCCES, "Move is allowed");
    t.isEqual(move.parts.length, 6, "Number of move parts matches snake size");
    t.isEquivalent(move.parts, expectedGluedParts, "Move parts corrected by client");
});
