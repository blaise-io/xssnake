import * as fs from "fs";
import * as test from "tape";
import { PNG } from "pngjs";
import { ServerSnake } from "../../../server/game/serverSnake";
import { ServerSnakeMove } from "../../../server/game/serverSnakeMove";
import {
    DIRECTION,
    VALIDATE_ERR_MISMATCHES,
    VALIDATE_ERR_NO_COMMON,
    VALIDATE_SUCCES,
} from "../../../shared/const";
import { Level } from "../../../shared/level/level";
import { LevelData } from "../../../shared/level/levelData";

const imagedata = fs.readFileSync(__dirname + "/../../../shared/level/levels/internal/blank.png");
const png = (PNG.sync.read(imagedata) as unknown) as ImageData;
const levelData = new LevelData(png);
const level = new Level(levelData);

const FILE = __filename.split("/src/")[1] + ":";

test(`${FILE} valid when slightly out of sync`, (t) => {
    const serverSnake = new ServerSnake(-1, 0, level);
    serverSnake.parts = [
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [5, 0], // Last client-server match
        [6, 0], // Wrong prediction by server
    ];
    serverSnake.size = 6;

    const clientPartialParts: Coordinate[] = [
        [2, 0],
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

    const move = new ServerSnakeMove(clientPartialParts, DIRECTION.DOWN, serverSnake, 50);
    t.isEqual(move.getStatus(), VALIDATE_SUCCES, "status is VALIDATE_SUCCES");
    t.isEqual(move.parts.length, 6, "Maintain snake size");
    t.isEquivalent(move.parts, expectedGluedParts, "Glue parts correctly");
    t.end();
});

test(`${FILE} no common part`, (t) => {
    const serverSnake = new ServerSnake(-1, 0, level);
    serverSnake.parts = [
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [5, 0], // Last client-server match
        [6, 0], // Wrong prediction by server
    ];
    serverSnake.size = 6;

    const clientPartialParts: Coordinate[] = [
        [6, 1],
        [6, 2],
        [6, 3],
    ];

    const move = new ServerSnakeMove(clientPartialParts, DIRECTION.DOWN, serverSnake, 50);
    t.isEqual(move.getStatus(), VALIDATE_ERR_NO_COMMON, "status is VALIDATE_ERR_NO_COMMON");
    t.end();
});

test(`${FILE} too many mismatches`, (t) => {
    const serverSnake = new ServerSnake(-1, 0, level);
    serverSnake.parts = [
        [2, 0],
        [3, 0],
        [4, 0],
        [5, 0], // Last client-server match
        [6, 0], // Wrong prediction by server
        [6, 1], // Wrong prediction by server
    ];
    serverSnake.size = 6;

    const clientPartialParts: Coordinate[] = [
        [4, 0],
        [5, 0], // Last client-server match
        [5, 1], // Client correction (allowed)
        [5, 2], // Too far out of sync
    ];

    const move = new ServerSnakeMove(clientPartialParts, DIRECTION.DOWN, serverSnake, 50);
    t.isEqual(move.getStatus(), VALIDATE_ERR_MISMATCHES, "status is VALIDATE_ERR_MISMATCHES");
    t.end();
});

test(`${FILE} completely in sync`, (t) => {
    const serverSnake = new ServerSnake(-1, 0, level);
    serverSnake.parts = [
        [14, 18],
        [15, 18],
        [16, 18],
        [17, 18],
        [18, 18],
        [19, 18],
        [20, 18],
    ];
    serverSnake.size = 7;

    const clientPartialParts: Coordinate[] = [
        [16, 18],
        [17, 18],
        [18, 18],
        [19, 18],
        [20, 18],
    ];

    const expectedGluedParts = [
        [14, 18],
        [15, 18],
        [16, 18],
        [17, 18],
        [18, 18],
        [19, 18],
        [20, 18],
    ];

    const move = new ServerSnakeMove(clientPartialParts, DIRECTION.UP, serverSnake, 50);
    t.isEqual(move.getStatus(), VALIDATE_SUCCES, "status is VALIDATE_SUCCES");
    t.isEquivalent(move.parts, expectedGluedParts, "Glue parts correctly");
    t.end();
});
