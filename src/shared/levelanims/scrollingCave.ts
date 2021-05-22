import { GAME } from "../const";
import { Shape } from "../shape";
import { ShapeCollection } from "../shapeCollection";
import { line } from "../shapeGenerator";
import { average } from "../util";

export class ScrollingCave {
    private seedIteration: number;
    private _shapes: ShapeCollection = [];
    private _scroll: number;
    private _scrollPref: number;
    private _max: { stalactite: number; stalagmite: number };
    private gameStartedAtMs: number;

    constructor(public seed: number) {
        this.seedIteration = 0;

        this._scroll = this._scrollPref = 0;

        this._max = {
            // Stalactite ‾\/‾
            stalactite: this._LEVEL_WIDTH,
            // Stalagmite _/\_
            stalagmite: this._LEVEL_WIDTH + Math.round(average(this._BUMP_WIDTH)),
        };
    }

    _SPEED = 0.47;

    _BUMP_WIDTH = [15, 25];
    _BUMP_HEIGHT = [20, 40];
    _BUMP_DECREASE = [0, 2];

    _LEVEL_WIDTH = 63;
    _LEVEL_HEIGHT = 33;

    update(ms: number, gameStarted: boolean): ShapeCollection | null {
        if (!gameStarted) {
            return null;
        } else if (!this.gameStartedAtMs) {
            this.gameStartedAtMs = ms;
        }

        ms -= this.gameStartedAtMs;
        this._scroll = Math.round(ms / (1000 - this._SPEED * 2000));

        if (this._scrollPref === this._scroll) {
            return null;
        } else {
            this._updateShapePixelsArrs(this._scrollPref - this._scroll);
            this._scrollPref = this._scroll;
            return this._shapes;
        }
    }

    _updateShapePixelsArrs(offset: number): void {
        const max = this._max;

        this._shapes.forEach((shape, index) => {
            this._updateShape(shape, index, offset);
        });

        max.stalactite += offset;
        max.stalagmite += offset;

        if (max.stalactite < this._LEVEL_WIDTH) {
            max.stalactite = this._spawnStalactite(max.stalactite + 1);
        }

        if (max.stalagmite < this._LEVEL_WIDTH) {
            max.stalagmite = this._spawnStalagmite(max.stalagmite + 1);
        }
    }

    _updateShape(shape: Shape, index: number, offset: number): void {
        const translate = shape.transform.translate;

        const gameTileNormalized = Math.abs(translate[0]) / GAME.TILE;
        if (gameTileNormalized - shape.bbox().width > this._LEVEL_WIDTH) {
            // No longer visible, despawn shape.
            this._shapes.splice(index, 1);
        } else {
            // Visible, move shape.
            translate[0] += offset * GAME.TILE;
        }
    }

    _scrambleDecimals(seed: number, cutat: number): number {
        const max = 16;
        const pow = Math.pow(10, max);
        cutat = cutat % max;
        const dec0 = (seed * Math.pow(10, cutat)) / pow;
        const dec1 = ((seed * pow) / Math.pow(10, max - cutat)) % 1;
        return dec0 + dec1;
    }

    private _random(range: number[]): number {
        this.seed = this._scrambleDecimals(this.seed, ++this.seedIteration);
        return range[0] + Math.floor(this.seed * (range[1] - range[0] + 1));
    }

    _spawnStalactite(x0: number): number {
        const x1 = x0 + this._random(this._BUMP_WIDTH);
        this._spawnFormation(true, x0, x1);
        return x1;
    }

    _spawnStalagmite(x0: number): number {
        const x1 = x0 + this._random(this._BUMP_WIDTH);
        this._spawnFormation(false, x0, x1);
        return x1;
    }

    _spawnFormation(isStalactite: boolean, x0: number, x1: number): void {
        const y1 = this._random(this._BUMP_HEIGHT);
        const shape = new Shape();

        for (let y0 = 0; y0 < y1; y0++) {
            let xRow1Prev = x1;
            if (y0) {
                x0 += this._random(this._BUMP_DECREASE);
                x1 -= this._random(this._BUMP_DECREASE);
            }
            const y0Ite = isStalactite ? y0 : this._LEVEL_HEIGHT - y0 - 1;
            if (x0 < x1 && x1 <= xRow1Prev) {
                shape.add(line(x0, y0Ite, x1, y0Ite));
                xRow1Prev = x1;
            } else {
                break;
            }
        }

        this._shapes.push(shape);
    }
}
