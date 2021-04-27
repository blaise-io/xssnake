import {
    DIRECTION_DOWN,
    DIRECTION_LEFT,
    DIRECTION_RIGHT,
    DIRECTION_UP,
    ROOM_CAPACITY,
} from "../const";
import { PixelCollection } from "../pixelCollection";
import { Spawn } from "./spawn";

export class Parser {
    width: number;
    height: number;
    walls: PixelCollection;
    unreachables: PixelCollection;
    spawns: Spawn[];
    spawnCoordinates: Coordinate[];
    spawnDirections: Coordinate[];

    constructor(imagedata: ImageData) {
        this.width = imagedata.width;
        this.height = imagedata.height;
        this.walls = new PixelCollection();
        this.unreachables = new PixelCollection();

        this.spawns = new Array(ROOM_CAPACITY);
        this.spawnCoordinates = new Array(ROOM_CAPACITY);
        this.spawnDirections = [];

        this.parsePixels(imagedata);
        this.generateSpawns();
    }

    parsePixels(imagedata: ImageData): void {
        const data = imagedata.data;
        for (let i = 0, m = data.length / 4; i < m; i++) {
            this.parsePixel(
                [data[i * 4], data[i * 4 + 1], data[i * 4 + 2]],
                [i % this.width, Math.floor(i / this.width)],
            );
        }
    }

    parsePixel(rgb: number[], coordinate: Coordinate): void {
        function rgbEquals(r, g, b) {
            return rgb[0] === r && rgb[1] === g && rgb[2] === b;
        }

        if (rgbEquals(0, 0, 0)) {
            this.walls.add(coordinate[0], coordinate[1]);
        } else if (rgbEquals(222, 222, 222)) {
            this.unreachables.add(coordinate[0], coordinate[1]);
        } else if (rgbEquals(99, 99, 99)) {
            this.spawnDirections.push(coordinate);
        } else if (rgbEquals(255, 0, 0)) {
            this.spawnCoordinates[0] = coordinate;
        } else if (rgbEquals(0, 255, 0)) {
            this.spawnCoordinates[1] = coordinate;
        } else if (rgbEquals(0, 0, 255)) {
            this.spawnCoordinates[2] = coordinate;
        } else if (rgbEquals(255, 255, 0)) {
            this.spawnCoordinates[3] = coordinate;
        } else if (rgbEquals(255, 0, 255)) {
            this.spawnCoordinates[4] = coordinate;
        } else if (rgbEquals(0, 255, 255)) {
            this.spawnCoordinates[5] = coordinate;
        } else if (!rgbEquals(255, 255, 255)) {
            throw new Error("Unknown color: " + rgb + " " + "at " + coordinate);
        }
    }

    generateSpawns(): void {
        for (let i = 0, m = this.spawnCoordinates.length; i < m; i++) {
            const spawnCoordinate = this.spawnCoordinates[i];

            if (spawnCoordinate) {
                this.spawns[i] = new Spawn(
                    spawnCoordinate,
                    this.getDirectionForSpawn(spawnCoordinate),
                );
            } else {
                throw new Error("Missing spawn with index: " + i);
            }
        }
    }

    getDirectionForSpawn(spawn: Coordinate): number {
        for (let i = 0, m = this.spawnDirections.length; i < m; i++) {
            if (!this.spawnDirections[i]) {
                continue;
            }

            const dx = spawn[0] - this.spawnDirections[i][0];
            const dy = spawn[1] - this.spawnDirections[i][1];
            if (1 === Math.abs(dx) + Math.abs(dy)) {
                if (dx === 0) {
                    return dy === 1 ? DIRECTION_UP : DIRECTION_DOWN;
                } else {
                    return dx === 1 ? DIRECTION_LEFT : DIRECTION_RIGHT;
                }
            }
        }

        throw new Error("Spawn at " + spawn + " is missing a direction");
    }
}
