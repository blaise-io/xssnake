import { DIRECTION_DOWN, DIRECTION_LEFT, DIRECTION_RIGHT, DIRECTION_UP, ROOM_CAPACITY } from "../const";
import { PixelCollection } from "../pixelCollection";
import { Spawn } from "./spawn";


/**
 * @param {ImageData} imagedata
 * @constructor
 */
export class Parser {
    width: number
    height: number
    walls: PixelCollection
    unreachables: PixelCollection
    spawns: any[]
    spawnCoordinates: any[]
    spawnDirections: any[]

    constructor(imagedata) {
        this.width = imagedata.width;
        this.height = imagedata.height;
        this.walls = new PixelCollection();
        this.unreachables = new PixelCollection();

        /** @type {Array.<level.Spawn>} */
        this.spawns = new Array(ROOM_CAPACITY);

        /** @type {Array.<Coordinate>} */
        this.spawnCoordinates = new Array(ROOM_CAPACITY);

        /** @type {Array.<Coordinate>} */
        this.spawnDirections = [];

        this.parsePixels(imagedata.data);
        this.generateSpawns();
    }

    /**
     * @param {Object} imagedata
     */
    parsePixels(imagedata) {
        for (let i = 0, m = imagedata.length / 4; i < m; i++) {
            this.parsePixel(
                [
                    imagedata[i * 4],
                    imagedata[i * 4 + 1],
                    imagedata[i * 4 + 2]
                ], [
                    i % this.width,
                    Math.floor(i / this.width)
                ]
            );
        }
    }

    /**
     * @param {Array.<number>} rgb
     * @param {Coordinate} coordinate
     */
    parsePixel(rgb, coordinate) {
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

    generateSpawns() {
        for (let i = 0, m = this.spawnCoordinates.length; i < m; i++) {
            const spawnCoordinate = this.spawnCoordinates[i];

            if (spawnCoordinate) {
                this.spawns[i] = new Spawn(
                    spawnCoordinate,
                    this.getDirectionForSpawn(spawnCoordinate)
                );
            } else {
                throw new Error("Missing spawn with index: " + i);
            }
        }
    }

    /**
     * @param {Coordinate} spawn
     * @return {number}
     */
    getDirectionForSpawn(spawn: number[]): number {
        for (let i = 0, m = this.spawnDirections.length; i < m; i++) {
            var dx; var dy;

            if (!this.spawnDirections[i]) {
                continue;
            }

            dx = spawn[0] - this.spawnDirections[i][0];
            dy = spawn[1] - this.spawnDirections[i][1];

            if (1 === Math.abs(dx) + Math.abs(dy)) {
                if (dx === 0) {
                    return (dy === 1) ? DIRECTION_UP : DIRECTION_DOWN;
                } else {
                    return (dx === 1) ? DIRECTION_LEFT : DIRECTION_RIGHT;
                }
            }
        }

        throw new Error("Spawn at " + spawn + " is missing a direction");
    }
}
