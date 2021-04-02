import { ImageDecoder } from "../../client/level/imageDecoder";
import { State } from "../../client/state/state";
import { innerBorder, outerBorder } from "../../client/ui/clientShapes";
import { LevelAnimationRegistry } from "../levelanim/registry";
import { Config } from "../levelset/config";
import { Shape } from "../shape";
import { LevelData } from "./data";
import { Gravity } from "./gravity";

export class Level {
    animations: any;
    gravity: any;
    data: any;

    constructor(public config: Config) {
        this.config = config;
        this.animations = new LevelAnimationRegistry();
        this.gravity = new Gravity(this.config.gravity);
        this.data = config.level.cache || null;
    }

    public registerAnimations() {
        // noop?
    }

    /**
     * Client-Only!
     * TODO: Create and add to level.ClientLevel instead.
     */
    public destruct() {
        if (__IS_CLIENT__) {
            State.shapes.level = null;
            State.shapes.innerborder = null;
            outerBorder(function(k) {
                State.shapes[k] = null;
            });
        }
    }

    /**
     * Client-Only!
     * TODO: Create and add to level.ClientLevel instead.
     */
    public paint() {
        if (__IS_CLIENT__) {
            State.shapes.level = new Shape(this.data.walls);
            State.shapes.level.setGameTransform();
            State.shapes.innerborder = innerBorder();
            outerBorder(function(k, border) {
                State.shapes[k] = border;
            });
        }
    }

    public preload(continueFn) {
        const level = this.config.level;
        if (level.cache) {
            continueFn();
        } else {
            new ImageDecoder(level.imagedata).then(function(data) {
                level.cache = new LevelData(data, this.animations);
                level.imagedata = null;
                this.data = level.cache;
                this.registerAnimations();
                continueFn();
            }.bind(this));
        }
    }
}
