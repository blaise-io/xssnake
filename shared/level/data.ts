import { GAME_LEFT, GAME_TILE, GAME_TOP } from "../const";
import { PixelCollection } from "../pixelCollection";
import { ShapeCollection } from "../shapeCollection";
import { Parser } from "./parser";
import { Spawn } from "./spawn";

export class LevelData {
    private width: number;
    private height: number;
    walls: PixelCollection;
    spawns: Spawn[];
    private unreachables: PixelCollection;
    private animations: any;

    constructor(imagedata: ImageData) {
        const parser = new Parser(imagedata);
        this.width = imagedata.width;
        this.height = imagedata.height;
        this.walls = parser.walls;
        this.spawns = parser.spawns;
        this.unreachables = parser.unreachables;
        this.animations = { walls: [] }; // TODO: how to register and sync animations?
    }

    isWall(x: number, y: number): boolean {
        if (this.outOfBounds(x, y)) {
            return true;
        } else if (this.walls.has(x, y)) {
            return true;
        }
        return false;
    }

    isMovingWall(coordinate: Coordinate): boolean {
        for (let i = 0, m = this.animations.walls.length; i < m; i++) {
            if (this.inShapes(this.animations.walls[i], coordinate)) {
                return true;
            }
        }
        return false;
    }

    inShapes(shapeCollection: ShapeCollection, coordinate: Coordinate): boolean {
        for (let i = 0, m = shapeCollection.shapes.length; i < m; i++) {
            const shape = shapeCollection.shapes[i];
            if (shape) {
                const translate = shape.transform.translate;
                const translated = this.convertToGameSystem(coordinate, translate);
                if (shape.pixels.has(translated[0], translated[1])) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Translate coordinate to game coordinate system.
     */
    convertToGameSystem(coordinate: Coordinate, translate: Shift): Coordinate {
        let tx;
        let ty;
        if (__IS_CLIENT__) {
            tx = (translate[0] - GAME_LEFT) / GAME_TILE;
            ty = (translate[1] - GAME_TOP) / GAME_TILE;
        } else {
            tx = translate[0] / GAME_TILE;
            ty = translate[1] / GAME_TILE;
        }
        return [coordinate[0] - tx, coordinate[1] - ty];
    }

    getSpawn(playerID: number): Coordinate {
        return this.spawns[playerID].location;
    }

    getSpawnDirection(playerID: number): number {
        return this.spawns[playerID].direction;
    }

    getEmptyLocation(nonEmptyLocations: Coordinate[]): Coordinate {
        let maxTries = 50;
        while (--maxTries) {
            const location = [
                Math.floor(Math.random() * this.width),
                Math.floor(Math.random() * this.height),
            ] as Coordinate;
            if (this.isEmptyLocation(nonEmptyLocations, location)) {
                return location;
            }
        }
    }

    isEmptyLocation(nonEmptyLocations: Coordinate[], location: Coordinate): boolean {
        if (this.isWall(location[0], location[1])) {
            return false;
        }
        if (this.unreachables.has(location[0], location[1])) {
            return false;
        }
        for (let i = 0, m = nonEmptyLocations.length; i < m; i++) {
            const nonE = nonEmptyLocations[i];
            if (nonE && nonE[0] === location[0] && nonE[1] === location[1]) {
                return false;
            }
        }
        return true;
    }

    outOfBounds(x: number, y: number): boolean {
        if (x < 0 || y < 0) {
            return true;
        } else {
            return x >= this.width || y >= this.height;
        }
    }
}
