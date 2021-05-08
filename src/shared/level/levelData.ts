import { GAME } from "../const";
import { PixelCollection } from "../pixelCollection";
import { ShapeCollection } from "../shapeCollection";
import { parseLevelData } from "./parser";
import { PlayerSpawn } from "./playerSpawn";

export class LevelData {
    private width: number;
    private height: number;
    walls: PixelCollection;
    spawns: PlayerSpawn[];
    private unreachables: PixelCollection;
    private animations = { walls: [] };

    constructor(imagedata: ImageData) {
        Object.assign(this, parseLevelData(imagedata));
        console.log(this.spawns);
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
     * TODO: Why is not everything in game system on server?
     */
    convertToGameSystem(coordinate: Coordinate, translate: Shift): Coordinate {
        if (ENV_IS_CLIENT) {
            const tx = (translate[0] - GAME.LEFT) / GAME.TILE;
            const ty = (translate[1] - GAME.TOP) / GAME.TILE;
            return [coordinate[0] - tx, coordinate[1] - ty];
        } else {
            const tx = translate[0] / GAME.TILE;
            const ty = translate[1] / GAME.TILE;
            return [coordinate[0] - tx, coordinate[1] - ty];
        }
    }

    // getEmptyLocation(nonEmptyLocations: Coordinate[]): Coordinate {
    //     let maxTries = 50;
    //     while (--maxTries) {
    //         const location = [
    //             Math.floor(Math.random() * this.width),
    //             Math.floor(Math.random() * this.height),
    //         ] as Coordinate;
    //         if (this.isEmptyLocation(nonEmptyLocations, location)) {
    //             return location;
    //         }
    //     }
    // }
    //
    // isEmptyLocation(nonEmptyLocations: Coordinate[], location: Coordinate): boolean {
    //     if (this.isWall(location[0], location[1])) {
    //         return false;
    //     }
    //     if (this.unreachables.has(location[0], location[1])) {
    //         return false;
    //     }
    //     for (let i = 0, m = nonEmptyLocations.length; i < m; i++) {
    //         const nonE = nonEmptyLocations[i];
    //         if (nonE && nonE[0] === location[0] && nonE[1] === location[1]) {
    //             return false;
    //         }
    //     }
    //     return true;
    // }

    outOfBounds(x: number, y: number): boolean {
        if (x < 0 || y < 0) {
            return true;
        } else {
            return x >= this.width || y >= this.height;
        }
    }
}
