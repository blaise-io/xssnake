import { State } from "../../client/state/state";
import { LevelAnimationRegistry } from "../levelanim/registry";
import { Config } from "../levelset/config";

export class Level {
    private animations: any;
    private gravity: any;
    private data: any;

    constructor(public config: Config) {
        this.config = config;
        this.animations = new LevelAnimationRegistry();
        this.gravity = new xss.level.Gravity(this.config.gravity);
        this.data = config.level.cache || null;
    }

    public registerAnimations() {
        // noop?
    }

    /**
     * Client-Only!
     * TODO: Create and add to xss.level.ClientLevel instead.
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
     * TODO: Create and add to xss.level.ClientLevel instead.
     */
    public paint() {
        if (__IS_CLIENT__) {
            State.shapes.level = new xss.Shape(this.data.walls);
            State.shapes.level.setGameTransform();
            State.shapes.innerborder = xss.shapegen.innerBorder();
            xss.shapegen.outerBorder(function(k, border) {
                State.shapes[k] = border;
            });
        }
    }

    public preload(continueFn) {
        var level = this.config.level;
        if (level.cache) {
            continueFn();
        } else {
            new xss.level.ImageDecoder(level.imagedata).then(function(data) {
                level.cache = new xss.level.Data(data, this.animations);
                level.imagedata = null;
                this.data = level.cache;
                this.registerAnimations();
                continueFn();
            }.bind(this));
        }
    }
};
