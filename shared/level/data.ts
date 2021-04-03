/**
 * @param {ImageData} imagedata
 * @param {LevelAnimationRegistry} animations
 * @constructor
 */
import { GAME_LEFT, GAME_TOP } from "../../client/const";
import { GAME_TILE } from "../const";
import { Parser } from "./parser";

export class LevelData {
    private width: any;
    private height: any;
    private walls: any;
    private spawns: any;
    private unreachables: any;
    private animations: any;

    constructor(imagedata, animations) {
        const parser = new Parser(imagedata);
        this.width = imagedata.width;
        this.height = imagedata.height;
        this.walls = parser.walls;
        this.spawns = parser.spawns;
        this.unreachables = parser.unreachables;
        this.animations = animations;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @return {boolean}
     */
    isWall(x, y) {
        if (this.outOfBounds(x, y)) {
            return true;
        } else if (this.walls.has(x, y)) {
            return true;
        }
        return false;
    }

    /**
     * @param {Coordinate} coordinate
     * @return {boolean}
     */
    isMovingWall(coordinate) {
        for (let i = 0, m = this.animations.walls.length; i < m; i++) {
            if (this.inShapes(this.animations.walls[i], coordinate)) {
                return true;
            }
        }
        return false;
    }

    /**
     * @param {ShapeCollection} shapeCollection
     * @param {Coordinate} coordinate
     * @return {boolean}
     */
    inShapes(shapeCollection, coordinate) {
        for (let i = 0, m = shapeCollection.shapes.length; i < m; i++) {
            var translate; var translated; const shape = shapeCollection.shapes[i];
            if (shape) {
                translate = shape.transform.translate;
                translated = this.convertToGameSystem(coordinate, translate);
                if (shape.pixels.has(translated[0], translated[1])) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Translate coordinate to game coordinate system.
     *
     * @param {Coordinate} coordinate
     * @param {Shift} translate
     */
    convertToGameSystem(coordinate, translate) {
        let tx; let ty;
        if (__IS_CLIENT__) {
            // In Client, Game transforms left/top. Not ideal, but it is done
            // so that we can move shapes without losing cache => performance.
            tx = (translate[0] - GAME_LEFT) / GAME_TILE;
            ty = (translate[1] - GAME_TOP) / GAME_TILE;
        } else {
            // In Server, There is never left/top translation.
            // TODO: class inheritance
            tx = translate[0] / GAME_TILE;
            ty = translate[1] / GAME_TILE;
        }
        return [coordinate[0] - tx, coordinate[1] - ty];
    }

    /**
     * @param {number} playerID
     * @return {Coordinate}
     */
    getSpawn(playerID) {
        return this.spawns[playerID].location;
    }

    /**
     * @param {number} playerID
     * @return {number}
     */
    getSpawnDirection(playerID) {
        return this.spawns[playerID].direction;
    }

    /**
     * @param {Array.<Array>} nonEmptyLocations
     * @return {Coordinate}
     */
    getEmptyLocation(nonEmptyLocations) {
        while (true) {
            const location = [
                Math.floor(Math.random() * this.width),
                Math.floor(Math.random() * this.height)
            ];
            if (this.isEmptyLocation(nonEmptyLocations, location)) {
                return location;
            }
        }
    }

    /**
     * @param {Array.<Array>} nonEmptyLocations
     * @param {Coordinate} location
     * @return {boolean}
     */
    isEmptyLocation(nonEmptyLocations, location) {
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

    /**
     * @param {number} x
     * @param {number} y
     * @return {boolean}
     */
    outOfBounds(x, y) {
        if (x < 0 || y < 0) {
            return true;
        } else {
            return x >= this.width || y >= this.height;
        }
    }

}
